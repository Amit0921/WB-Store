package com.wholesale.store.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Builder
public class AuthUserResponse {

    private String id;

    private String fullName;

    private String username;

    private String email;

    private Set<String> roles;
}