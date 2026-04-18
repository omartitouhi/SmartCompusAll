package org.example.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.CourseFileResponse;
import org.example.smartcampus.entity.CourseFile;
import org.example.smartcampus.entity.SchoolClass;
import org.example.smartcampus.entity.Student;
import org.example.smartcampus.entity.Subject;
import org.example.smartcampus.entity.Teacher;
import org.example.smartcampus.exception.ResourceNotFoundException;
import org.example.smartcampus.exception.UnauthorizedException;
import org.example.smartcampus.repository.CourseFileRepository;
import org.example.smartcampus.repository.SchoolClassRepository;
import org.example.smartcampus.repository.StudentRepository;
import org.example.smartcampus.repository.SubjectRepository;
import org.example.smartcampus.repository.TeacherRepository;
import org.example.smartcampus.service.ICourseFileService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseFileServiceImpl implements ICourseFileService {

    private final CourseFileRepository courseFileRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;

    @Override
    public CourseFileResponse uploadFile(Long teacherUserId, Long subjectId, Long classId, MultipartFile file) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + teacherUserId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + subjectId));
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));

        try {
            CourseFile courseFile = new CourseFile();
            courseFile.setTeacher(teacher);
            courseFile.setSubject(subject);
            courseFile.setSchoolClass(schoolClass);
            courseFile.setOriginalFileName(file.getOriginalFilename());
            courseFile.setContentType(file.getContentType());
            courseFile.setFileSize(file.getSize());
            courseFile.setFileData(file.getBytes());

            CourseFile saved = courseFileRepository.save(courseFile);
            return toResponse(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file data", e);
        }
    }

    @Override
    public List<CourseFileResponse> getFilesByTeacher(Long teacherUserId) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + teacherUserId));
        return courseFileRepository.findByTeacherId(teacher.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<CourseFileResponse> getFilesForStudent(Long studentUserId) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + studentUserId));
        return courseFileRepository.findBySchoolClassId(student.getSchoolClass().getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public byte[] downloadFile(Long fileId) {
        CourseFile cf = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));
        return cf.getFileData();
    }

    @Override
    public CourseFileResponse getFileMeta(Long fileId) {
        CourseFile cf = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));
        return toResponse(cf);
    }

    @Override
    public void deleteFile(Long teacherUserId, Long fileId) {
        Teacher teacher = teacherRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user id: " + teacherUserId));
        CourseFile cf = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));
        if (!cf.getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedException("You are not allowed to delete this file.");
        }
        courseFileRepository.delete(cf);
    }

    private CourseFileResponse toResponse(CourseFile cf) {
        return new CourseFileResponse(
                cf.getId(),
                cf.getOriginalFileName(),
                cf.getContentType(),
                cf.getFileSize(),
                cf.getSubject().getName(),
                cf.getSchoolClass().getFullClassName(),
                cf.getTeacher().getFullName(),
                cf.getUploadedAt() != null ? cf.getUploadedAt().toString() : null
        );
    }
}
