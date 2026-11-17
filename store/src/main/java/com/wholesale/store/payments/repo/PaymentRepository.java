package com.wholesale.store.payments.repo;

import com.wholesale.store.payments.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    @Query("""
            SELECT COALESCE(SUM(p.amount),0)
            FROM Payment p
            WHERE p.customer.id=:customerId
            """)
    BigDecimal getTotalPaidAmount(Integer customerId);

}