package com.seatsync.backend.dto;

import java.util.List;

public record ArrangementResponse(
        boolean generated,
        String date,
        String startTime,
        Summary summary,
        List<HallArrangement> halls,
        List<UnplacedStudent> unplaced) {

    public record Summary(int totalStudents, int assigned, int unplaced, int totalSeats,
                          int emptySeats, int hallsUsed, int violations) {
    }

    public record HallInfo(Long id, String name, int rows, int benches, int seatsPerBench, int capacity) {
    }

    public record HallArrangement(HallInfo hall, List<SeatCell> seats, int assigned) {
    }

    public record SeatCell(Long seatId, int row, int bench, int seat, StudentInfo student) {
    }

    public record StudentInfo(String rollNo, String name, String branch, String type, String subject) {
    }

    public record UnplacedStudent(String rollNo, String name, String branch, String type,
                                  String subject, String reason) {
    }
}