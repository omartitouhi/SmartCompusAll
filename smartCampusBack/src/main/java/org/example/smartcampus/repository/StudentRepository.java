package org.example.smartcampus.repository;

import org.example.smartcampus.entity.Student;
import org.example.smartcampus.entity.SchoolClass;
import org.example.smartcampus.enums.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByCin(String cin);
    boolean existsByCin(String cin);
    List<Student> findBySchoolClass(SchoolClass schoolClass);
    List<Student> findBySchoolClassId(Long classId);
    int countBySchoolClass(SchoolClass schoolClass);
    
    @Query("SELECT s FROM Student s " +
           "JOIN s.user u " +
           "JOIN s.schoolClass sc " +
           "JOIN sc.filiere f " +
           "WHERE (:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
           "AND (:firstName IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))) " +
           "AND (:lastName IS NULL OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))) " +
           "AND (:cin IS NULL OR LOWER(s.cin) LIKE LOWER(CONCAT('%', :cin, '%'))) " +
           "AND (:schoolYear IS NULL OR LOWER(s.schoolYear) LIKE LOWER(CONCAT('%', :schoolYear, '%'))) " +
           "AND (:level IS NULL OR s.level = :level) " +
           "AND (:className IS NULL OR LOWER(sc.className) LIKE LOWER(CONCAT('%', :className, '%'))) " +
           "AND (:filiereName IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :filiereName, '%')))")
    List<Student> searchStudents(
            @Param("email") String email,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("cin") String cin,
            @Param("schoolYear") String schoolYear,
            @Param("level") Level level,
            @Param("className") String className,
            @Param("filiereName") String filiereName
    );
}
