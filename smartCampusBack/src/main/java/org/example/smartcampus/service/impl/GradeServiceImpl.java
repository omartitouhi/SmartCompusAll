package org.example.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.GradeRequest;
import org.example.smartcampus.dto.GradeResponse;
import org.example.smartcampus.entity.Grade;
import org.example.smartcampus.entity.Student;
import org.example.smartcampus.entity.Teacher;
import org.example.smartcampus.entity.Subject;
import org.example.smartcampus.entity.SchoolClass;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.exception.UnauthorizedException;
import org.example.smartcampus.repository.GradeRepository;
import org.example.smartcampus.repository.StudentRepository;
import org.example.smartcampus.repository.TeacherRepository;
import org.example.smartcampus.repository.SubjectRepository;
import org.example.smartcampus.repository.SchoolClassRepository;
import org.example.smartcampus.service.IGradeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeServiceImpl implements IGradeService {

    private final GradeRepository gradeRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;

    @Override
    @Transactional
    public GradeResponse addGrade(Long teacherUserId, GradeRequest request) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + teacherUserId));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));

        Grade grade = new Grade();
        grade.setTeacher(teacher);
        grade.setStudent(student);
        grade.setSubject(subject);
        grade.setSchoolClass(schoolClass);
        grade.setValue(request.getValue());
        grade.setComment(request.getComment());
        grade.setEvaluationType(request.getEvaluationType());
        grade.setEvaluationDate(request.getEvaluationDate());

        return convertToResponse(gradeRepository.save(grade));
    }

    @Override
    public List<GradeResponse> getGradesByTeacher(Long teacherUserId) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + teacherUserId));
        return gradeRepository.findByTeacherId(teacher.getId())
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<GradeResponse> getGradesByClassAndSubject(Long teacherUserId, Long classId, Long subjectId) {
        // Verify teacher exists
        teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + teacherUserId));
        return gradeRepository.findBySchoolClassIdAndSubjectId(classId, subjectId)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GradeResponse updateGrade(Long teacherUserId, Long gradeId, GradeRequest request) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + teacherUserId));

        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found with id: " + gradeId));

        if (!grade.getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedException("You are not authorized to update this grade");
        }

        grade.setValue(request.getValue());
        grade.setComment(request.getComment());
        grade.setEvaluationType(request.getEvaluationType());
        grade.setEvaluationDate(request.getEvaluationDate());

        return convertToResponse(gradeRepository.save(grade));
    }

    @Override
    @Transactional
    public void deleteGrade(Long teacherUserId, Long gradeId) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + teacherUserId));

        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found with id: " + gradeId));

        if (!grade.getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this grade");
        }

        gradeRepository.deleteById(gradeId);
    }

    @Override
    public List<GradeResponse> getGradesByStudent(Long studentUserId) {
        return gradeRepository.findByStudentUserId(studentUserId)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    private GradeResponse convertToResponse(Grade grade) {
        return new GradeResponse(
                grade.getId(),
                grade.getStudent().getId(),
                grade.getStudent().getFullName(),
                grade.getSubject().getId(),
                grade.getSubject().getName(),
                grade.getSchoolClass().getId(),
                grade.getSchoolClass().getFullClassName(),
                grade.getTeacher().getId(),
                grade.getTeacher().getFullName(),
                grade.getValue(),
                grade.getComment(),
                grade.getEvaluationType(),
                grade.getEvaluationDate()
        );
    }
}
