package com.seatsync.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seatsync.backend.dto.SeatResponse;
import com.seatsync.backend.entity.Hall;
import com.seatsync.backend.service.HallService;
import com.seatsync.backend.service.SeatService;

@RestController
@RequestMapping("/api/halls/{hallId}/seats")
public class SeatController {

    private final SeatService seatService;
    private final HallService hallService;

    public SeatController(SeatService seatService, HallService hallService) {
        this.seatService = seatService;
        this.hallService = hallService;
    }

    @GetMapping
    public List<SeatResponse> getSeats(@PathVariable Long hallId) {
        return seatService.getSeats(hallService.getById(hallId));
    }

    @PostMapping("/generate")
    public List<SeatResponse> generate(@PathVariable Long hallId) {
        Hall hall = hallService.getById(hallId);
        seatService.regenerate(hall);
        return seatService.getSeats(hall);
    }
}