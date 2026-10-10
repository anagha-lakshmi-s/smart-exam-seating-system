package com.seatsync.backend.repository;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seatsync.backend.entity.Exam;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    boolean existsBySubjectId(Long subjectId);

    boolean existsBySubjectIdAndExamDateAndStartTime(Long subjectId, LocalDate examDate, LocalTime startTime);

    boolean existsBySubjectIdAndExamDateAndStartTimeAndIdNot(
            Long subjectId, LocalDate examDate, LocalTime startTime, Long id);
}