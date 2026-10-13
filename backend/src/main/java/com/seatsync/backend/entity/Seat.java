package com.seatsync.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "seats", uniqueConstraints = @UniqueConstraint(
        columnNames = {"hall_id", "row_no", "bench_no", "seat_no"}))
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    @Column(name = "row_no", nullable = false)
    private Integer rowNo;

    @Column(name = "bench_no", nullable = false)
    private Integer benchNo;

    @Column(name = "seat_no", nullable = false)
    private Integer seatNo;

    protected Seat() {
    }

    public Seat(Hall hall, Integer rowNo, Integer benchNo, Integer seatNo) {
        this.hall = hall;
        this.rowNo = rowNo;
        this.benchNo = benchNo;
        this.seatNo = seatNo;
    }

    public Long getId() { return id; }
    public Hall getHall() { return hall; }
    public Integer getRowNo() { return rowNo; }
    public Integer getBenchNo() { return benchNo; }
    public Integer getSeatNo() { return seatNo; }
}