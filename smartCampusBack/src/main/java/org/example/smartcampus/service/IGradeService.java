package org.example.smartcampus.service;

import org.example.smartcampus.dto.GradeRequest;
import org.example.smartcampus.dto.GradeResponse;
import java.util.List;

public interface IGradeService {
    GradeResponse addGrade(Long teacherUserId, GradeRequest request);
    List<GradeResponse> getGradesByTeacher(Long teacherUserId);
    List<GradeResponse> getGradesByClassAndSubject(Long teacherUserId, Long classId, Long subjectId);
    GradeResponse updateGrade(Long teacherUserId, Long gradeId, GradeRequest request);
    void deleteGrade(Long teacherUserId, Long gradeId);
    List<GradeResponse> getGradesByStudent(Long studentUserId);
}
