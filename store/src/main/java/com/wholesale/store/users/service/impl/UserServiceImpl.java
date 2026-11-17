package com.wholesale.store.users.service.impl;

import com.wholesale.store.common.exception.BadRequestException;
import com.wholesale.store.common.exception.ResourceNotFoundException;
import com.wholesale.store.users.dto.CreateUserRequest;
import com.wholesale.store.users.dto.UpdateUserRequest;
import com.wholesale.store.users.dto.UserResponse;
import com.wholesale.store.users.entity.Role;
import com.wholesale.store.users.entity.User;
import com.wholesale.store.users.mapper.UserMapper;
import com.wholesale.store.users.repo.RoleRepository;
import com.wholesale.store.users.repo.UserRepository;
import com.wholesale.store.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserMapper mapper;

    @Override
    public UserResponse create(CreateUserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        user.setRoles(Set.of(role));

        return mapper.toResponse(
                userRepository.save(user)
        );
    }

    @Override
    public UserResponse getById(Integer id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return mapper.toResponse(user);
    }

    @Override
    public Page<UserResponse> getAll(
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("createdAt").descending()
                );

        return userRepository
                .findAll(pageable)
                .map(mapper::toResponse);
    }

    @Override
    public UserResponse update(Integer id,
                               UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        return mapper.toResponse(
                userRepository.save(user)
        );
    }

    @Override
    public void updateStatus(Integer id,
                             Boolean active) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        user.setActive(active);

        userRepository.save(user);
    }
}