package com.wholesale.store.payments.repo;

import com.wholesale.store.payments.entity.PaymentSequence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentSequenceRepository
        extends JpaRepository<PaymentSequence, String> {
}