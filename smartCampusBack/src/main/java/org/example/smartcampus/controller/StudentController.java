package org.example.smartcampus.controller;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.AttendanceResponse;
import org.example.smartcampus.dto.CourseFileResponse;
import org.example.smartcampus.dto.GradeResponse;
import org.example.smartcampus.dto.ScheduleResponse;
import org.example.smartcampus.dto.StudentResponse;
import org.example.smartcampus.entity.Student;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.repository.StudentRepository;
import org.example.smartcampus.repository.UserRepository;
import org.example.smartcampus.service.IAttendanceService;
import org.example.smartcampus.service.ICourseFileService;
import org.example.smartcampus.service.IGradeService;
import org.example.smartcampus.service.IScheduleService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final IScheduleService scheduleService;
    private final IGradeService gradeService;
    private final ICourseFileService courseFileService;
    private final IAttendanceService attendanceService;

    /**
     * Get schedule for a student by their user ID
     * GET /api/student/{userId}/schedule
     */
    @GetMapping("/{userId}/schedule")
    public ResponseEntity<List<ScheduleResponse>> getStudentSchedule(@PathVariable Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));

        Long classId = student.getSchoolClass().getId();
        List<ScheduleResponse> schedules = scheduleService.getSchedulesByClass(classId);
        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    /**
     * Get student info by user ID
     * GET /api/student/{userId}/info
     */
    @GetMapping("/{userId}/info")
    public ResponseEntity<StudentResponse> getStudentInfo(@PathVariable Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));

        StudentResponse response = new StudentResponse(
                student.getId(),
                student.getUser().getId(),
                student.getUser().getEmail(),
                student.getUser().getFirstName(),
                student.getUser().getLastName(),
                student.getSchoolYear(),
                student.getDateOfBirth(),
                student.getCin(),
                student.getLevel(),
                student.getSchoolClass().getFullClassName(),
                student.getSchoolClass().getFiliere().getName()
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Get all grades for a student
     * GET /api/student/{userId}/grades
     */
    @GetMapping("/{userId}/grades")
    public ResponseEntity<List<GradeResponse>> getStudentGrades(@PathVariable Long userId) {
        return ResponseEntity.ok(gradeService.getGradesByStudent(userId));
    }

    /**
     * List course files available to a student (by their class)
     * GET /api/student/{userId}/files
     */
    @GetMapping("/{userId}/files")
    public ResponseEntity<List<CourseFileResponse>> getStudentFiles(@PathVariable Long userId) {
        return ResponseEntity.ok(courseFileService.getFilesForStudent(userId));
    }

    /**
     * Download a course file
     * GET /api/student/{userId}/files/{fileId}/download
     */
    @GetMapping("/{userId}/files/{fileId}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long userId,
                                               @PathVariable Long fileId) {
        CourseFileResponse meta = courseFileService.getFileMeta(fileId);
        byte[] data = courseFileService.downloadFile(fileId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.getOriginalFileName() + "\"")
                .contentType(MediaType.parseMediaType(meta.getContentType()))
                .body(data);
    }

    /**
     * Get attendance history for the logged-in student
     * GET /api/student/{userId}/attendance
     */
    @GetMapping("/{userId}/attendance")
    public ResponseEntity<List<AttendanceResponse>> getStudentAttendance(@PathVariable Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(student.getId()));
    }
}
