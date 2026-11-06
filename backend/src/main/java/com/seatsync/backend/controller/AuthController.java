package com.seatsync.backend.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
import com.seatsync.backend.service.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final String adminUsername;
    private final String adminPassword;
    private final StudentRepository students;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(
            @Value("${seatiq.admin.username:}") String adminUsername,
            @Value("${seatiq.admin.password:}") String adminPassword,
            StudentRepository students,
            JwtService jwtService,
            BCryptPasswordEncoder passwordEncoder) {

        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.students = students;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/admin")
    public LoginResponse admin(
            @Valid @RequestBody AdminLoginRequest request) {

        if (adminPassword.isBlank()) {
            throw new UnauthorizedException(
                    "Admin login is not configured on the server.");
        }

        boolean userOk = same(adminUsername, request.username().trim());
        boolean passwordOk = same(adminPassword, request.password());

        if (!userOk || !passwordOk) {
            throw new UnauthorizedException(
                    "Incorrect username or password.");
        }

        String token = jwtService.generateToken(
                adminUsername, "ADMIN");

        return new LoginResponse(
                "admin",
                "Administrator",
                token,
                "Bearer",
                jwtService.getExpirationSeconds());
    }

    @PostMapping("/student")
    public LoginResponse student(
            @Valid @RequestBody StudentLoginRequest request) {

        Student student = students.findByRollNoIgnoreCase(
                request.rollNo().trim())
                .orElseThrow(() -> new UnauthorizedException(
                        "Incorrect register number or password."));

        if (student.getPasswordHash() == null
                || !passwordEncoder.matches(
                        request.password(), student.getPasswordHash())) {

            throw new UnauthorizedException(
                    "Incorrect register number or password.");
        }

        String token = jwtService.generateToken(
                student.getRollNo(), "STUDENT");

        return new LoginResponse(
                "student",
                student.getRollNo(),
                token,
                "Bearer",
                jwtService.getExpirationSeconds());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(
            UnauthorizedException ex) {

        ApiError body = new ApiError(
                401, ex.getMessage(), Map.of());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(body);
    }

    private boolean same(String a, String b) {
        return MessageDigest.isEqual(
                a.getBytes(StandardCharsets.UTF_8),
                b.getBytes(StandardCharsets.UTF_8));
    }
}