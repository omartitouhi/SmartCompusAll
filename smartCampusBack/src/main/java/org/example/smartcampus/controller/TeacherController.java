package org.example.smartcampus.controller;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.AttendanceRequest;
import org.example.smartcampus.dto.AttendanceResponse;
import org.example.smartcampus.dto.CourseFileResponse;
import org.example.smartcampus.dto.GradeRequest;
import org.example.smartcampus.dto.GradeResponse;
import org.example.smartcampus.dto.ScheduleResponse;
import org.example.smartcampus.dto.TeacherResponse;
import org.example.smartcampus.entity.Student;
import org.example.smartcampus.entity.Teacher;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.repository.StudentRepository;
import org.example.smartcampus.repository.TeacherRepository;
import org.example.smartcampus.service.IAttendanceService;
import org.example.smartcampus.service.ICourseFileService;
import org.example.smartcampus.service.IGradeService;
import org.example.smartcampus.service.IScheduleService;
import org.example.smartcampus.service.ITeacherService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final IScheduleService scheduleService;
    private final ITeacherService teacherService;
    private final IGradeService gradeService;
    private final ICourseFileService courseFileService;
    private final IAttendanceService attendanceService;

    /**
     * Get schedule for a teacher by their user ID
     * GET /api/teacher/{userId}/schedule
     */
    @GetMapping("/{userId}/schedule")
    public ResponseEntity<List<ScheduleResponse>> getTeacherSchedule(@PathVariable Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + userId));

        List<ScheduleResponse> schedules = scheduleService.getSchedulesByTeacher(teacher.getId());
        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    /**
     * Get teacher info by user ID
     * GET /api/teacher/{userId}/info
     */
    @GetMapping("/{userId}/info")
    public ResponseEntity<TeacherResponse> getTeacherInfo(@PathVariable Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + userId));

        TeacherResponse response = teacherService.getTeacherById(teacher.getId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Add a grade
     * POST /api/teacher/{userId}/grades
     */
    @PostMapping("/{userId}/grades")
    public ResponseEntity<GradeResponse> addGrade(@PathVariable Long userId,
                                                   @RequestBody GradeRequest request) {
        GradeResponse response = gradeService.addGrade(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all grades added by this teacher
     * GET /api/teacher/{userId}/grades
     */
    @GetMapping("/{userId}/grades")
    public ResponseEntity<List<GradeResponse>> getGradesByTeacher(@PathVariable Long userId) {
        return ResponseEntity.ok(gradeService.getGradesByTeacher(userId));
    }

    /**
     * Get grades for a specific class and subject
     * GET /api/teacher/{userId}/grades/class/{classId}/subject/{subjectId}
     */
    @GetMapping("/{userId}/grades/class/{classId}/subject/{subjectId}")
    public ResponseEntity<List<GradeResponse>> getGradesByClassAndSubject(
            @PathVariable Long userId,
            @PathVariable Long classId,
            @PathVariable Long subjectId) {
        return ResponseEntity.ok(gradeService.getGradesByClassAndSubject(userId, classId, subjectId));
    }

    /**
     * Update a grade
     * PUT /api/teacher/{userId}/grades/{gradeId}
     */
    @PutMapping("/{userId}/grades/{gradeId}")
    public ResponseEntity<GradeResponse> updateGrade(@PathVariable Long userId,
                                                      @PathVariable Long gradeId,
                                                      @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.updateGrade(userId, gradeId, request));
    }

    /**
     * Delete a grade
     * DELETE /api/teacher/{userId}/grades/{gradeId}
     */
    @DeleteMapping("/{userId}/grades/{gradeId}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long userId,
                                             @PathVariable Long gradeId) {
        gradeService.deleteGrade(userId, gradeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload a course file
     * POST /api/teacher/{userId}/files
     */
    @PostMapping(value = "/{userId}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseFileResponse> uploadFile(
            @PathVariable Long userId,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("classId") Long classId,
            @RequestParam("file") MultipartFile file) {
        CourseFileResponse response = courseFileService.uploadFile(userId, subjectId, classId, file);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * List files uploaded by this teacher
     * GET /api/teacher/{userId}/files
     */
    @GetMapping("/{userId}/files")
    public ResponseEntity<List<CourseFileResponse>> getTeacherFiles(@PathVariable Long userId) {
        return ResponseEntity.ok(courseFileService.getFilesByTeacher(userId));
    }

    /**
     * Delete a course file
     * DELETE /api/teacher/{userId}/files/{fileId}
     */
    @DeleteMapping("/{userId}/files/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long userId,
                                           @PathVariable Long fileId) {
        courseFileService.deleteFile(userId, fileId);
        return ResponseEntity.noContent().build();
    }

    // ============================
    // ATTENDANCE ENDPOINTS
    // ============================

    /**
     * Get students for a given class (to populate the attendance sheet)
     * GET /api/teacher/{userId}/classes/{classId}/students
     */
    @GetMapping("/{userId}/classes/{classId}/students")
    public ResponseEntity<List<java.util.Map<String, Object>>> getStudentsByClass(
            @PathVariable Long userId,
            @PathVariable Long classId) {
        List<Student> students = studentRepository.findBySchoolClassId(classId);
        List<java.util.Map<String, Object>> result = students.stream().map(s -> {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("studentId", s.getId());
            m.put("studentName", s.getFullName());
            return m;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Save or update attendance for a student in a schedule slot
     * POST /api/teacher/{userId}/attendance
     */
    @PostMapping("/{userId}/attendance")
    public ResponseEntity<AttendanceResponse> saveAttendance(
            @PathVariable Long userId,
            @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.saveAttendance(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Get attendance records for a schedule slot on a specific date
     * GET /api/teacher/{userId}/attendance/schedule/{scheduleId}?date=YYYY-MM-DD
     */
    @GetMapping("/{userId}/attendance/schedule/{scheduleId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByScheduleAndDate(
            @PathVariable Long userId,
            @PathVariable Long scheduleId,
            @RequestParam String date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByScheduleAndDate(scheduleId, date));
    }

    /**
     * Delete an attendance record
     * DELETE /api/teacher/{userId}/attendance/{attendanceId}
     */
    @DeleteMapping("/{userId}/attendance/{attendanceId}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long userId,
                                                  @PathVariable Long attendanceId) {
        attendanceService.deleteAttendance(attendanceId);
        return ResponseEntity.noContent().build();
    }
}
