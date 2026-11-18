package com.wholesale.store.users.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    private String oldPassword;

    @NotBlank(message = "New password is required")
    private String newPassword;
}
