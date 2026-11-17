package com.wholesale.store.users.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
public class UserResponse {

    private Integer id;

    private String fullName;

    private String username;

    private String email;

    private String phone;

    private Boolean active;

    private Set<String> roles;
}