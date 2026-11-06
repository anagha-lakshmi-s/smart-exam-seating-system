package com.seatsync.backend.service;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.seatsync.backend.entity.Student;
import com.seatsync.backend.exception.BadRequestException;
import com.seatsync.backend.exception.DuplicateResourceException;
import com.seatsync.backend.exception.ResourceNotFoundException;
import com.seatsync.backend.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;

    public StudentService(
            StudentRepository repository,
            BCryptPasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Student> getAll() {
        return repository.findAll(Sort.by("rollNo"));
    }

    public Student getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with id " + id));
    }

    public Student create(Student student) {
        student.setId(null);
        clean(student);

        if (student.getPassword() == null
                || student.getPassword().isBlank()) {
            throw new BadRequestException(
                    "Password is required for a new student.");
        }

        validatePassword(student.getPassword());

        if (repository.existsByRollNoIgnoreCase(student.getRollNo())) {
            throw new DuplicateResourceException(
                    "A student with roll number " + student.getRollNo()
                            + " already exists.");
        }

        student.setPasswordHash(
                passwordEncoder.encode(student.getPassword()));
        student.setPassword(null);

        return repository.save(student);
    }

    public Student update(Long id, Student data) {
        Student existing = getById(id);
        clean(data);

        if (repository.existsByRollNoIgnoreCaseAndIdNot(
                data.getRollNo(), id)) {
            throw new DuplicateResourceException(
                    "A student with roll number " + data.getRollNo()
                            + " already exists.");
        }

        existing.setRollNo(data.getRollNo());
        existing.setName(data.getName());
        existing.setBranch(data.getBranch());
        existing.setSemester(data.getSemester());
        existing.setType(data.getType());

        if (data.getPassword() != null
                && !data.getPassword().isBlank()) {
            validatePassword(data.getPassword());

            existing.setPasswordHash(
                    passwordEncoder.encode(data.getPassword()));
        }

        return repository.save(existing);
    }

    public Student setAbsent(Long id, boolean absent) {
        Student student = getById(id);
        student.setAbsent(absent);
        return repository.save(student);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }

    private void validatePassword(String password) {
        int passwordBytes = password.getBytes(
                StandardCharsets.UTF_8).length;

        if (password.length() < 8 || passwordBytes > 72) {
            throw new BadRequestException(
                    "Password must contain at least 8 characters "
                            + "and not exceed 72 UTF-8 bytes.");
        }
    }

    private void clean(Student student) {
        student.setRollNo(student.getRollNo().trim().toUpperCase());
        student.setName(student.getName().trim());
    }
}