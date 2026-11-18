package com.wholesale.store.auth.service.impl;

import com.wholesale.store.auth.dto.AuthUserResponse;
import com.wholesale.store.auth.dto.LoginRequest;
import com.wholesale.store.auth.dto.LoginResponse;
import com.wholesale.store.auth.dto.RefreshTokenRequest;
import com.wholesale.store.auth.service.AuthService;
import com.wholesale.store.common.exception.UnauthorizedException;
import com.wholesale.store.common.security.CustomUserDetails;
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

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildLoginResponse(user, token, refreshToken);
    }

    @Override
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }

        String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.getActive()) {
            throw new UnauthorizedException("User account is inactive");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        if (!jwtService.isTokenValid(token, userDetails)) {
            throw new UnauthorizedException("Refresh token is expired or invalid");
        }

        String newAccessToken = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return buildLoginResponse(user, newAccessToken, newRefreshToken);
    }

    private LoginResponse buildLoginResponse(User user, String accessToken, String refreshToken) {
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
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