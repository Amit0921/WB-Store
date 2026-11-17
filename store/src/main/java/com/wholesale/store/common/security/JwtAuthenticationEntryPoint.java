package com.wholesale.store.common.security;

import com.wholesale.store.common.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        response.setContentType("application/json");

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ApiResponse<Object> apiResponse =
                ApiResponse.builder()
                        .success(false)
                        .message("Unauthorized")
                        .data(null)
                        .build();

        new ObjectMapper().writeValue(
                response.getOutputStream(),
                apiResponse
        );
    }
}