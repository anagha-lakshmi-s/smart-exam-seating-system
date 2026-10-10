package com.seatsync.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.seatsync.backend.entity.Subject;
import com.seatsync.backend.exception.DuplicateResourceException;
import com.seatsync.backend.exception.ResourceInUseException;
import com.seatsync.backend.exception.ResourceNotFoundException;
import com.seatsync.backend.repository.ExamRepository;
import com.seatsync.backend.repository.SubjectRepository;

@Service
public class SubjectService {

    private final SubjectRepository repository;
    private final ExamRepository examRepository;

    public SubjectService(SubjectRepository repository, ExamRepository examRepository) {
        this.repository = repository;
        this.examRepository = examRepository;
    }

    public List<Subject> getAll() {
        return repository.findAll(Sort.by("code"));
    }

    public Subject getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id " + id));
    }

    public Subject create(Subject subject) {
        subject.setId(null);
        clean(subject);
        if (repository.existsByCodeIgnoreCase(subject.getCode())) {
            throw new DuplicateResourceException(
                    "A subject with code " + subject.getCode() + " already exists.");
        }
        return repository.save(subject);
    }

    public Subject update(Long id, Subject data) {
        Subject existing = getById(id);
        clean(data);
        if (repository.existsByCodeIgnoreCaseAndIdNot(data.getCode(), id)) {
            throw new DuplicateResourceException(
                    "A subject with code " + data.getCode() + " already exists.");
        }
        existing.setCode(data.getCode());
        existing.setName(data.getName());
        return repository.save(existing);
    }

    public void delete(Long id) {
        Subject subject = getById(id);
        if (examRepository.existsBySubjectId(id)) {
            throw new ResourceInUseException("This subject is used by an exam, so it cannot be deleted.");
        }
        repository.delete(subject);
    }

    private void clean(Subject subject) {
        subject.setCode(subject.getCode().trim().toUpperCase());
        subject.setName(subject.getName().trim());
    }
}