package com.wholesale.store.common.security;

import com.wholesale.store.common.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
public class JwtAccessDeniedHandler
        implements AccessDeniedHandler {

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException, ServletException {

        response.setContentType("application/json");

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        ApiResponse<Object> apiResponse =
                ApiResponse.builder()
                        .success(false)
                        .message("Access Denied")
                        .data(null)
                        .build();

        new ObjectMapper().writeValue(
                response.getOutputStream(),
                apiResponse
        );
    }
}