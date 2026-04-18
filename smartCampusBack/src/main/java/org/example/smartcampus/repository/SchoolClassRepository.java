package org.example.smartcampus.repository;

import org.example.smartcampus.entity.Filiere;
import org.example.smartcampus.entity.SchoolClass;
import org.example.smartcampus.enums.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findByFiliereAndLevel(Filiere filiere, Level level);
    List<SchoolClass> findByFiliereAndLevelOrderByClassNameAsc(Filiere filiere, Level level);
    Optional<SchoolClass> findByFiliereAndLevelAndClassName(Filiere filiere, Level level, String className);
}
