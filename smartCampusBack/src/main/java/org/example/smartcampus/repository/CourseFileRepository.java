package org.example.smartcampus.repository;

import org.example.smartcampus.entity.CourseFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseFileRepository extends JpaRepository<CourseFile, Long> {
    List<CourseFile> findByTeacherId(Long teacherId);
    List<CourseFile> findBySchoolClassId(Long classId);
    List<CourseFile> findBySchoolClassIdAndSubjectId(Long classId, Long subjectId);
}
