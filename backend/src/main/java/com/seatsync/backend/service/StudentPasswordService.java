
package com.seatsync.backend.service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seatsync.backend.entity.Student;
import com.seatsync.backend.repository.StudentRepository;

@Service
public class StudentPasswordService {

    private static final int MAX_ROWS = 2000;

    private final StudentRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;

    public StudentPasswordService(
            StudentRepository repository,
            BCryptPasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public record PasswordRow(String rollNo, String password) {}

    public record BulkPasswordRequest(List<PasswordRow> rows) {}

    public record BulkPasswordResult(
            int updated,
            int failed,
            List<String> errors
    ) {}

    @Transactional
    public BulkPasswordResult assignPasswords(BulkPasswordRequest request) {

        int updated = 0;
        List<String> errors = new ArrayList<>();
        Set<String> processedRollNumbers = new HashSet<>();

        if (request == null || request.rows() == null) {
            return new BulkPasswordResult(
                    0, 1, List.of("No student records were provided."));
        }

        if (request.rows().size() > MAX_ROWS) {
            return new BulkPasswordResult(
                    0, request.rows().size(),
                    List.of("Too many rows. Assign passwords to at most "
                            + MAX_ROWS + " students at a time."));
        }

        for (PasswordRow row : request.rows()) {

            if (row == null || row.rollNo() == null
                    || row.password() == null) {
                errors.add("A row has missing register number or password.");
                continue;
            }

            String rollNo = row.rollNo().trim().toUpperCase();
            String password = row.password();

            if (rollNo.isBlank()) {
                errors.add("A row has an empty register number.");
                continue;
            }

            if (!processedRollNumbers.add(rollNo)) {
                errors.add(rollNo
                        + ": Duplicate register number in the file.");
                continue;
            }

            int passwordBytes = password.getBytes(StandardCharsets.UTF_8).length;

            if (password.length() < 8 || passwordBytes > 72) {
                errors.add(rollNo
                        + ": Password must contain at least 8 characters and not exceed 72 UTF-8 bytes.");
                continue;
            }

            Student student = repository.findByRollNoIgnoreCase(rollNo)
                    .orElse(null);

            if (student == null) {
                errors.add(rollNo + ": Student not found.");
                continue;
            }

            student.setPasswordHash(passwordEncoder.encode(password));
            repository.save(student);
            updated++;
        }

        return new BulkPasswordResult(
                updated, errors.size(), errors);
    }
}
