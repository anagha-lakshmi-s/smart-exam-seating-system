package com.seatsync.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "halls")
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Hall name is required.")
    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @NotNull(message = "Rows is required.")
    @Min(value = 1, message = "Rows must be a whole number from 1 to 30.")
    @Max(value = 30, message = "Rows must be a whole number from 1 to 30.")
    @Column(name = "row_count", nullable = false)
    private Integer rows;

    @NotNull(message = "Benches per row is required.")
    @Min(value = 1, message = "Benches must be a whole number from 1 to 20.")
    @Max(value = 20, message = "Benches must be a whole number from 1 to 20.")
    @Column(name = "bench_count", nullable = false)
    private Integer benches;

    @NotNull(message = "Seats per bench is required.")
    @Min(value = 1, message = "Seats per bench must be from 1 to 4.")
    @Max(value = 4, message = "Seats per bench must be from 1 to 4.")
    @Column(name = "seats_per_bench", nullable = false)
    private Integer seatsPerBench;

    @NotNull(message = "Availability is required.")
    @Column(nullable = false)
    private Boolean available = true;

    public int getCapacity() {
        if (rows == null || benches == null || seatsPerBench == null) {
            return 0;
        }
        return rows * benches * seatsPerBench;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getRows() { return rows; }
    public void setRows(Integer rows) { this.rows = rows; }

    public Integer getBenches() { return benches; }
    public void setBenches(Integer benches) { this.benches = benches; }

    public Integer getSeatsPerBench() { return seatsPerBench; }
    public void setSeatsPerBench(Integer seatsPerBench) { this.seatsPerBench = seatsPerBench; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
}