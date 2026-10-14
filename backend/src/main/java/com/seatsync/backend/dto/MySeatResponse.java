package com.seatsync.backend.dto;

import com.seatsync.backend.dto.ArrangementResponse.HallArrangement;
import com.seatsync.backend.dto.ArrangementResponse.StudentInfo;

public record MySeatResponse(
        String status,
        StudentInfo student,
        String date,
        String startTime,
        String endTime,
        String hallName,
        Integer row,
        Integer bench,
        Integer seat,
        String reason,
        HallArrangement hallArrangement) {
}