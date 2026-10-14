package com.seatsync.backend.algorithm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.seatsync.backend.algorithm.SeatingAlgorithm.Candidate;
import com.seatsync.backend.algorithm.SeatingAlgorithm.Result;
import com.seatsync.backend.algorithm.SeatingAlgorithm.Rules;
import com.seatsync.backend.algorithm.SeatingAlgorithm.SeatSpot;

class SeatingAlgorithmTest {

    private static final Rules ALL_RULES = new Rules(true, true, true, true);
    private static final Rules NO_RULES = new Rules(false, false, false, false);

    private long nextStudentId = 1;

    // ---------- helpers ----------

    /** Builds the seats of one hall: rows x benches x seatsPerBench. */
    private List<SeatSpot> hall(long hallId, long firstSeatId, int rows, int benches, int seatsPerBench) {
        List<SeatSpot> seats = new ArrayList<>();
        long id = firstSeatId;
        for (int r = 1; r <= rows; r++) {
            for (int b = 1; b <= benches; b++) {
                for (int s = 1; s <= seatsPerBench; s++) {
                    seats.add(new SeatSpot(id++, hallId, r, (b - 1) * seatsPerBench + (s - 1)));
                }
            }
        }
        return seats;
    }

    /** Creates n students of one branch. The subject is named after the branch. */
    private List<Candidate> students(String branch, int n) {
        List<Candidate> list = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            list.add(new Candidate(nextStudentId++, branch, "SUBJ-" + branch));
        }
        return list;
    }

    private List<Candidate> join(List<Candidate> a, List<Candidate> b) {
        List<Candidate> all = new ArrayList<>(a);
        all.addAll(b);
        return all;
    }

    /** Independent check: no two neighbours share a branch or subject when the rule is on. */
    private int countConflicts(List<SeatSpot> seats, List<Candidate> students, Result result, Rules rules) {
        Map<Long, Candidate> studentById = new HashMap<>();
        for (Candidate c : students) {
            studentById.put(c.studentId(), c);
        }
        Map<String, Candidate> studentAtPosition = new HashMap<>();
        Map<Long, SeatSpot> seatById = new HashMap<>();
        for (SeatSpot s : seats) {
            seatById.put(s.seatId(), s);
        }
        for (Map.Entry<Long, Long> e : result.seatByStudentId().entrySet()) {
            SeatSpot s = seatById.get(e.getValue());
            studentAtPosition.put(s.hallId() + ":" + s.row() + ":" + s.col(), studentById.get(e.getKey()));
        }

        int conflicts = 0;
        for (Map.Entry<Long, Long> e : result.seatByStudentId().entrySet()) {
            SeatSpot s = seatById.get(e.getValue());
            Candidate me = studentById.get(e.getKey());
            Candidate beside = studentAtPosition.get(s.hallId() + ":" + s.row() + ":" + (s.col() + 1));
            Candidate behind = studentAtPosition.get(s.hallId() + ":" + (s.row() + 1) + ":" + s.col());
            if (beside != null) {
                if (rules.branchBeside() && me.branch().equals(beside.branch())) conflicts++;
                if (rules.subjectBeside() && me.subject().equals(beside.subject())) conflicts++;
            }
            if (behind != null) {
                if (rules.branchFront() && me.branch().equals(behind.branch())) conflicts++;
                if (rules.subjectFront() && me.subject().equals(behind.subject())) conflicts++;
            }
        }
        return conflicts;
    }

    private void assertNoDuplicates(Result result) {
        Set<Long> seatsUsed = new HashSet<>(result.seatByStudentId().values());
        assertEquals(result.seatByStudentId().size(), seatsUsed.size(), "A seat was given to two students");
        Set<Long> placed = new HashSet<>(result.seatByStudentId().keySet());
        placed.retainAll(new HashSet<>(result.unplacedStudentIds()));
        assertTrue(placed.isEmpty(), "A student is both placed and unplaced");
    }

    // ---------- tests ----------

    @Test
    void smallNumberOfStudents_allPlacedWithoutConflicts() {
        List<SeatSpot> seats = hall(1, 1, 2, 2, 2);
        List<Candidate> students = join(students("CSE", 3), students("ECE", 3));

        Result result = new SeatingAlgorithm().allocate(seats, students, ALL_RULES);

        assertEquals(6, result.seatByStudentId().size());
        assertEquals(0, result.unplacedStudentIds().size());
        assertEquals(0, result.violations());
        assertEquals(0, countConflicts(seats, students, result, ALL_RULES));
        assertNoDuplicates(result);
    }

    @Test
    void multipleHalls_studentsSpreadAcrossHalls() {
        List<SeatSpot> seats = new ArrayList<>(hall(1, 1, 5, 6, 2));
        seats.addAll(hall(2, 1001, 5, 6, 2));
        seats.addAll(hall(3, 2001, 5, 8, 2));
        List<Candidate> students = new ArrayList<>();
        for (String branch : new String[] {"CSE", "ECE", "MECH", "CIVIL", "EEE"}) {
            students.addAll(students(branch, 36));
        }

        Result result = new SeatingAlgorithm().allocate(seats, students, ALL_RULES);

        assertEquals(180, result.seatByStudentId().size());
        assertEquals(0, result.unplacedStudentIds().size());
        assertEquals(20, result.emptySeats());
        assertEquals(0, countConflicts(seats, students, result, ALL_RULES));
        assertNoDuplicates(result);
    }

    @Test
    void moreStudentsThanSeats_extraStudentsAreUnplaced() {
        List<SeatSpot> seats = hall(1, 1, 5, 6, 2);
        List<Candidate> students = new ArrayList<>();
        for (String branch : new String[] {"CSE", "ECE", "MECH", "CIVIL", "EEE"}) {
            students.addAll(students(branch, 20));
        }

        Result result = new SeatingAlgorithm().allocate(seats, students, ALL_RULES);

        assertEquals(60, result.seatByStudentId().size());
        assertEquals(40, result.unplacedStudentIds().size());
        assertEquals(0, result.emptySeats());
        assertEquals(0, countConflicts(seats, students, result, ALL_RULES));
        assertNoDuplicates(result);
    }

    @Test
    void onlyOneBranch_cannotAllBePlacedAndNoRuleIsBroken() {
        List<SeatSpot> seats = hall(1, 1, 3, 3, 2);
        List<Candidate> students = students("CSE", 12);

        Result result = new SeatingAlgorithm().allocate(seats, students, ALL_RULES);

        assertEquals(9, result.seatByStudentId().size());
        assertEquals(3, result.unplacedStudentIds().size());
        assertTrue(result.emptySeats() > 0, "Free seats remain, so the reason is the rules");
        assertEquals(0, result.violations());
        assertEquals(0, countConflicts(seats, students, result, ALL_RULES));
    }

    @Test
    void sameSubjectForSeveralBranches_subjectRuleIsRespected() {
        List<SeatSpot> seats = hall(1, 1, 4, 4, 2);
        List<Candidate> students = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            students.add(new Candidate(nextStudentId++, "CSE", "MATHS"));
            students.add(new Candidate(nextStudentId++, "ECE", "MATHS"));
        }
        Rules subjectOnly = new Rules(false, true, false, true);

        Result result = new SeatingAlgorithm().allocate(seats, students, subjectOnly);

        assertEquals(0, countConflicts(seats, students, result, subjectOnly));
        assertEquals(0, result.violations());
        assertNoDuplicates(result);
    }

    @Test
    void exactFit_twoBranchesFillAHallLikeAChessboard() {
        List<SeatSpot> seats = hall(1, 1, 5, 6, 2);
        List<Candidate> students = join(students("CSE", 30), students("ECE", 30));

        Result result = new SeatingAlgorithm().allocate(seats, students, ALL_RULES);

        assertEquals(60, result.seatByStudentId().size());
        assertEquals(0, result.unplacedStudentIds().size());
        assertEquals(0, countConflicts(seats, students, result, ALL_RULES));
    }

    @Test
    void noRulesEnabled_everyoneIsPlaced() {
        List<SeatSpot> seats = hall(1, 1, 3, 3, 2);
        List<Candidate> students = students("CSE", 12);

        Result result = new SeatingAlgorithm().allocate(seats, students, NO_RULES);

        assertEquals(12, result.seatByStudentId().size());
        assertEquals(0, result.unplacedStudentIds().size());
    }

    @Test
    void noStudents_nothingIsAssigned() {
        List<SeatSpot> seats = hall(1, 1, 2, 2, 2);

        Result result = new SeatingAlgorithm().allocate(seats, new ArrayList<>(), ALL_RULES);

        assertEquals(0, result.seatByStudentId().size());
        assertEquals(0, result.unplacedStudentIds().size());
        assertEquals(8, result.emptySeats());
    }

    @Test
    void sameInputGivesSameArrangement() {
        List<SeatSpot> seats = hall(1, 1, 4, 4, 2);
        List<Candidate> students = join(students("CSE", 10), join(students("ECE", 10), students("MECH", 10)));

        Result first = new SeatingAlgorithm().allocate(seats, students, ALL_RULES);
        Result second = new SeatingAlgorithm().allocate(seats, students, ALL_RULES);

        assertEquals(first.seatByStudentId(), second.seatByStudentId());
    }

    @Test
    void regenerationAfterHallRemoved_usesRemainingHalls() {
        List<SeatSpot> twoHalls = new ArrayList<>(hall(1, 1, 5, 6, 2));
        twoHalls.addAll(hall(2, 1001, 5, 6, 2));
        List<SeatSpot> oneHall = hall(1, 1, 5, 6, 2);
        List<Candidate> students = new ArrayList<>();
        for (String branch : new String[] {"CSE", "ECE", "MECH", "CIVIL"}) {
            students.addAll(students(branch, 25));
        }

        Result before = new SeatingAlgorithm().allocate(twoHalls, students, ALL_RULES);
        Result after = new SeatingAlgorithm().allocate(oneHall, students, ALL_RULES);

        assertEquals(100, before.seatByStudentId().size());
        assertEquals(60, after.seatByStudentId().size());
        assertEquals(40, after.unplacedStudentIds().size());
        assertEquals(0, countConflicts(oneHall, students, after, ALL_RULES));
    }
}