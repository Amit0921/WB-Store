package com.wholesale.store.users.repo;

import com.wholesale.store.users.entity.Role;
import com.wholesale.store.users.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(RoleType roleType);
}