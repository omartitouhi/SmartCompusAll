package org.example.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SubjectRequest {

    @NotBlank(message = "Le nom de la matière est requis")
    private String name;

    private String description;
}
