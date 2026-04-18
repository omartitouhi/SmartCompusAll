package org.example.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.smartcampus.enums.Level;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SchoolClassResponse {

    private Long id;
    private String className;       // e.g. "A"
    private String fullClassName;   // e.g. "Informatique-A"
    private String filiereName;
    private Level level;
    private Integer capacity;
    private Integer currentSize;
}
