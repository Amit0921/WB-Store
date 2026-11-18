package com.wholesale.store.users.dto;

import com.wholesale.store.users.enums.RoleType;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {

    private String fullName;

    @Email
    private String email;

    private String phone;

    private RoleType role;
}
