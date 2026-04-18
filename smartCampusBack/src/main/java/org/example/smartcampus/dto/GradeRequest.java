package org.example.smartcampus.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GradeRequest {
    private Long studentId;
    private Long subjectId;
    private Long classId;
    private Double value;
    private String comment;
    private String evaluationType;
    private LocalDate evaluationDate;
}
