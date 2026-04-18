package org.example.smartcampus.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.smartcampus.enums.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendances",
       uniqueConstraints = @UniqueConstraint(columnNames = {"schedule_id", "student_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @Column(length = 255)
    private String comment;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        this.recordedAt = LocalDateTime.now();
    }
}
