package com.wholesale.store.payments.repo;

import com.wholesale.store.payments.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByReceiptNo(String receiptNo);

    Page<Payment> findByCustomerId(Integer customerId, Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(p.amount),0)
            FROM Payment p
            WHERE p.customer.id=:customerId
            """)
    BigDecimal getTotalPaidAmount(Integer customerId);

    List<Payment> findByPaymentDateBetweenOrderByPaymentDateDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentDate >= :start AND p.paymentDate <= :end")
    BigDecimal getPaymentsCollectedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
