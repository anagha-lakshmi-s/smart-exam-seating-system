package com.seatsync.backend.repository;

import com.seatsync.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByRollNoIgnoreCase(String rollNo);

    boolean existsByRollNoIgnoreCaseAndIdNot(String rollNo, Long id);
}