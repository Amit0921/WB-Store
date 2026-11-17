package com.wholesale.store.invoices.service.impl;

import com.wholesale.store.common.exception.ResourceNotFoundException;
import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.customers.repo.CustomerRepository;
import com.wholesale.store.invoices.dto.CreateInvoiceItemRequest;
import com.wholesale.store.invoices.dto.CreateInvoiceRequest;
import com.wholesale.store.invoices.dto.InvoiceResponse;
import com.wholesale.store.invoices.entity.Invoice;
import com.wholesale.store.invoices.entity.InvoiceItem;
import com.wholesale.store.invoices.enums.InvoiceStatus;
import com.wholesale.store.invoices.enums.PaymentStatus;
import com.wholesale.store.invoices.repo.InvoiceRepository;
import com.wholesale.store.invoices.service.InvoiceNumberGenerator;
import com.wholesale.store.invoices.service.InvoiceService;
import com.wholesale.store.ledger.entity.CustomerCreditHistory;
import com.wholesale.store.ledger.entity.LedgerEntry;
import com.wholesale.store.invoices.enums.CreditTransactionType;
import com.wholesale.store.invoices.repo.CustomerCreditHistoryRepository;
import com.wholesale.store.ledger.enums.LedgerEntryType;
import com.wholesale.store.ledger.repo.LedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl
        implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final CustomerCreditHistoryRepository creditHistoryRepository;
    private final LedgerRepository ledgerRepository;
    private final InvoiceNumberGenerator invoiceNumberGenerator;

    @Override
    @Transactional
    public InvoiceResponse createInvoice(
            CreateInvoiceRequest request
    ) {

        Customer customer =
                customerRepository.findById(
                                request.getCustomerId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));

        BigDecimal subtotal = BigDecimal.ZERO;

        Invoice invoice = new Invoice();

        invoice.setInvoiceNo(
                invoiceNumberGenerator.generateInvoiceNumber());

        invoice.setCustomer(customer);

        invoice.setInvoiceDate(
                LocalDateTime.now());

        invoice.setInvoiceStatus(
                InvoiceStatus.COMPLETED);

        invoice.setItems(new ArrayList<>());

        for (CreateInvoiceItemRequest itemRequest :
                request.getItems()) {

            BigDecimal amount =
                    itemRequest.getQuantity()
                            .multiply(itemRequest.getRate());

            subtotal = subtotal.add(amount);

            InvoiceItem item = new InvoiceItem();

            item.setInvoice(invoice);

            item.setItemCode(itemRequest.getItemCode());
            item.setItemName(itemRequest.getItemName());
            item.setBrand(itemRequest.getBrand());
            item.setColor(itemRequest.getColor());
            item.setSize(itemRequest.getSize());

            item.setQuantity(itemRequest.getQuantity());
            item.setRate(itemRequest.getRate());
            item.setUnit(itemRequest.getUnit());
            item.setAmount(amount);

            invoice.getItems().add(item);
        }

        BigDecimal gstAmount =
                subtotal.multiply(
                                request.getGstPercentage())
                        .divide(BigDecimal.valueOf(100));

        BigDecimal discount =
                request.getDiscountAmount() == null
                        ? BigDecimal.ZERO
                        : request.getDiscountAmount();

        BigDecimal finalAmount =
                subtotal
                        .add(gstAmount)
                        .subtract(discount);

        BigDecimal paidAmount =
                request.getPaidAmount() == null
                        ? BigDecimal.ZERO
                        : request.getPaidAmount();

        BigDecimal dueAmount =
                finalAmount.subtract(paidAmount);

        invoice.setSubtotal(subtotal);
        invoice.setGstAmount(gstAmount);
        invoice.setDiscountAmount(discount);

        invoice.setFinalAmount(finalAmount);
        invoice.setPaidAmount(paidAmount);
        invoice.setDueAmount(dueAmount);

        invoice.setPaymentStatus(
                dueAmount.compareTo(BigDecimal.ZERO) == 0
                        ? PaymentStatus.PAID
                        : paidAmount.compareTo(BigDecimal.ZERO) > 0
                        ? PaymentStatus.PARTIAL
                        : PaymentStatus.UNPAID
        );

        invoice.setNotes(request.getNotes());

        invoiceRepository.save(invoice);

        /*
         CUSTOMER DUE UPDATE
         */

        customer.setCurrentDue(
                customer.getCurrentDue()
                        .add(dueAmount));

        customerRepository.save(customer);

        /*
         CREDIT HISTORY
         */

        CustomerCreditHistory history =
                new CustomerCreditHistory();

        history.setCustomer(customer);

        history.setTransactionType(
                CreditTransactionType.INVOICE.name());

        history.setReferenceNo(
                invoice.getInvoiceNo());

        history.setAmount(dueAmount);

        history.setRemarks(
                "Invoice generated");

        history.setCreatedAt(
                LocalDateTime.now());

        creditHistoryRepository.save(history);

        /*
         LEDGER ENTRY
         */

        LedgerEntry ledger = new LedgerEntry();

        ledger.setCustomer(customer);

        ledger.setEntryType(LedgerEntryType.INVOICE);

        ledger.setReferenceNo(
                invoice.getInvoiceNo());

        ledger.setDebit(dueAmount);

        ledger.setCredit(BigDecimal.ZERO);

        ledger.setRunningBalance(
                customer.getCurrentDue());

        ledger.setEntryDate(
                LocalDateTime.now());

        ledgerRepository.save(ledger);

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNo(invoice.getInvoiceNo())
                .customerName(customer.getShopName())
                .finalAmount(finalAmount)
                .paidAmount(paidAmount)
                .dueAmount(dueAmount)
                .build();
    }
}