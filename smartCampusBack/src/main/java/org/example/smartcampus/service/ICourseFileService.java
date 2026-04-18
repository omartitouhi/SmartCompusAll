package org.example.smartcampus.service;

import org.example.smartcampus.dto.CourseFileResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ICourseFileService {
    CourseFileResponse uploadFile(Long teacherUserId, Long subjectId, Long classId, MultipartFile file);
    List<CourseFileResponse> getFilesByTeacher(Long teacherUserId);
    List<CourseFileResponse> getFilesForStudent(Long studentUserId);
    byte[] downloadFile(Long fileId);
    CourseFileResponse getFileMeta(Long fileId);
    void deleteFile(Long teacherUserId, Long fileId);
}
