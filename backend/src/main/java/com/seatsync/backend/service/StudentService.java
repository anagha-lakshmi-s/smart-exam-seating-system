package com.seatsync.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.seatsync.backend.entity.Student;
import com.seatsync.backend.exception.DuplicateResourceException;
import com.seatsync.backend.exception.ResourceNotFoundException;
import com.seatsync.backend.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public List<Student> getAll() {
        return repository.findAll(Sort.by("rollNo"));
    }

    public Student getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));
    }

    public Student create(Student student) {
        student.setId(null);
        clean(student);
        if (repository.existsByRollNoIgnoreCase(student.getRollNo())) {
            throw new DuplicateResourceException(
                    "A student with roll number " + student.getRollNo() + " already exists.");
        }
        return repository.save(student);
    }

    public Student update(Long id, Student data) {
        Student existing = getById(id);
        clean(data);
        if (repository.existsByRollNoIgnoreCaseAndIdNot(data.getRollNo(), id)) {
            throw new DuplicateResourceException(
                    "A student with roll number " + data.getRollNo() + " already exists.");
        }
        existing.setRollNo(data.getRollNo());
        existing.setName(data.getName());
        existing.setBranch(data.getBranch());
        existing.setSemester(data.getSemester());
        existing.setType(data.getType());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }

    // Roll numbers are stored in upper case and names without extra spaces
    private void clean(Student student) {
        student.setRollNo(student.getRollNo().trim().toUpperCase());
        student.setName(student.getName().trim());
    }
}