package com.seatsync.backend.exception;

import java.util.Map;

public record ApiError(int status, String message, Map<String, String> errors) {
}