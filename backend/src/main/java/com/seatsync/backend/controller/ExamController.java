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

import com.seatsync.backend.dto.ExamRequest;
import com.seatsync.backend.dto.ExamResponse;
import com.seatsync.backend.service.ExamService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService service;

    public ExamController(ExamService service) {
        this.service = service;
    }

    @GetMapping
    public List<ExamResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ExamResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExamResponse create(@Valid @RequestBody ExamRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public ExamResponse update(@PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}