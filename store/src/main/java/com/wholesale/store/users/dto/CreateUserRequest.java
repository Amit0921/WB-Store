package com.wholesale.store.users.dto;

import com.wholesale.store.users.enums.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    private String username;

    @Email
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String password;

    private RoleType role;
}