package com.wholesale.store.users.service;

import com.wholesale.store.users.dto.ChangePasswordRequest;
import com.wholesale.store.users.dto.CreateUserRequest;
import com.wholesale.store.users.dto.UpdateUserRequest;
import com.wholesale.store.users.dto.UserResponse;
import org.springframework.data.domain.Page;

public interface UserService {

    UserResponse create(CreateUserRequest request);

    UserResponse getById(Integer id);

    Page<UserResponse> getAll(int page, int size);

    UserResponse update(Integer id, UpdateUserRequest request);

    void updateStatus(Integer id, Boolean active);

    void changePassword(Integer id, ChangePasswordRequest request);
}
