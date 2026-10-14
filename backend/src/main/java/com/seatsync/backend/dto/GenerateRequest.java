package com.seatsync.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public record GenerateRequest(
        @NotNull(message = "Exam date is required.") LocalDate date,
        @NotNull(message = "Start time is required.") LocalTime startTime,
        @NotNull(message = "branchBeside is required.") Boolean branchBeside,
        @NotNull(message = "subjectBeside is required.") Boolean subjectBeside,
        @NotNull(message = "branchFront is required.") Boolean branchFront,
        @NotNull(message = "subjectFront is required.") Boolean subjectFront) {
}