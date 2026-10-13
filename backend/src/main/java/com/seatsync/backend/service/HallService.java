package com.seatsync.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seatsync.backend.entity.Hall;
import com.seatsync.backend.exception.DuplicateResourceException;
import com.seatsync.backend.exception.ResourceNotFoundException;
import com.seatsync.backend.repository.HallRepository;

@Service
@Transactional
public class HallService {

    private final HallRepository repository;
    private final SeatService seatService;

    public HallService(HallRepository repository, SeatService seatService) {
        this.repository = repository;
        this.seatService = seatService;
    }

    @Transactional(readOnly = true)
    public List<Hall> getAll() {
        return repository.findAll(Sort.by("name"));
    }

    @Transactional(readOnly = true)
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
        Hall saved = repository.save(hall);
        seatService.regenerate(saved);
        return saved;
    }

    public Hall update(Long id, Hall data) {
        Hall existing = getById(id);
        data.setName(data.getName().trim());
        if (repository.existsByNameIgnoreCaseAndIdNot(data.getName(), id)) {
            throw new DuplicateResourceException("A hall named " + data.getName() + " already exists.");
        }

        boolean layoutChanged = !existing.getRows().equals(data.getRows())
                || !existing.getBenches().equals(data.getBenches())
                || !existing.getSeatsPerBench().equals(data.getSeatsPerBench());

        existing.setName(data.getName());
        existing.setRows(data.getRows());
        existing.setBenches(data.getBenches());
        existing.setSeatsPerBench(data.getSeatsPerBench());
        existing.setAvailable(data.getAvailable());
        Hall saved = repository.save(existing);

        if (layoutChanged) {
            seatService.regenerate(saved);
        } else {
            seatService.ensureSeats(saved);
        }
        return saved;
    }

    public void delete(Long id) {
        Hall hall = getById(id);
        seatService.deleteForHall(id);
        repository.delete(hall);
    }
}