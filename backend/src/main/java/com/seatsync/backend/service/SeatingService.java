package com.seatsync.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seatsync.backend.algorithm.SeatingAlgorithm;
import com.seatsync.backend.algorithm.SeatingAlgorithm.Candidate;
import com.seatsync.backend.algorithm.SeatingAlgorithm.Result;
import com.seatsync.backend.algorithm.SeatingAlgorithm.Rules;
import com.seatsync.backend.algorithm.SeatingAlgorithm.SeatSpot;
import com.seatsync.backend.dto.ArrangementResponse;
import com.seatsync.backend.dto.ArrangementResponse.HallArrangement;
import com.seatsync.backend.dto.ArrangementResponse.HallInfo;
import com.seatsync.backend.dto.ArrangementResponse.SeatCell;
import com.seatsync.backend.dto.ArrangementResponse.StudentInfo;
import com.seatsync.backend.dto.ArrangementResponse.Summary;
import com.seatsync.backend.dto.ArrangementResponse.UnplacedStudent;
import com.seatsync.backend.dto.GenerateRequest;
import com.seatsync.backend.entity.Exam;
import com.seatsync.backend.entity.Hall;
import com.seatsync.backend.entity.Seat;
import com.seatsync.backend.entity.Seating;
import com.seatsync.backend.entity.Student;
import com.seatsync.backend.exception.BadRequestException;
import com.seatsync.backend.repository.ExamRepository;
import com.seatsync.backend.repository.HallRepository;
import com.seatsync.backend.repository.SeatRepository;
import com.seatsync.backend.repository.SeatingRepository;
import com.seatsync.backend.repository.StudentRepository;

@Service
@Transactional
public class SeatingService {

    private static final String CONSTRAINT_REASON =
            "This student could not be assigned because all remaining available seats "
                    + "would violate the selected seating constraints.";

    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final SeatingRepository seatingRepository;
    private final SeatService seatService;

    public SeatingService(ExamRepository examRepository, StudentRepository studentRepository,
                          HallRepository hallRepository, SeatRepository seatRepository,
                          SeatingRepository seatingRepository, SeatService seatService) {
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.hallRepository = hallRepository;
        this.seatRepository = seatRepository;
        this.seatingRepository = seatingRepository;
        this.seatService = seatService;
    }

    public ArrangementResponse generate(GenerateRequest request) {
        Rules rules = new Rules(request.branchBeside(), request.subjectBeside(),
                request.branchFront(), request.subjectFront());
        if (!rules.branchBeside() && !rules.subjectBeside() && !rules.branchFront() && !rules.subjectFront()) {
            throw new BadRequestException("Enable at least one seating constraint.");
        }
        LocalDate date = request.date();
        LocalTime start = request.startTime();

        // 1. Exams in this slot, and which exam each branch writes
        List<Exam> exams = examRepository.findByExamDateAndStartTimeOrderById(date, start);
        if (exams.isEmpty()) {
            throw new BadRequestException("No exams are scheduled for this date and time.");
        }
        Map<String, Exam> examByBranch = new LinkedHashMap<>();
        for (Exam exam : exams) {
            for (String branch : exam.getBranches()) {
                examByBranch.putIfAbsent(branch, exam);
            }
        }

        // 2. Eligible students: right branch, not absent
        List<Student> students = studentRepository.findAll(Sort.by("rollNo")).stream()
                .filter(s -> !Boolean.TRUE.equals(s.getAbsent()))
                .filter(s -> examByBranch.containsKey(s.getBranch()))
                .toList();
        if (students.isEmpty()) {
            throw new BadRequestException("No eligible students were found for the exams in this slot.");
        }

        // 3. Available halls and all their seats
        List<Hall> halls = hallRepository.findByAvailableTrueOrderByName();
        if (halls.isEmpty()) {
            throw new BadRequestException("No halls are available. Mark at least one hall as available.");
        }
        List<Seat> allSeats = new ArrayList<>();
        List<SeatSpot> spots = new ArrayList<>();
        for (Hall hall : halls) {
            seatService.ensureSeats(hall);
            for (Seat seat : seatRepository.findByHallIdOrderByRowNoAscBenchNoAscSeatNoAsc(hall.getId())) {
                allSeats.add(seat);
                int col = (seat.getBenchNo() - 1) * hall.getSeatsPerBench() + (seat.getSeatNo() - 1);
                spots.add(new SeatSpot(seat.getId(), hall.getId(), seat.getRowNo(), col));
            }
        }

        // 4. Run the algorithm (subject = the subject of the student's exam)
        List<Candidate> candidates = new ArrayList<>();
        for (Student s : students) {
            String subject = examByBranch.get(s.getBranch()).getSubject().getCode();
            candidates.add(new Candidate(s.getId(), s.getBranch(), subject));
        }
        Result result = new SeatingAlgorithm().allocate(spots, candidates, rules);
        if (result.violations() > 0) {
            throw new IllegalStateException("The arrangement broke a seating rule, so it was not saved.");
        }

        // 5. Replace the old arrangement for this slot with the new one
        seatingRepository.deleteBySlotDateAndSlotStart(date, start);
        seatingRepository.flush();

        Map<Long, Seat> seatById = new HashMap<>();
        for (Seat seat : allSeats) {
            seatById.put(seat.getId(), seat);
        }
        String unplacedReason = result.emptySeats() == 0
                ? "This student could not be assigned because there are not enough available seats ("
                        + allSeats.size() + " seats for " + students.size() + " students)."
                : CONSTRAINT_REASON;

        List<Seating> rows = new ArrayList<>();
        for (Student s : students) {
            Exam exam = examByBranch.get(s.getBranch());
            Long seatId = result.seatByStudentId().get(s.getId());
            if (seatId != null) {
                rows.add(Seating.assigned(date, start, exam, s, seatById.get(seatId)));
            } else {
                rows.add(Seating.unplaced(date, start, exam, s, unplacedReason));
            }
        }
        seatingRepository.saveAll(rows);

        return getArrangement(date, start);
    }

    @Transactional(readOnly = true)
    public ArrangementResponse getArrangement(LocalDate date, LocalTime startTime) {
        List<Seating> rows = seatingRepository.findBySlotDateAndSlotStart(date, startTime);
        if (rows.isEmpty()) {
            return new ArrangementResponse(false, date.toString(), startTime.toString(),
                    new Summary(0, 0, 0, 0, 0, 0, 0), List.of(), List.of());
        }

        Map<Long, Seating> bySeat = new HashMap<>();
        Map<Long, Hall> hallsUsed = new LinkedHashMap<>();
        List<UnplacedStudent> unplaced = new ArrayList<>();

        for (Seating row : rows) {
            if (row.getSeat() != null) {
                bySeat.put(row.getSeat().getId(), row);
                Hall hall = row.getSeat().getHall();
                hallsUsed.putIfAbsent(hall.getId(), hall);
            } else {
                Student s = row.getStudent();
                unplaced.add(new UnplacedStudent(s.getRollNo(), s.getName(), s.getBranch(), s.getType(),
                        subjectLabel(row.getExam()), row.getReason()));
            }
        }
        unplaced.sort(Comparator.comparing(UnplacedStudent::rollNo));

        List<Hall> halls = new ArrayList<>(hallsUsed.values());
        halls.sort(Comparator.comparing(Hall::getName));

        List<HallArrangement> hallArrangements = new ArrayList<>();
        int totalSeats = 0;
        for (Hall hall : halls) {
            hallArrangements.add(buildHallArrangement(hall, bySeat));
            totalSeats += hall.getCapacity();
        }
        int assigned = bySeat.size();
        Summary summary = new Summary(rows.size(), assigned, unplaced.size(), totalSeats,
                totalSeats - assigned, halls.size(), 0);
        return new ArrangementResponse(true, date.toString(), startTime.toString(),
                summary, hallArrangements, unplaced);
    }

    /** Every seat of the hall, with the student sitting there (or null for an empty seat). */
    public HallArrangement buildHallArrangement(Hall hall, Map<Long, Seating> bySeat) {
        List<SeatCell> cells = new ArrayList<>();
        int assigned = 0;
        for (Seat seat : seatRepository.findByHallIdOrderByRowNoAscBenchNoAscSeatNoAsc(hall.getId())) {
            Seating row = bySeat.get(seat.getId());
            StudentInfo info = null;
            if (row != null) {
                info = studentInfo(row);
                assigned++;
            }
            cells.add(new SeatCell(seat.getId(), seat.getRowNo(), seat.getBenchNo(), seat.getSeatNo(), info));
        }
        HallInfo hallInfo = new HallInfo(hall.getId(), hall.getName(), hall.getRows(),
                hall.getBenches(), hall.getSeatsPerBench(), hall.getCapacity());
        return new HallArrangement(hallInfo, cells, assigned);
    }

    public StudentInfo studentInfo(Seating row) {
        Student s = row.getStudent();
        return new StudentInfo(s.getRollNo(), s.getName(), s.getBranch(), s.getType(),
                subjectLabel(row.getExam()));
    }

    private String subjectLabel(Exam exam) {
        return exam.getSubject().getCode() + " - " + exam.getSubject().getName();
    }
}