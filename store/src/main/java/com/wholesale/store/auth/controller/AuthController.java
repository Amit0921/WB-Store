package com.wholesale.store.auth.controller;

import com.wholesale.store.auth.dto.LoginRequest;
import com.wholesale.store.auth.dto.LoginResponse;
import com.wholesale.store.auth.dto.RefreshTokenRequest;
import com.wholesale.store.auth.service.AuthService;
import com.wholesale.store.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Login successful")
                .data(authService.login(request))
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Token refreshed successfully")
                .data(authService.refreshToken(request))
                .build();
    }
}