
package com.seatsync.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.seatsync.backend.dto.StudentImportRequest;
import com.seatsync.backend.dto.StudentImportResult;
import com.seatsync.backend.entity.Student;
import com.seatsync.backend.service.StudentImportService;
import com.seatsync.backend.service.StudentPasswordService;
import com.seatsync.backend.service.StudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;
    private final StudentImportService importService;
    private final StudentPasswordService passwordService;

    public StudentController(
            StudentService service,
            StudentImportService importService,
            StudentPasswordService passwordService) {
        this.service = service;
        this.importService = importService;
        this.passwordService = passwordService;
    }

    @GetMapping
    public List<Student> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Student create(@Valid @RequestBody Student student) {
        return service.create(student);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @Valid @RequestBody Student student) {
        return service.update(id, student);
    }

    @PatchMapping("/{id}/absent")
    public Student setAbsent(@PathVariable Long id, @RequestParam boolean value) {
        return service.setAbsent(id, value);
    }

    @PostMapping("/import")
    public StudentImportResult importStudents(@RequestBody StudentImportRequest request) {
        return importService.importStudents(request);
    }

    @PostMapping("/passwords/bulk")
    public StudentPasswordService.BulkPasswordResult assignPasswords(
            @RequestBody StudentPasswordService.BulkPasswordRequest request) {
        return passwordService.assignPasswords(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
