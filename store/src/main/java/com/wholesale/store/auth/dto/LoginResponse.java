package com.wholesale.store.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponse {

    private String accessToken;

    private String tokenType;

    private Long expiresIn;

    private AuthUserResponse user;
}