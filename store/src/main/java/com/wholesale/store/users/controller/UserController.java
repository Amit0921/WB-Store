package com.wholesale.store.users.controller;

import com.wholesale.store.common.response.ApiResponse;
import com.wholesale.store.users.dto.CreateUserRequest;
import com.wholesale.store.users.dto.UpdateUserRequest;
import com.wholesale.store.users.dto.UpdateUserStatusRequest;
import com.wholesale.store.users.dto.UserResponse;
import com.wholesale.store.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> create(
            @Valid @RequestBody CreateUserRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User created successfully")
                .data(userService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<Page<UserResponse>> getAll(
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "10")
            int size
    ) {
        return ApiResponse.<Page<UserResponse>>builder()
                .success(true)
                .message("Users fetched successfully")
                .data(userService.getAll(page, size))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<UserResponse> getById(
            @PathVariable Integer id
    ) {
        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User fetched successfully")
                .data(userService.getById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<UserResponse> update(
            @PathVariable Integer id,
            @RequestBody UpdateUserRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User updated successfully")
                .data(userService.update(id, request))
                .build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<Void> updateStatus(
            @PathVariable Integer id,
            @RequestBody UpdateUserStatusRequest request
    ) {
        userService.updateStatus(id, request.getActive());
        return ApiResponse.<Void>builder()
                .success(true)
                .message("User status updated successfully")
                .build();
    }
}