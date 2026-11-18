package com.wholesale.store.invoices.repo;

import com.wholesale.store.invoices.entity.Invoice;
import com.wholesale.store.invoices.enums.InvoiceStatus;
import com.wholesale.store.invoices.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    Optional<Invoice> findByInvoiceNo(String invoiceNo);

    Page<Invoice> findByCustomerId(Integer customerId, Pageable pageable);

    Page<Invoice> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);

    Page<Invoice> findByInvoiceStatus(InvoiceStatus invoiceStatus, Pageable pageable);

    Page<Invoice> findByCustomerIdAndPaymentStatus(Integer customerId, PaymentStatus paymentStatus, Pageable pageable);

    @Query("""
       SELECT i
       FROM Invoice i
       WHERE i.customer.id = :customerId
       AND i.paymentStatus <> 'PAID'
       AND i.invoiceStatus <> 'CANCELLED'
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

    List<Invoice> findByInvoiceDateBetweenAndInvoiceStatusNotOrderByInvoiceDateDesc(
            LocalDateTime start,
            LocalDateTime end,
            InvoiceStatus status
    );

    @Query("SELECT COALESCE(SUM(i.finalAmount), 0) FROM Invoice i WHERE i.invoiceDate >= :start AND i.invoiceDate <= :end AND i.invoiceStatus <> 'CANCELLED'")
    BigDecimal getSalesAmountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.invoiceDate >= :start AND i.invoiceDate <= :end AND i.invoiceStatus <> 'CANCELLED'")
    Long getInvoiceCountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
