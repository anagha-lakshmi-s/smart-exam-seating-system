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
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Roll number is required.")
    @Column(name = "roll_no", nullable = false, unique = true, length = 20)
    private String rollNo;

    @NotBlank(message = "Name is required.")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Branch is required.")
    @Pattern(regexp = "CSE|ECE|MECH|CIVIL|EEE", message = "Branch must be CSE, ECE, MECH, CIVIL or EEE.")
    @Column(nullable = false, length = 20)
    private String branch;

    @NotNull(message = "Semester is required.")
    @Min(value = 1, message = "Semester must be from 1 to 8.")
    @Max(value = 8, message = "Semester must be from 1 to 8.")
    @Column(nullable = false)
    private Integer semester;

    @NotBlank(message = "Student type is required.")
    @Pattern(regexp = "Regular|Repeater", message = "Student type must be Regular or Repeater.")
    @Column(name = "student_type", nullable = false, length = 20)
    private String type = "Regular";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}