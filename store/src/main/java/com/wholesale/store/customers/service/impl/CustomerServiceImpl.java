package com.wholesale.store.customers.service.impl;

import com.wholesale.store.common.exception.BadRequestException;
import com.wholesale.store.common.exception.ResourceNotFoundException;
import com.wholesale.store.customers.dto.*;
import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.customers.enums.CustomerStatus;
import com.wholesale.store.customers.mapper.CustomerMapper;
import com.wholesale.store.customers.repo.CustomerRepository;
import com.wholesale.store.customers.service.CustomerService;
import com.wholesale.store.invoices.repo.InvoiceRepository;
import com.wholesale.store.ledger.repo.LedgerRepository;
import com.wholesale.store.payments.repo.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final LedgerRepository ledgerRepository;
    private final CustomerMapper mapper;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public CustomerResponse create(CreateCustomerRequest request) {

        if (customerRepository.existsByPhone(
                request.getPhone())) {

            throw new BadRequestException(
                    "Customer already exists");
        }

        Customer customer = new Customer();

        customer.setShopName(request.getShopName());
        customer.setOwnerName(request.getOwnerName());
        customer.setPhone(request.getPhone());
        customer.setAlternatePhone(
                request.getAlternatePhone());
        customer.setGstin(request.getGstin());
        customer.setAddress(request.getAddress());

        customer.setCreditLimit(
                request.getCreditLimit() == null
                        ? BigDecimal.ZERO
                        : request.getCreditLimit()
        );

        return mapper.toResponse(customerRepository.save(customer));
    }

    @Override
    public CustomerResponse getById(Integer id) {

        Customer customer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));

        return mapper.toResponse(customer);
    }

    @Override
    public Page<CustomerResponse> getAll(int page, int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("createdAt")
                                .descending()
                );

        return customerRepository
                .findAll(pageable)
                .map(mapper::toResponse);
    }

    @Override
    public CustomerResponse update(
            Integer id, UpdateCustomerRequest request
    ) {

        Customer customer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));

        customer.setShopName(request.getShopName());
        customer.setOwnerName(request.getOwnerName());
        customer.setPhone(request.getPhone());
        customer.setAlternatePhone(
                request.getAlternatePhone());
        customer.setAddress(request.getAddress());
        customer.setGstin(request.getGstin());
        customer.setCreditLimit(
                request.getCreditLimit());

        return mapper.toResponse(
                customerRepository.save(customer)
        );
    }

    @Override
    public void updateStatus(
            Integer id, CustomerStatus status
    ) {

        Customer customer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));

        customer.setStatus(status);

        customerRepository.save(customer);
    }

    @Override
    public Page<CustomerResponse> search(
            String keyword,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        return customerRepository
                .findByShopNameContainingIgnoreCaseOrOwnerNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(
                        keyword,
                        keyword,
                        keyword,
                        pageable
                )
                .map(mapper::toResponse);
    }

    @Override
    public List<StatementResponse> getStatement(Integer customerId) {

        customerRepository.findById(customerId).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found"));

        return ledgerRepository
                .findByCustomerIdOrderByEntryDateAsc(customerId)
                .stream()
                .map(entry ->
                        StatementResponse.builder()
                                .transactionDate(
                                        entry.getEntryDate())
                                .transactionType(entry.getEntryType().toString())
                                .referenceNo(entry.getReferenceNo())
                                .debit(entry.getDebit())
                                .credit(entry.getCredit())
                                .runningBalance(entry.getRunningBalance())
                                .build()
                )
                .toList();
    }

    @Override
    public CustomerSummaryResponse getSummary(
            Integer customerId
    ) {

        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));

        BigDecimal totalInvoiceAmount =
                invoiceRepository.getTotalInvoiceAmount(
                        customerId);

        BigDecimal totalPaidAmount =
                paymentRepository.getTotalPaidAmount(
                        customerId);

        Long totalInvoices =
                invoiceRepository.getInvoiceCount(
                        customerId);

        return CustomerSummaryResponse.builder()
                .shopName(customer.getShopName())
                .ownerName(customer.getOwnerName())
                .phone(customer.getPhone())
                .gstin(customer.getGstin())
                .address(customer.getAddress())
                .status(customer.getStatus())
                .creditLimit(customer.getCreditLimit())
                .currentDue(customer.getCurrentDue())
                .totalInvoiceAmount(totalInvoiceAmount != null ? totalInvoiceAmount : BigDecimal.ZERO)
                .totalPaidAmount(totalPaidAmount != null ? totalPaidAmount : BigDecimal.ZERO)
                .totalInvoices(totalInvoices != null ? totalInvoices : 0L)
                .build();
    }
}