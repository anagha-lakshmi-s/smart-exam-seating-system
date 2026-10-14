package com.seatsync.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seatsync.backend.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByRollNoIgnoreCase(String rollNo);

    boolean existsByRollNoIgnoreCaseAndIdNot(String rollNo, Long id);

    Optional<Student> findByRollNoIgnoreCase(String rollNo);
}