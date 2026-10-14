package com.seatsync.backend.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seatsync.backend.dto.ArrangementResponse;
import com.seatsync.backend.dto.GenerateRequest;
import com.seatsync.backend.exception.BadRequestException;
import com.seatsync.backend.service.SeatingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/seating")
public class SeatingController {

    private final SeatingService service;

    public SeatingController(SeatingService service) {
        this.service = service;
    }

    @PostMapping("/generate")
    public ArrangementResponse generate(@Valid @RequestBody GenerateRequest request) {
        return service.generate(request);
    }

    @GetMapping
    public ArrangementResponse get(@RequestParam String date, @RequestParam String startTime) {
        try {
            return service.getArrangement(LocalDate.parse(date), LocalTime.parse(startTime));
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid date or time. Use yyyy-MM-dd and HH:mm.");
        }
    }
}