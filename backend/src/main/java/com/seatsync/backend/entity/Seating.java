package com.seatsync.backend.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

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
@Table(name = "seatings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"slot_date", "slot_start", "student_id"}),
        @UniqueConstraint(columnNames = {"slot_date", "slot_start", "seat_id"})
})
public class Seating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "slot_start", nullable = false)
    private LocalTime slotStart;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Exam exam;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Student student;

    // null when the student could not be placed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Seat seat;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 300)
    private String reason;

    protected Seating() {
    }

    private Seating(LocalDate slotDate, LocalTime slotStart, Exam exam, Student student,
                    Seat seat, String status, String reason) {
        this.slotDate = slotDate;
        this.slotStart = slotStart;
        this.exam = exam;
        this.student = student;
        this.seat = seat;
        this.status = status;
        this.reason = reason;
    }

    public static Seating assigned(LocalDate date, LocalTime start, Exam exam, Student student, Seat seat) {
        return new Seating(date, start, exam, student, seat, "ASSIGNED", null);
    }

    public static Seating unplaced(LocalDate date, LocalTime start, Exam exam, Student student, String reason) {
        return new Seating(date, start, exam, student, null, "UNPLACED", reason);
    }

    public Long getId() { return id; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getSlotStart() { return slotStart; }
    public Exam getExam() { return exam; }
    public Student getStudent() { return student; }
    public Seat getSeat() { return seat; }
    public String getStatus() { return status; }
    public String getReason() { return reason; }
}