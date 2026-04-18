package org.example.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseFileResponse {
    private Long id;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private String subjectName;
    private String className;
    private String teacherName;
    private String uploadedAt;
}
