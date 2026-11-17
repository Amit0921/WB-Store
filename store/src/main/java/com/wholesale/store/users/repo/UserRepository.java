package com.wholesale.store.users.repo;

import com.wholesale.store.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository
        extends JpaRepository<User, Integer> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
}