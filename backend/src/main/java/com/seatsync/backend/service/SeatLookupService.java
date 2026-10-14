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

import com.seatsync.backend.dto.ArrangementResponse.HallArrangement;
import com.seatsync.backend.dto.ArrangementResponse.StudentInfo;
import com.seatsync.backend.dto.MySeatResponse;
import com.seatsync.backend.dto.SlotResponse;
import com.seatsync.backend.entity.Exam;
import com.seatsync.backend.entity.Hall;
import com.seatsync.backend.entity.Seat;
import com.seatsync.backend.entity.Seating;
import com.seatsync.backend.entity.Student;
import com.seatsync.backend.exception.ResourceNotFoundException;
import com.seatsync.backend.repository.ExamRepository;
import com.seatsync.backend.repository.SeatingRepository;
import com.seatsync.backend.repository.StudentRepository;

@Service
@Transactional(readOnly = true)
public class SeatLookupService {

    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;
    private final SeatingRepository seatingRepository;
    private final SeatingService seatingService;

    public SeatLookupService(StudentRepository studentRepository, ExamRepository examRepository,
                             SeatingRepository seatingRepository, SeatingService seatingService) {
        this.studentRepository = studentRepository;
        this.examRepository = examRepository;
        this.seatingRepository = seatingRepository;
        this.seatingService = seatingService;
    }

    /** Exams that share a date and start time form one slot. */
    public List<SlotResponse> getSlots() {
        List<Exam> exams = examRepository.findAll(Sort.by("examDate", "startTime"));
        Map<String, List<Exam>> grouped = new LinkedHashMap<>();
        for (Exam exam : exams) {
            String key = exam.getExamDate() + "|" + exam.getStartTime();
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(exam);
        }

        List<SlotResponse> slots = new ArrayList<>();
        for (List<Exam> group : grouped.values()) {
            Exam first = group.get(0);
            LocalTime end = group.stream()
                    .map(Exam::getEndTime)
                    .max(Comparator.naturalOrder())
                    .orElse(first.getEndTime());
            boolean generated = seatingRepository.existsBySlotDateAndSlotStart(
                    first.getExamDate(), first.getStartTime());
            slots.add(new SlotResponse(first.getExamDate().toString(), first.getStartTime().toString(),
                    end.toString(), group.size(), generated));
        }
        return slots;
    }

    public MySeatResponse findMySeat(String rollNo) {
        Student student = studentRepository.findByRollNoIgnoreCase(rollNo.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No student found with this roll number. Please check and try again."));

        // Newest first. Pick the soonest slot from today onwards, otherwise the latest one.
        List<Seating> all = seatingRepository.findByStudentIdOrderBySlotDateDescSlotStartDesc(student.getId());
        if (all.isEmpty()) {
            throw new ResourceNotFoundException("No seat has been generated for this student yet.");
        }
        LocalDate today = LocalDate.now();
        Seating chosen = all.get(0);
        for (int i = all.size() - 1; i >= 0; i--) {
            if (!all.get(i).getSlotDate().isBefore(today)) {
                chosen = all.get(i);
                break;
            }
        }

        StudentInfo info = seatingService.studentInfo(chosen);
        String date = chosen.getSlotDate().toString();
        String start = chosen.getSlotStart().toString();
        String end = chosen.getExam().getEndTime().toString();

        if (chosen.getSeat() == null) {
            return new MySeatResponse("UNPLACED", info, date, start, end,
                    null, null, null, null, chosen.getReason(), null);
        }

        Seat seat = chosen.getSeat();
        Hall hall = seat.getHall();
        Map<Long, Seating> bySeat = new HashMap<>();
        for (Seating s : seatingRepository.findBySlotDateAndSlotStart(chosen.getSlotDate(), chosen.getSlotStart())) {
            if (s.getSeat() != null) {
                bySeat.put(s.getSeat().getId(), s);
            }
        }
        HallArrangement hallArrangement = seatingService.buildHallArrangement(hall, bySeat);
        return new MySeatResponse("ASSIGNED", info, date, start, end,
                hall.getName(), seat.getRowNo(), seat.getBenchNo(), seat.getSeatNo(), null, hallArrangement);
    }
}