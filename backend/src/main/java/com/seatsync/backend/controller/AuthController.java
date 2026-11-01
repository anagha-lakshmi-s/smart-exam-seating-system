package com.seatsync.backend.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seatsync.backend.dto.AuthDtos.AdminLoginRequest;
import com.seatsync.backend.dto.AuthDtos.LoginResponse;
import com.seatsync.backend.dto.AuthDtos.StudentLoginRequest;
import com.seatsync.backend.entity.Student;
import com.seatsync.backend.exception.ApiError;
import com.seatsync.backend.exception.UnauthorizedException;
import com.seatsync.backend.repository.StudentRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final String adminUsername;
    private final String adminPassword;
    private final StudentRepository students;

    public AuthController(@Value("${seatiq.admin.username:}") String adminUsername,
                          @Value("${seatiq.admin.password:}") String adminPassword,
                          StudentRepository students) {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.students = students;
    }

    @PostMapping("/admin")
    public LoginResponse admin(@Valid @RequestBody AdminLoginRequest request) {
        if (adminPassword.isBlank()) {
            throw new UnauthorizedException("Admin login is not configured on the server.");
        }
        boolean userOk = same(adminUsername, request.username().trim());
        boolean passwordOk = same(adminPassword, request.password());
        if (!userOk || !passwordOk) {
            throw new UnauthorizedException("Incorrect username or password.");
        }
        return new LoginResponse("admin", "Administrator");
    }

    @PostMapping("/student")
    public LoginResponse student(@Valid @RequestBody StudentLoginRequest request) {
        Student student = students.findByRollNoIgnoreCase(request.rollNo().trim())
                .orElseThrow(() -> new UnauthorizedException("Please enter a valid register number."));
        return new LoginResponse("student", student.getRollNo());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(UnauthorizedException ex) {
        ApiError body = new ApiError(401, ex.getMessage(), Map.of());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    // Constant-time comparison, so response time does not reveal how much matched
    private boolean same(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}