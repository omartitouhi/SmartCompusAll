package org.example.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.smartcampus.enums.Level;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {

    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String schoolYear;
    private LocalDate dateOfBirth;
    private String cin;
    private Level level;
    private String className;
    private String filiereName;
}
