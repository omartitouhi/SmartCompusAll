package org.example.smartcampus.controller;

import lombok.RequiredArgsConstructor;
import org.example.smartcampus.dto.LoginRequest;
import org.example.smartcampus.dto.LoginResponse;
import org.example.smartcampus.dto.PasswordResetRequestResponse;
import org.example.smartcampus.entity.PasswordResetRequest;
import org.example.smartcampus.repository.PasswordResetRequestRepository;
import org.example.smartcampus.service.IAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;
    private final PasswordResetRequestRepository passwordResetRequestRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        LoginResponse response = authService.login(request);
        session.setAttribute("userId", response.getId());
        session.setAttribute("email", response.getEmail());
        session.setAttribute("role", response.getRole());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return new ResponseEntity<>("Logged out successfully", HttpStatus.OK);
    }

    /**
     * Submit a password reset request (public — no auth required)
     * POST /api/auth/password-reset-request
     * Body: { "email": "..." }
     */
    @PostMapping("/password-reset-request")
    public ResponseEntity<Map<String, String>> submitPasswordResetRequest(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email requis."));
        }
        PasswordResetRequest req = new PasswordResetRequest();
        req.setEmail(email.trim());
        passwordResetRequestRepository.save(req);
        return ResponseEntity.ok(Map.of("message", "Votre demande a été envoyée à l'administrateur."));
    }
}
