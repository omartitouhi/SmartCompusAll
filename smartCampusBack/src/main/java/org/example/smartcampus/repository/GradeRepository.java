package org.example.smartcampus.repository;

import org.example.smartcampus.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudentId(Long studentId);
    List<Grade> findByTeacherId(Long teacherId);
    List<Grade> findBySchoolClassIdAndSubjectId(Long classId, Long subjectId);
    List<Grade> findByTeacherIdAndSubjectId(Long teacherId, Long subjectId);
    List<Grade> findByStudentUserId(Long userId);
}
