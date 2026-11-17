package com.wholesale.store.auth.service.impl;

import com.wholesale.store.auth.dto.AuthUserResponse;
import com.wholesale.store.auth.dto.LoginRequest;
import com.wholesale.store.auth.dto.LoginResponse;
import com.wholesale.store.auth.service.AuthService;
import com.wholesale.store.common.exception.UnauthorizedException;
import com.wholesale.store.common.security.JwtService;
import com.wholesale.store.users.entity.User;
import com.wholesale.store.users.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    @Value("${application.security.jwt.expiration}")
    private Long expiration;

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new UnauthorizedException("Invalid username or password"));

        if (!user.getActive()) {
            throw new UnauthorizedException("User account is inactive");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new UnauthorizedException("Invalid username or password");
        }

        String token =
                jwtService.generateToken(
                        new com.wholesale.store.common.security.CustomUserDetails(user)
                );

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(expiration)
                .user(
                        AuthUserResponse.builder()
                                .id(user.getId().toString())
                                .fullName(user.getFullName())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .roles(
                                        user.getRoles()
                                                .stream()
                                                .map(role -> role.getName().name())
                                                .collect(Collectors.toSet())
                                )
                                .build()
                )
                .build();
    }
}