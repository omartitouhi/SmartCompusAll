package org.example.smartcampus.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GradeResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subjectName;
    private Long classId;
    private String className;
    private Long teacherId;
    private String teacherName;
    private Double value;
    private String comment;
    private String evaluationType;
    private LocalDate evaluationDate;
}
