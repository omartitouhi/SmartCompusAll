package org.example.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.ScheduleRequest;
import org.example.smartcampus.dto.ScheduleResponse;
import org.example.smartcampus.dto.SchoolClassResponse;
import org.example.smartcampus.entity.Schedule;
import org.example.smartcampus.entity.SchoolClass;
import org.example.smartcampus.entity.Teacher;
import org.example.smartcampus.entity.Subject;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.repository.ScheduleRepository;
import org.example.smartcampus.repository.SchoolClassRepository;
import org.example.smartcampus.repository.TeacherRepository;
import org.example.smartcampus.repository.SubjectRepository;
import org.example.smartcampus.service.IScheduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements IScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;

    @Override
    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + request.getTeacherId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        Schedule schedule = new Schedule();
        schedule.setSchoolClass(schoolClass);
        schedule.setTeacher(teacher);
        schedule.setSubject(subject);
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setRoom(request.getRoom());
        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());

        return convertToResponse(scheduleRepository.save(schedule));
    }

    @Override
    public List<ScheduleResponse> getAllSchedules() {
        return scheduleRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleResponse> getSchedulesByClass(Long classId) {
        return scheduleRepository.findBySchoolClassId(classId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleResponse> getSchedulesByTeacher(Long teacherId) {
        return scheduleRepository.findByTeacherId(teacherId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScheduleResponse updateSchedule(Long id, ScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + request.getTeacherId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        schedule.setSchoolClass(schoolClass);
        schedule.setTeacher(teacher);
        schedule.setSubject(subject);
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setRoom(request.getRoom());
        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());

        return convertToResponse(scheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Schedule not found with id: " + id);
        }
        scheduleRepository.deleteById(id);
    }

    @Override
    public List<SchoolClassResponse> getAllClasses() {
        return schoolClassRepository.findAll()
                .stream()
                .map(sc -> new SchoolClassResponse(
                        sc.getId(),
                        sc.getClassName(),
                        sc.getFullClassName(),
                        sc.getFiliere().getName(),
                        sc.getLevel(),
                        sc.getCapacity(),
                        sc.getCurrentSize()
                ))
                .collect(Collectors.toList());
    }

    private ScheduleResponse convertToResponse(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getSchoolClass().getId(),
                schedule.getSchoolClass().getFullClassName(),
                schedule.getSchoolClass().getFiliere().getName(),
                schedule.getSchoolClass().getLevel(),
                schedule.getTeacher().getId(),
                schedule.getTeacher().getFullName(),
                schedule.getSubject().getId(),
                schedule.getSubject().getName(),
                schedule.getDayOfWeek(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getRoom(),
                schedule.getStartDate(),
                schedule.getEndDate()
        );
    }
}
