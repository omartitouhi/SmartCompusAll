package org.example.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.AttendanceRequest;
import org.example.smartcampus.dto.AttendanceResponse;
import org.example.smartcampus.entity.Attendance;
import org.example.smartcampus.entity.Schedule;
import org.example.smartcampus.entity.Student;
import org.example.smartcampus.repository.AttendanceRepository;
import org.example.smartcampus.repository.ScheduleRepository;
import org.example.smartcampus.repository.StudentRepository;
import org.example.smartcampus.service.IAttendanceService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements IAttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ScheduleRepository scheduleRepository;
    private final StudentRepository studentRepository;

    @Override
    public AttendanceResponse saveAttendance(AttendanceRequest request) {
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + request.getScheduleId()));
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + request.getStudentId()));
        LocalDate date = LocalDate.parse(request.getDate());

        Attendance attendance = attendanceRepository
                .findByScheduleIdAndStudentIdAndDate(schedule.getId(), student.getId(), date)
                .orElse(new Attendance());

        attendance.setSchedule(schedule);
        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setStatus(request.getStatus());
        attendance.setComment(request.getComment());

        Attendance saved = attendanceRepository.save(attendance);
        return toResponse(saved);
    }

    @Override
    public List<AttendanceResponse> getAttendanceByScheduleAndDate(Long scheduleId, String date) {
        LocalDate localDate = LocalDate.parse(date);
        return attendanceRepository.findByScheduleIdAndDate(scheduleId, localDate)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAttendanceByScheduleAndStudent(Long scheduleId, Long studentId) {
        return attendanceRepository.findByScheduleIdAndStudentId(scheduleId, studentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteAttendance(Long attendanceId) {
        attendanceRepository.deleteById(attendanceId);
    }

    private AttendanceResponse toResponse(Attendance a) {
        Schedule s = a.getSchedule();
        Student st = a.getStudent();
        return new AttendanceResponse(
                a.getId(),
                s.getId(),
                s.getSubject().getName(),
                s.getDayOfWeek().name(),
                s.getStartTime().toString(),
                s.getEndTime().toString(),
                st.getId(),
                st.getFullName(),
                a.getDate(),
                a.getStatus(),
                a.getComment(),
                a.getRecordedAt()
        );
    }
}
