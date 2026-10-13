package com.seatsync.backend.dto;

public record SeatResponse(Long id, Integer row, Integer bench, Integer seat) {
}