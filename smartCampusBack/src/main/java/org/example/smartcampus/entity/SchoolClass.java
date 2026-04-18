package org.example.smartcampus.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.smartcampus.enums.Level;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "school_classes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String className; // A, B, C, etc.

    @ManyToOne
    @JoinColumn(name = "filiere_id", nullable = false)
    private Filiere filiere;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level;

    @Column(nullable = false)
    private Integer capacity = 15;

    @Column(nullable = false)
    private Integer currentSize = 0;

    @OneToMany(mappedBy = "schoolClass", cascade = CascadeType.ALL)
    private List<Student> students = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isFull() {
        return currentSize >= capacity;
    }

    public String getFullClassName() {
        return filiere.getName() + "-" + className;
    }
}
