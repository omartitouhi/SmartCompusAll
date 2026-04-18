package org.example.smartcampus.service;

import org.example.smartcampus.dto.LoginRequest;
import org.example.smartcampus.dto.LoginResponse;

public interface IAuthService {
    LoginResponse login(LoginRequest request);
}

