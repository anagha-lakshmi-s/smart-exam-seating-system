package com.seatsync.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seatsync.backend.dto.SeatResponse;
import com.seatsync.backend.entity.Hall;
import com.seatsync.backend.entity.Seat;
import com.seatsync.backend.repository.SeatRepository;

@Service
@Transactional
public class SeatService {

    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    // Deletes the hall's old seats and creates a fresh set from its layout
    public void regenerate(Hall hall) {
        seatRepository.deleteByHallId(hall.getId());
        seatRepository.flush();

        List<Seat> seats = new ArrayList<>();
        for (int row = 1; row <= hall.getRows(); row++) {
            for (int bench = 1; bench <= hall.getBenches(); bench++) {
                for (int seat = 1; seat <= hall.getSeatsPerBench(); seat++) {
                    seats.add(new Seat(hall, row, bench, seat));
                }
            }
        }
        seatRepository.saveAll(seats);
    }

    // Creates seats only if the hall does not have the right number yet
    public void ensureSeats(Hall hall) {
        if (seatRepository.countByHallId(hall.getId()) != hall.getCapacity()) {
            regenerate(hall);
        }
    }

    public void deleteForHall(Long hallId) {
        seatRepository.deleteByHallId(hallId);
        seatRepository.flush();
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeats(Hall hall) {
        return seatRepository.findByHallIdOrderByRowNoAscBenchNoAscSeatNoAsc(hall.getId())
                .stream()
                .map(s -> new SeatResponse(s.getId(), s.getRowNo(), s.getBenchNo(), s.getSeatNo()))
                .toList();
    }
}