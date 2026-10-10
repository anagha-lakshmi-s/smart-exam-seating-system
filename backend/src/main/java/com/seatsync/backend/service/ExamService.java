package com.seatsync.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seatsync.backend.config.AppConstants;
import com.seatsync.backend.dto.ExamRequest;
import com.seatsync.backend.dto.ExamResponse;
import com.seatsync.backend.entity.Exam;
import com.seatsync.backend.entity.Subject;
import com.seatsync.backend.exception.BadRequestException;
import com.seatsync.backend.exception.DuplicateResourceException;
import com.seatsync.backend.exception.ResourceNotFoundException;
import com.seatsync.backend.repository.ExamRepository;
import com.seatsync.backend.repository.SubjectRepository;

@Service
@Transactional
public class ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;

    public ExamService(ExamRepository examRepository, SubjectRepository subjectRepository) {
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getAll() {
        return examRepository.findAll(Sort.by("examDate", "startTime"))
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ExamResponse getById(Long id) {
        return toResponse(find(id));
    }

    public ExamResponse create(ExamRequest request) {
        Subject subject = checkRequest(request, null, null);
        Exam exam = new Exam();
        apply(exam, subject, request);
        return toResponse(examRepository.save(exam));
    }

    public ExamResponse update(Long id, ExamRequest request) {
        Exam exam = find(id);
        Subject subject = checkRequest(request, id, exam.getExamDate());
        apply(exam, subject, request);
        return toResponse(examRepository.save(exam));
    }

    public void delete(Long id) {
        examRepository.delete(find(id));
    }

    private Exam find(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id " + id));
    }

    // All business rules for an exam live here
    private Subject checkRequest(ExamRequest r, Long id, LocalDate currentDate) {
        Subject subject = subjectRepository.findById(r.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id " + r.subjectId()));

        boolean dateChanged = currentDate == null || !currentDate.equals(r.date());
        if (dateChanged && r.date().isBefore(LocalDate.now())) {
            throw new BadRequestException("Exam date cannot be in the past.");
        }

        if (!r.endTime().isAfter(r.startTime())) {
            throw new BadRequestException("End time must be after the start time.");
        }

        for (String branch : r.branches()) {
            if (!AppConstants.BRANCHES.contains(branch)) {
                throw new BadRequestException("Invalid branch: " + branch + ".");
            }
        }

        boolean duplicate = (id == null)
                ? examRepository.existsBySubjectIdAndExamDateAndStartTime(
                        r.subjectId(), r.date(), r.startTime())
                : examRepository.existsBySubjectIdAndExamDateAndStartTimeAndIdNot(
                        r.subjectId(), r.date(), r.startTime(), id);
        if (duplicate) {
            throw new DuplicateResourceException("This exam already exists for the same date and time.");
        }
        return subject;
    }

    private void apply(Exam exam, Subject subject, ExamRequest r) {
        exam.setSubject(subject);
        exam.setExamDate(r.date());
        exam.setStartTime(r.startTime());
        exam.setEndTime(r.endTime());
        exam.getBranches().clear();
        exam.getBranches().addAll(r.branches());
    }

    private ExamResponse toResponse(Exam e) {
        List<String> branches = AppConstants.BRANCHES.stream()
                .filter(e.getBranches()::contains)
                .toList();
        return new ExamResponse(
                e.getId(),
                e.getSubject().getId(),
                e.getSubject().getCode(),
                e.getSubject().getName(),
                e.getExamDate().toString(),
                e.getStartTime().toString(),
                e.getEndTime().toString(),
                branches);
    }
}