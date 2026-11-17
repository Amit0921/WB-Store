package com.wholesale.store.invoices.repo;

import com.wholesale.store.invoices.entity.Invoice;
import com.wholesale.store.invoices.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    Optional<Invoice> findByInvoiceNo(String invoiceNo);

    @Query("""
       SELECT i
       FROM Invoice i
       WHERE i.customer.id = :customerId
       AND i.paymentStatus <> 'PAID'
       ORDER BY i.invoiceDate ASC
       """)
    List<Invoice> findPendingInvoices(
            Integer customerId
    );

    @Query("""
            SELECT COALESCE(SUM(i.finalAmount),0)
            FROM Invoice i
            WHERE i.customer.id=:customerId
            """)
    BigDecimal getTotalInvoiceAmount(Integer customerId);

    @Query("""
            SELECT COUNT(i)
            FROM Invoice i
            WHERE i.customer.id=:customerId
            """)
    Long getInvoiceCount(Integer customerId);
}
