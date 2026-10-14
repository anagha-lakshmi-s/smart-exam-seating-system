package com.seatsync.backend.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seatsync.backend.entity.Seating;

public interface SeatingRepository extends JpaRepository<Seating, Long> {

    List<Seating> findBySlotDateAndSlotStart(LocalDate slotDate, LocalTime slotStart);

    void deleteBySlotDateAndSlotStart(LocalDate slotDate, LocalTime slotStart);

    boolean existsBySlotDateAndSlotStart(LocalDate slotDate, LocalTime slotStart);

    List<Seating> findByStudentIdOrderBySlotDateDescSlotStartDesc(Long studentId);
}