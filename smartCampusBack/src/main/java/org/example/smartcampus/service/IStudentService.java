package org.example.smartcampus.service;

import org.example.smartcampus.dto.StudentRequest;
import org.example.smartcampus.dto.StudentResponse;
import org.example.smartcampus.enums.Level;
import java.util.List;

public interface IStudentService {
    StudentResponse createStudent(StudentRequest request);
    List<StudentResponse> getAllStudents();
    StudentResponse getStudentById(Long id);
    StudentResponse updateStudent(Long id, StudentRequest request);
    void deleteStudent(Long id);
    List<StudentResponse> getStudentsByClass(Long classId);
    List<StudentResponse> searchStudents(
            String email,
            String firstName,
            String lastName,
            String cin,
            String schoolYear,
            Level level,
            String className,
            String specialtyName
    );
}
