package com.seatsync.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seatsync.backend.entity.Hall;

public interface HallRepository extends JpaRepository<Hall, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Hall> findByAvailableTrueOrderByName();
}