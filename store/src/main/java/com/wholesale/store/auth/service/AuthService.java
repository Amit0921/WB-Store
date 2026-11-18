package com.wholesale.store.auth.service;

import com.wholesale.store.auth.dto.LoginRequest;
import com.wholesale.store.auth.dto.LoginResponse;
import com.wholesale.store.auth.dto.RefreshTokenRequest;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse refreshToken(RefreshTokenRequest request);

}