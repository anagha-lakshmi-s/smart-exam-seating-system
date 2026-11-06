
package com.seatsync.backend.service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seatsync.backend.dto.StudentImportRequest;
import com.seatsync.backend.dto.StudentImportRequest.Row;
import com.seatsync.backend.dto.StudentImportResult;
import com.seatsync.backend.dto.StudentImportResult.RowError;
import com.seatsync.backend.entity.Student;
import com.seatsync.backend.exception.BadRequestException;
import com.seatsync.backend.repository.StudentRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
@Transactional
public class StudentImportService {

    private static final int MAX_ROWS = 2000;

    private final StudentRepository repository;
    private final Validator validator;
    private final BCryptPasswordEncoder passwordEncoder;

    public StudentImportService(
            StudentRepository repository,
            Validator validator,
            BCryptPasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.validator = validator;
        this.passwordEncoder = passwordEncoder;
    }

    public StudentImportResult importStudents(StudentImportRequest request) {
        List<Row> rows = request == null ? null : request.rows();

        if (rows == null || rows.isEmpty()) {
            throw new BadRequestException("The file has no student rows.");
        }

        if (rows.size() > MAX_ROWS) {
            throw new BadRequestException(
                    "Too many rows. Import at most " + MAX_ROWS
                            + " students at a time.");
        }

        List<RowError> errors = new ArrayList<>();
        List<Student> valid = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (int i = 0; i < rows.size(); i++) {
            Row row = rows.get(i);
            int rowNumber = i + 2;

            if (row == null) {
                errors.add(new RowError(rowNumber, "", "This row is empty."));
                continue;
            }

            String roll = clean(row.rollNo()).toUpperCase();
            String password = row.password();

            if (password == null || password.isBlank()) {
                errors.add(new RowError(rowNumber, roll, "Password is required."));
                continue;
            }

            int passwordBytes = password.getBytes(StandardCharsets.UTF_8).length;

            if (password.length() < 8 || passwordBytes > 72) {
                errors.add(new RowError(rowNumber, roll,
                        "Password must contain at least 8 characters and not exceed 72 UTF-8 bytes."));
                continue;
            }

            Student student = new Student();
            student.setRollNo(roll);
            student.setName(clean(row.name()));
            student.setBranch(clean(row.branch()).toUpperCase());
            student.setType(normalizeType(row.type()));
            student.setPasswordHash(passwordEncoder.encode(password));

            String semesterText = clean(row.semester());

            if (!semesterText.isEmpty()) {
                try {
                    student.setSemester(Integer.valueOf(semesterText));
                } catch (NumberFormatException e) {
                    errors.add(new RowError(rowNumber, roll,
                            "Semester must be a number from 1 to 8."));
                    continue;
                }
            }

            String problem = firstProblem(student);

            if (problem != null) {
                errors.add(new RowError(rowNumber, roll, problem));
                continue;
            }

            if (!seen.add(roll)) {
                errors.add(new RowError(rowNumber, roll,
                        "Duplicate roll number in the file."));
                continue;
            }

            if (repository.existsByRollNoIgnoreCase(roll)) {
                errors.add(new RowError(rowNumber, roll,
                        "A student with this roll number already exists."));
                continue;
            }

            valid.add(student);
        }

        repository.saveAll(valid);

        return new StudentImportResult(valid.size(), errors.size(), errors);
    }

    private String firstProblem(Student student) {
        Set<ConstraintViolation<Student>> violations =
                validator.validate(student);

        return violations.stream()
                .map(ConstraintViolation::getMessage)
                .sorted()
                .findFirst()
                .orElse(null);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeType(String raw) {
        String type = clean(raw);

        if (type.isEmpty() || type.equalsIgnoreCase("regular")) {
            return "Regular";
        }

        if (type.equalsIgnoreCase("repeater")) {
            return "Repeater";
        }

        return type;
    }
}
