package com.seatsync.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.seatsync.backend.entity.Hall;
import com.seatsync.backend.service.HallService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/halls")
public class HallController {

    private final HallService service;

    public HallController(HallService service) {
        this.service = service;
    }

    @GetMapping
    public List<Hall> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Hall getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Hall create(@Valid @RequestBody Hall hall) {
        return service.create(hall);
    }

    @PutMapping("/{id}")
    public Hall update(@PathVariable Long id, @Valid @RequestBody Hall hall) {
        return service.update(id, hall);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}