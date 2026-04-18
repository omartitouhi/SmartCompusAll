package org.example.smartcampus.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
