
package com.seatsync.backend.dto;

import java.util.List;

public record StudentImportRequest(List<Row> rows) {

    public record Row(
            String rollNo,
            String name,
            String branch,
            String semester,
            String type,
            String password
    ) {
    }
}
