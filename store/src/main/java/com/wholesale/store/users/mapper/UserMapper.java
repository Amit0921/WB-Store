package com.wholesale.store.users.mapper;

import com.wholesale.store.users.dto.UserResponse;
import com.wholesale.store.users.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .active(user.getActive())
                .roles(
                        user.getRoles()
                                .stream()
                                .map(role -> role.getName().name())
                                .collect(Collectors.toSet())
                )
                .build();
    }
}