package org.example.smartcampus.controller;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.*;
import org.example.smartcampus.entity.PasswordResetRequest;
import org.example.smartcampus.enums.Level;
import org.example.smartcampus.repository.PasswordResetRequestRepository;
import org.example.smartcampus.service.IFiliereService;
import org.example.smartcampus.service.IScheduleService;
import org.example.smartcampus.service.ISubjectService;
import org.example.smartcampus.service.IStudentService;
import org.example.smartcampus.service.ITeacherService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class AdminController {

    private final IFiliereService filiereService;
    private final ISubjectService subjectService;
    private final IStudentService studentService;
    private final ITeacherService teacherService;
    private final IScheduleService scheduleService;
    private final PasswordResetRequestRepository passwordResetRequestRepository;

    // ==================== FILIERE ENDPOINTS ====================

    /**
     * Create a new filiere
     * POST /api/admin/filieres
     */
    @PostMapping("/filieres")
    public ResponseEntity<FiliereResponse> createFiliere(@Valid @RequestBody FiliereRequest request) {
        FiliereResponse response = filiereService.createFiliere(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all filieres
     * GET /api/admin/filieres
     */
    @GetMapping("/filieres")
    public ResponseEntity<List<FiliereResponse>> getAllFilieres() {
        List<FiliereResponse> filieres = filiereService.getAllFilieres();
        return new ResponseEntity<>(filieres, HttpStatus.OK);
    }

    /**
     * Get filiere by ID
     * GET /api/admin/filieres/{id}
     */
    @GetMapping("/filieres/{id}")
    public ResponseEntity<FiliereResponse> getFiliereById(@PathVariable Long id) {
        FiliereResponse filiere = filiereService.getFiliereById(id);
        return new ResponseEntity<>(filiere, HttpStatus.OK);
    }

    /**
     * Update filiere
     * PUT /api/admin/filieres/{id}
     */
    @PutMapping("/filieres/{id}")
    public ResponseEntity<FiliereResponse> updateFiliere(
            @PathVariable Long id,
            @Valid @RequestBody FiliereRequest request) {
        FiliereResponse filiere = filiereService.updateFiliere(id, request);
        return new ResponseEntity<>(filiere, HttpStatus.OK);
    }

    /**
     * Delete filiere
     * DELETE /api/admin/filieres/{id}
     */
    @DeleteMapping("/filieres/{id}")
    public ResponseEntity<Void> deleteFiliere(@PathVariable Long id) {
        filiereService.deleteFiliere(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ==================== SUBJECT ENDPOINTS ====================

    /**
     * Create a new subject
     * POST /api/admin/subjects
     */
    @PostMapping("/subjects")
    public ResponseEntity<SubjectResponse> createSubject(@Valid @RequestBody SubjectRequest request) {
        SubjectResponse response = subjectService.createSubject(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all subjects
     * GET /api/admin/subjects
     */
    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectResponse>> getAllSubjects() {
        List<SubjectResponse> subjects = subjectService.getAllSubjects();
        return new ResponseEntity<>(subjects, HttpStatus.OK);
    }

    /**
     * Get subject by ID
     * GET /api/admin/subjects/{id}
     */
    @GetMapping("/subjects/{id}")
    public ResponseEntity<SubjectResponse> getSubjectById(@PathVariable Long id) {
        SubjectResponse subject = subjectService.getSubjectById(id);
        return new ResponseEntity<>(subject, HttpStatus.OK);
    }

    /**
     * Update subject
     * PUT /api/admin/subjects/{id}
     */
    @PutMapping("/subjects/{id}")
    public ResponseEntity<SubjectResponse> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse subject = subjectService.updateSubject(id, request);
        return new ResponseEntity<>(subject, HttpStatus.OK);
    }

    /**
     * Delete subject
     * DELETE /api/admin/subjects/{id}
     */
    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ==================== STUDENT ENDPOINTS ====================

    /**
     * Create a new student
     * POST /api/admin/students
     */
    @PostMapping("/students")
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentRequest request) {
        StudentResponse response = studentService.createStudent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all students
     * GET /api/admin/students
     */
    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        List<StudentResponse> students = studentService.getAllStudents();
        return new ResponseEntity<>(students, HttpStatus.OK);
    }

    /**
     * Get student by ID
     * GET /api/admin/students/{id}
     */
    @GetMapping("/students/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        StudentResponse student = studentService.getStudentById(id);
        return new ResponseEntity<>(student, HttpStatus.OK);
    }

    /**
     * Get students by class ID
     * GET /api/admin/students/class/{classId}
     */
    @GetMapping("/students/class/{classId}")
    public ResponseEntity<List<StudentResponse>> getStudentsByClass(@PathVariable Long classId) {
        List<StudentResponse> students = studentService.getStudentsByClass(classId);
        return new ResponseEntity<>(students, HttpStatus.OK);
    }

    /**
     * Update student
     * PUT /api/admin/students/{id}
     */
    @PutMapping("/students/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.updateStudent(id, request);
        return new ResponseEntity<>(student, HttpStatus.OK);
    }

    /**
     * Search students by multiple criteria
     * GET /api/admin/students/search
     */
    @GetMapping("/students/search")
    public ResponseEntity<List<StudentResponse>> searchStudents(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String cin,
            @RequestParam(required = false) String schoolYear,
            @RequestParam(required = false) Level level,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String filiereName
    ) {
        List<StudentResponse> students = studentService.searchStudents(
                email, firstName, lastName, cin,
                schoolYear, level, className, filiereName
        );
        return new ResponseEntity<>(students, HttpStatus.OK);
    }

    /**
     * Delete student
     * DELETE /api/admin/students/{id}
     */
    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ==================== TEACHER ENDPOINTS ====================

    /**
     * Create a new teacher
     * POST /api/admin/teachers
     */
    @PostMapping("/teachers")
    public ResponseEntity<TeacherResponse> createTeacher(@Valid @RequestBody TeacherRequest request) {
        TeacherResponse response = teacherService.createTeacher(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all teachers
     * GET /api/admin/teachers
     */
    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherResponse>> getAllTeachers() {
        List<TeacherResponse> teachers = teacherService.getAllTeachers();
        return new ResponseEntity<>(teachers, HttpStatus.OK);
    }

    /**
     * Get teacher by ID
     * GET /api/admin/teachers/{id}
     */
    @GetMapping("/teachers/{id}")
    public ResponseEntity<TeacherResponse> getTeacherById(@PathVariable Long id) {
        TeacherResponse teacher = teacherService.getTeacherById(id);
        return new ResponseEntity<>(teacher, HttpStatus.OK);
    }

    /**
     * Update teacher
     * PUT /api/admin/teachers/{id}
     */
    @PutMapping("/teachers/{id}")
    public ResponseEntity<TeacherResponse> updateTeacher(
            @PathVariable Long id,
            @Valid @RequestBody TeacherRequest request) {
        TeacherResponse teacher = teacherService.updateTeacher(id, request);
        return new ResponseEntity<>(teacher, HttpStatus.OK);
    }

    /**
     * Delete teacher
     * DELETE /api/admin/teachers/{id}
     */
    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ==================== SCHEDULE ENDPOINTS ====================

    /**
     * Create a new schedule entry
     * POST /api/admin/schedules
     */
    @PostMapping("/schedules")
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody ScheduleRequest request) {
        ScheduleResponse response = scheduleService.createSchedule(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all schedule entries
     * GET /api/admin/schedules
     */
    @GetMapping("/schedules")
    public ResponseEntity<List<ScheduleResponse>> getAllSchedules() {
        return new ResponseEntity<>(scheduleService.getAllSchedules(), HttpStatus.OK);
    }

    /**
     * Get schedules for a specific class
     * GET /api/admin/schedules/class/{classId}
     */
    @GetMapping("/schedules/class/{classId}")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByClass(@PathVariable Long classId) {
        return new ResponseEntity<>(scheduleService.getSchedulesByClass(classId), HttpStatus.OK);
    }

    /**
     * Get schedules for a specific teacher
     * GET /api/admin/schedules/teacher/{teacherId}
     */
    @GetMapping("/schedules/teacher/{teacherId}")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByTeacher(@PathVariable Long teacherId) {
        return new ResponseEntity<>(scheduleService.getSchedulesByTeacher(teacherId), HttpStatus.OK);
    }

    /**
     * Update a schedule entry
     * PUT /api/admin/schedules/{id}
     */
    @PutMapping("/schedules/{id}")
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request) {
        return new ResponseEntity<>(scheduleService.updateSchedule(id, request), HttpStatus.OK);
    }

    /**
     * Delete a schedule entry
     * DELETE /api/admin/schedules/{id}
     */
    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Get all school classes (for dropdowns)
     * GET /api/admin/classes
     */
    @GetMapping("/classes")
    public ResponseEntity<List<SchoolClassResponse>> getAllClasses() {
        return new ResponseEntity<>(scheduleService.getAllClasses(), HttpStatus.OK);
    }

    // ==================== PASSWORD RESET REQUEST ENDPOINTS ====================

    /**
     * Get all password reset requests (sorted by date desc)
     * GET /api/admin/password-reset-requests
     */
    @GetMapping("/password-reset-requests")
    public ResponseEntity<List<PasswordResetRequestResponse>> getPasswordResetRequests() {
        List<PasswordResetRequestResponse> list = passwordResetRequestRepository
                .findAllByOrderByRequestedAtDesc()
                .stream()
                .map(r -> new PasswordResetRequestResponse(r.getId(), r.getEmail(), r.getRequestedAt(), r.isSeen()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * Count unseen password reset requests
     * GET /api/admin/password-reset-requests/unseen-count
     */
    @GetMapping("/password-reset-requests/unseen-count")
    public ResponseEntity<Map<String, Long>> getUnseenCount() {
        long count = passwordResetRequestRepository.countBySeenFalse();
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark a password reset request as seen
     * PUT /api/admin/password-reset-requests/{id}/seen
     */
    @PutMapping("/password-reset-requests/{id}/seen")
    public ResponseEntity<Void> markAsSeen(@PathVariable Long id) {
        passwordResetRequestRepository.findById(id).ifPresent(r -> {
            r.setSeen(true);
            passwordResetRequestRepository.save(r);
        });
        return ResponseEntity.ok().build();
    }
}
