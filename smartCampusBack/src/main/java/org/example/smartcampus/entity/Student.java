package org.example.smartcampus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.smartcampus.enums.Level;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 20)
    private String schoolYear; // Année scolaire (ex: 2025-2026)

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(unique = true, nullable = false, length = 20)
    private String cin; // Numéro de la carte d'identité

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    public String getFullName() {
        return user.getFirstName() + " " + user.getLastName();
    }
}
