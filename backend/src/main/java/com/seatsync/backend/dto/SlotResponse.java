package com.seatsync.backend.dto;

public record SlotResponse(String date, String startTime, String endTime, int examCount, boolean generated) {
}