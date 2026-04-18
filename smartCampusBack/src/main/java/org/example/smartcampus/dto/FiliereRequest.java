package org.example.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FiliereRequest {

    @NotBlank(message = "Le nom de la filière est requis")
    private String name;

    private String description;
}
