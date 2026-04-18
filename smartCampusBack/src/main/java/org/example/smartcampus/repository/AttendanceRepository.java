package org.example.smartcampus.repository;

import org.example.smartcampus.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByScheduleIdAndDate(Long scheduleId, LocalDate date);

    Optional<Attendance> findByScheduleIdAndStudentIdAndDate(Long scheduleId, Long studentId, LocalDate date);

    List<Attendance> findByScheduleIdAndStudentId(Long scheduleId, Long studentId);
}
