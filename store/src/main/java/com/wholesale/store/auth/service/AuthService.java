package com.wholesale.store.auth.service;

import com.wholesale.store.auth.dto.LoginRequest;
import com.wholesale.store.auth.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

}