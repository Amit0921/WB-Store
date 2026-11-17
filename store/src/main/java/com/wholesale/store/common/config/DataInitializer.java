package com.wholesale.store.common.config;

import com.wholesale.store.users.entity.Role;
import com.wholesale.store.users.entity.User;
import com.wholesale.store.users.enums.RoleType;
import com.wholesale.store.users.repo.RoleRepository;
import com.wholesale.store.users.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        createRole(RoleType.ADMIN);
        createRole(RoleType.MANAGER);
        createRole(RoleType.BILLING_STAFF);

        if (!userRepository.existsByUsername("admin")) {

            User admin = new User();

            admin.setFullName("System Administrator");
            admin.setUsername("admin");
            admin.setEmail("admin@wbstore.com");
            admin.setPhone("9999999999");
            admin.setPassword(
                    passwordEncoder.encode("Admin@123")
            );

            admin.setRoles(
                    Set.of(
                            roleRepository.findByName(RoleType.ADMIN).get()
                    )
            );

            userRepository.save(admin);
        }
    }

    private void createRole(RoleType roleType) {

        roleRepository.findByName(roleType)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleType);
                    return roleRepository.save(role);
                });
    }
}