package com.seatsync.backend.dto;

import java.util.List;

public record StudentImportResult(int created, int skipped, List<RowError> errors) {

    public record RowError(int row, String rollNo, String message) {
    }
}