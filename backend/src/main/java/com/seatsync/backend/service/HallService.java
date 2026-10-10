package com.seatsync.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.seatsync.backend.entity.Hall;
import com.seatsync.backend.exception.DuplicateResourceException;
import com.seatsync.backend.exception.ResourceNotFoundException;
import com.seatsync.backend.repository.HallRepository;

@Service
public class HallService {

    private final HallRepository repository;

    public HallService(HallRepository repository) {
        this.repository = repository;
    }

    public List<Hall> getAll() {
        return repository.findAll(Sort.by("name"));
    }

    public Hall getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id " + id));
    }

    public Hall create(Hall hall) {
        hall.setId(null);
        hall.setName(hall.getName().trim());
        if (repository.existsByNameIgnoreCase(hall.getName())) {
            throw new DuplicateResourceException("A hall named " + hall.getName() + " already exists.");
        }
        return repository.save(hall);
    }

    public Hall update(Long id, Hall data) {
        Hall existing = getById(id);
        data.setName(data.getName().trim());
        if (repository.existsByNameIgnoreCaseAndIdNot(data.getName(), id)) {
            throw new DuplicateResourceException("A hall named " + data.getName() + " already exists.");
        }
        existing.setName(data.getName());
        existing.setRows(data.getRows());
        existing.setBenches(data.getBenches());
        existing.setSeatsPerBench(data.getSeatsPerBench());
        existing.setAvailable(data.getAvailable());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }
}