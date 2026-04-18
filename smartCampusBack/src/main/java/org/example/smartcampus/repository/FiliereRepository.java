package org.example.smartcampus.repository;

import org.example.smartcampus.entity.Filiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FiliereRepository extends JpaRepository<Filiere, Long> {
    Optional<Filiere> findByName(String name);
    boolean existsByName(String name);
}
