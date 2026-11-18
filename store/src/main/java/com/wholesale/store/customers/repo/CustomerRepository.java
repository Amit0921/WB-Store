package com.wholesale.store.customers.repo;

import com.wholesale.store.customers.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface CustomerRepository
        extends JpaRepository<Customer, Integer> {

    boolean existsByPhone(String phone);

    Page<Customer> findByShopNameContainingIgnoreCaseOrOwnerNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(
            String shopName,
            String ownerName,
            String phone,
            Pageable pageable
    );

    List<Customer> findByCurrentDueGreaterThanOrderByCurrentDueDesc(BigDecimal amount);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.status = 'ACTIVE' AND c.deleted = false")
    Long countActiveCustomers();

    @Query("SELECT COALESCE(SUM(c.currentDue), 0) FROM Customer c WHERE c.deleted = false")
    BigDecimal getTotalOutstandingDues();
}
