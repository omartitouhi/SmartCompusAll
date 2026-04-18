package org.example.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.example.smartcampus.enums.Role;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
}