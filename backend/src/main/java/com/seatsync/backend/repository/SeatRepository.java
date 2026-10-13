package com.seatsync.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seatsync.backend.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByHallIdOrderByRowNoAscBenchNoAscSeatNoAsc(Long hallId);

    long countByHallId(Long hallId);

    void deleteByHallId(Long hallId);
}