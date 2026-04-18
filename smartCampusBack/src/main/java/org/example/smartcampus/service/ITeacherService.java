package org.example.smartcampus.service;

import org.example.smartcampus.dto.TeacherRequest;
import org.example.smartcampus.dto.TeacherResponse;
import java.util.List;

public interface ITeacherService {
    TeacherResponse createTeacher(TeacherRequest request);
    List<TeacherResponse> getAllTeachers();
    TeacherResponse getTeacherById(Long id);
    TeacherResponse updateTeacher(Long id, TeacherRequest request);
    void deleteTeacher(Long id);
}
