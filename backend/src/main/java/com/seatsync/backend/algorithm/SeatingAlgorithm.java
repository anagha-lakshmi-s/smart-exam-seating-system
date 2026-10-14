package com.seatsync.backend.algorithm;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Constraint-based seating algorithm. Plain Java: no Spring, no database.
 *
 * Idea: go through the seats one by one (hall by hall, row by row, left to right).
 * For each seat try the student groups, largest remaining group first, and only
 * accept a group if it does not break an enabled rule against the seats already
 * filled to the left and in front. If the search gets stuck it backtracks (undoes
 * recent choices and tries alternatives) within a step limit. Whatever cannot be
 * placed without breaking a rule is returned as unplaced.
 */
public class SeatingAlgorithm {

    /** A physical seat. col = position counted from the left of the row, across benches. */
    public record SeatSpot(long seatId, long hallId, int row, int col) {
    }

    /** A student to place. */
    public record Candidate(long studentId, String branch, String subject) {
    }

    public record Rules(boolean branchBeside, boolean subjectBeside,
                        boolean branchFront, boolean subjectFront) {
    }

    public record Result(Map<Long, Long> seatByStudentId,
                         List<Long> unplacedStudentIds,
                         int emptySeats,
                         int violations,
                         boolean searchCompleted) {
    }

    private static final int STEP_LIMIT = 300_000;

    // ---- search state (reset on every call to allocate) ----
    private int seatCount;
    private int[] left;
    private int[] up;
    private int[] assigned;
    private int[] remaining;
    private int[] bestAssigned;
    private String[] typeBranch;
    private String[] typeSubject;
    private Rules rules;
    private int totalStudents;
    private int totalRemaining;
    private int bestPlaced;
    private int steps;
    private boolean aborted;

    public Result allocate(List<SeatSpot> seatList, List<Candidate> candidates, Rules rules) {
        this.rules = rules;

        // 1. Seats in a fixed order: hall, row, column
        List<SeatSpot> seats = new ArrayList<>(seatList);
        seats.sort(Comparator.comparingLong(SeatSpot::hallId)
                .thenComparingInt(SeatSpot::row)
                .thenComparingInt(SeatSpot::col));
        seatCount = seats.size();

        // 2. Neighbours: the seat to the left and the seat in front (both come earlier in the order)
        Map<String, Integer> indexByPosition = new HashMap<>();
        for (int i = 0; i < seatCount; i++) {
            SeatSpot s = seats.get(i);
            indexByPosition.put(s.hallId() + ":" + s.row() + ":" + s.col(), i);
        }
        left = new int[seatCount];
        up = new int[seatCount];
        for (int i = 0; i < seatCount; i++) {
            SeatSpot s = seats.get(i);
            left[i] = indexByPosition.getOrDefault(s.hallId() + ":" + s.row() + ":" + (s.col() - 1), -1);
            up[i] = indexByPosition.getOrDefault(s.hallId() + ":" + (s.row() - 1) + ":" + s.col(), -1);
        }

        // 3. Students with the same branch and subject are interchangeable, so group them
        TreeMap<String, Deque<Candidate>> groups = new TreeMap<>();
        List<Candidate> sortedCandidates = new ArrayList<>(candidates);
        sortedCandidates.sort(Comparator.comparingLong(Candidate::studentId));
        for (Candidate c : sortedCandidates) {
            groups.computeIfAbsent(c.branch() + "|" + c.subject(), k -> new ArrayDeque<>()).add(c);
        }
        int typeCount = groups.size();
        typeBranch = new String[typeCount];
        typeSubject = new String[typeCount];
        remaining = new int[typeCount];
        List<Deque<Candidate>> pools = new ArrayList<>();
        int t = 0;
        for (Deque<Candidate> group : groups.values()) {
            Candidate first = group.peekFirst();
            typeBranch[t] = first.branch();
            typeSubject[t] = first.subject();
            remaining[t] = group.size();
            pools.add(group);
            t++;
        }
        totalStudents = candidates.size();
        totalRemaining = totalStudents;

        // 4. Search
        assigned = new int[seatCount];
        Arrays.fill(assigned, -1);
        bestAssigned = null;
        bestPlaced = -1;
        steps = 0;
        aborted = false;
        search(0, 0);

        // 5. Turn the best result into real students and seats
        Map<Long, Long> seatByStudent = new LinkedHashMap<>();
        int[] finalAssigned = bestAssigned != null ? bestAssigned : assigned;
        for (int i = 0; i < seatCount; i++) {
            if (finalAssigned[i] >= 0) {
                Candidate c = pools.get(finalAssigned[i]).pollFirst();
                seatByStudent.put(c.studentId(), seats.get(i).seatId());
            }
        }
        List<Long> unplaced = new ArrayList<>();
        for (Deque<Candidate> group : pools) {
            for (Candidate c : group) {
                unplaced.add(c.studentId());
            }
        }

        int violations = countViolations(finalAssigned);
        int emptySeats = seatCount - seatByStudent.size();
        return new Result(seatByStudent, unplaced, emptySeats, violations, !aborted);
    }

    private void search(int i, int placed) {
        steps++;
        if (steps > STEP_LIMIT) {
            aborted = true;
            return;
        }
        // Even in the best case this branch cannot place more students than we already have
        if (placed + Math.min(totalRemaining, seatCount - i) <= bestPlaced) {
            return;
        }
        if (i == seatCount || totalRemaining == 0) {
            bestPlaced = placed;
            bestAssigned = assigned.clone();
            return;
        }

        // Largest remaining group first (the hardest group to spread out)
        Integer[] order = new Integer[remaining.length];
        for (int k = 0; k < order.length; k++) {
            order[k] = k;
        }
        Arrays.sort(order, (a, b) -> remaining[b] != remaining[a]
                ? Integer.compare(remaining[b], remaining[a]) : Integer.compare(a, b));

        for (int type : order) {
            if (remaining[type] == 0 || !fits(i, type)) {
                continue;
            }
            assigned[i] = type;
            remaining[type]--;
            totalRemaining--;
            search(i + 1, placed + 1);
            remaining[type]++;
            totalRemaining++;
            assigned[i] = -1;
            if (bestPlaced == totalStudents || aborted) {
                return;
            }
        }

        // Last option: leave this seat empty
        search(i + 1, placed);
    }

    /** Would putting this type of student on seat i break an enabled rule? */
    private boolean fits(int i, int type) {
        if (left[i] >= 0 && assigned[left[i]] >= 0) {
            int other = assigned[left[i]];
            if (rules.branchBeside() && typeBranch[type].equals(typeBranch[other])) {
                return false;
            }
            if (rules.subjectBeside() && typeSubject[type].equals(typeSubject[other])) {
                return false;
            }
        }
        if (up[i] >= 0 && assigned[up[i]] >= 0) {
            int other = assigned[up[i]];
            if (rules.branchFront() && typeBranch[type].equals(typeBranch[other])) {
                return false;
            }
            if (rules.subjectFront() && typeSubject[type].equals(typeSubject[other])) {
                return false;
            }
        }
        return true;
    }

    /** Independent re-check of the finished arrangement. Must always be 0. */
    private int countViolations(int[] result) {
        int violations = 0;
        for (int i = 0; i < seatCount; i++) {
            if (result[i] < 0) {
                continue;
            }
            if (left[i] >= 0 && result[left[i]] >= 0) {
                int other = result[left[i]];
                if (rules.branchBeside() && typeBranch[result[i]].equals(typeBranch[other])) {
                    violations++;
                }
                if (rules.subjectBeside() && typeSubject[result[i]].equals(typeSubject[other])) {
                    violations++;
                }
            }
            if (up[i] >= 0 && result[up[i]] >= 0) {
                int other = result[up[i]];
                if (rules.branchFront() && typeBranch[result[i]].equals(typeBranch[other])) {
                    violations++;
                }
                if (rules.subjectFront() && typeSubject[result[i]].equals(typeSubject[other])) {
                    violations++;
                }
            }
        }
        return violations;
    }
}