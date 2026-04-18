package org.example.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetRequestResponse {
    private Long id;
    private String email;
    private LocalDateTime requestedAt;
    private boolean seen;
}
