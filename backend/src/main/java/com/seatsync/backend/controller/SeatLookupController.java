package com.seatsync.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seatsync.backend.dto.MySeatResponse;
import com.seatsync.backend.dto.SlotResponse;
import com.seatsync.backend.service.SeatLookupService;

@RestController
@RequestMapping("/api/seating")
public class SeatLookupController {

    private final SeatLookupService service;

    public SeatLookupController(SeatLookupService service) {
        this.service = service;
    }

    @GetMapping("/slots")
    public List<SlotResponse> slots() {
        return service.getSlots();
    }

    @GetMapping("/student/{rollNo}")
    public MySeatResponse mySeat(@PathVariable String rollNo) {
        return service.findMySeat(rollNo);
    }
}