package com.seatsync.backend.dto;

import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {

    public record AdminLoginRequest(
            @NotBlank(message = "Username is required.") String username,
            @NotBlank(message = "Password is required.") String password) {
    }

    public record StudentLoginRequest(
            @NotBlank(message = "Please enter a valid register number.") String rollNo) {
    }

    public record LoginResponse(String role, String name) {
    }

    private AuthDtos() {
    }
}