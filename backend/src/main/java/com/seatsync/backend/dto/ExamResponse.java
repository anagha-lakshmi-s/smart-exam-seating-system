package com.seatsync.backend.dto;

import java.util.List;

public record ExamResponse(
        Long id,
        Long subjectId,
        String subjectCode,
        String subjectName,
        String date,
        String startTime,
        String endTime,
        List<String> branches) {
}