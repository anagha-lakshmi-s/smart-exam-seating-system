package com.seatsync.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ExamRequest(
        @NotNull(message = "Please select a subject.") Long subjectId,
        @NotNull(message = "Exam date is required.") LocalDate date,
        @NotNull(message = "Start time is required.") LocalTime startTime,
        @NotNull(message = "End time is required.") LocalTime endTime,
        @NotEmpty(message = "Select at least one branch.") List<String> branches) {
}