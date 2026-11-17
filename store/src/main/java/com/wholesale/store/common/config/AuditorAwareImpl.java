package com.wholesale.store.common.config;

import com.wholesale.store.common.security.CustomUserDetails;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class AuditorAwareImpl implements AuditorAware<Integer> {

    @Override
    public Optional<Integer> getCurrentAuditor() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return Optional.of(userDetails.getUser().getId());
        }

        return Optional.empty();
    }
}