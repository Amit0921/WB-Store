package com.wholesale.store.invoices.service.impl;

import com.wholesale.store.common.exception.BadRequestException;
import com.wholesale.store.common.exception.ResourceNotFoundException;
import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.customers.repo.CustomerRepository;
import com.wholesale.store.invoices.dto.CreateInvoiceItemRequest;
import com.wholesale.store.invoices.dto.CreateInvoiceRequest;
import com.wholesale.store.invoices.dto.InvoiceItemResponse;
import com.wholesale.store.invoices.dto.InvoiceResponse;
import com.wholesale.store.invoices.entity.Invoice;
import com.wholesale.store.invoices.entity.InvoiceItem;
import com.wholesale.store.invoices.enums.CreditTransactionType;
import com.wholesale.store.invoices.enums.InvoiceStatus;
import com.wholesale.store.invoices.enums.PaymentStatus;
import com.wholesale.store.invoices.repo.CustomerCreditHistoryRepository;
import com.wholesale.store.invoices.repo.InvoiceRepository;
import com.wholesale.store.invoices.service.InvoiceNumberGenerator;
import com.wholesale.store.invoices.service.InvoiceService;
import com.wholesale.store.ledger.entity.CustomerCreditHistory;
import com.wholesale.store.ledger.entity.LedgerEntry;
import com.wholesale.store.ledger.enums.LedgerEntryType;
import com.wholesale.store.ledger.repo.LedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final CustomerCreditHistoryRepository creditHistoryRepository;
    private final LedgerRepository ledgerRepository;
    private final InvoiceNumberGenerator invoiceNumberGenerator;

    @Override
    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        BigDecimal subtotal = BigDecimal.ZERO;
        Invoice invoice = new Invoice();

        invoice.setInvoiceNo(invoiceNumberGenerator.generateInvoiceNumber());
        invoice.setCustomer(customer);
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setInvoiceStatus(InvoiceStatus.COMPLETED);
        invoice.setItems(new ArrayList<>());

        for (CreateInvoiceItemRequest itemRequest : request.getItems()) {
            BigDecimal amount = itemRequest.getQuantity().multiply(itemRequest.getRate());
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
            item.setUnit(itemRequest.getUnit() != null ? itemRequest.getUnit() : "PCS");
            item.setAmount(amount);

            invoice.getItems().add(item);
        }

        BigDecimal gstAmount = BigDecimal.ZERO;
        if (request.getGstPercentage() != null && request.getGstPercentage().compareTo(BigDecimal.ZERO) > 0) {
            gstAmount = subtotal.multiply(request.getGstPercentage()).divide(BigDecimal.valueOf(100));
        }

        BigDecimal discount = request.getDiscountAmount() == null ? BigDecimal.ZERO : request.getDiscountAmount();
        BigDecimal finalAmount = subtotal.add(gstAmount).subtract(discount);
        BigDecimal paidAmount = request.getPaidAmount() == null ? BigDecimal.ZERO : request.getPaidAmount();
        BigDecimal dueAmount = finalAmount.subtract(paidAmount);

        invoice.setSubtotal(subtotal);
        invoice.setGstAmount(gstAmount);
        invoice.setDiscountAmount(discount);
        invoice.setFinalAmount(finalAmount);
        invoice.setPaidAmount(paidAmount);
        invoice.setDueAmount(dueAmount);

        invoice.setPaymentStatus(
                dueAmount.compareTo(BigDecimal.ZERO) <= 0
                        ? PaymentStatus.PAID
                        : paidAmount.compareTo(BigDecimal.ZERO) > 0
                        ? PaymentStatus.PARTIAL
                        : PaymentStatus.UNPAID
        );

        invoice.setNotes(request.getNotes());
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Update customer due
        customer.setCurrentDue(customer.getCurrentDue().add(dueAmount));
        customerRepository.save(customer);

        // Credit history
        CustomerCreditHistory history = new CustomerCreditHistory();
        history.setCustomer(customer);
        history.setTransactionType(CreditTransactionType.INVOICE.name());
        history.setReferenceNo(savedInvoice.getInvoiceNo());
        history.setAmount(dueAmount);
        history.setRemarks("Invoice generated");
        history.setCreatedAt(LocalDateTime.now());
        creditHistoryRepository.save(history);

        // Ledger entry
        LedgerEntry ledger = new LedgerEntry();
        ledger.setCustomer(customer);
        ledger.setEntryType(LedgerEntryType.INVOICE);
        ledger.setReferenceNo(savedInvoice.getInvoiceNo());
        ledger.setDebit(dueAmount);
        ledger.setCredit(BigDecimal.ZERO);
        ledger.setRunningBalance(customer.getCurrentDue());
        ledger.setEntryDate(LocalDateTime.now());
        ledgerRepository.save(ledger);

        return mapToResponse(savedInvoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Integer id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return mapToResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getAllInvoices(int page, int size, Integer customerId, PaymentStatus paymentStatus, InvoiceStatus invoiceStatus) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("invoiceDate").descending());
        Page<Invoice> invoices;

        if (customerId != null && paymentStatus != null) {
            invoices = invoiceRepository.findByCustomerIdAndPaymentStatus(customerId, paymentStatus, pageable);
        } else if (customerId != null) {
            invoices = invoiceRepository.findByCustomerId(customerId, pageable);
        } else if (paymentStatus != null) {
            invoices = invoiceRepository.findByPaymentStatus(paymentStatus, pageable);
        } else if (invoiceStatus != null) {
            invoices = invoiceRepository.findByInvoiceStatus(invoiceStatus, pageable);
        } else {
            invoices = invoiceRepository.findAll(pageable);
        }

        return invoices.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public InvoiceResponse cancelInvoice(Integer id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if (invoice.getInvoiceStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Invoice is already cancelled");
        }

        Customer customer = invoice.getCustomer();
        BigDecimal dueToRevert = invoice.getDueAmount();

        // Revert customer due balance if any remaining
        if (dueToRevert != null && dueToRevert.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal newDue = customer.getCurrentDue().subtract(dueToRevert);
            if (newDue.compareTo(BigDecimal.ZERO) < 0) {
                newDue = BigDecimal.ZERO;
            }
            customer.setCurrentDue(newDue);
            customerRepository.save(customer);

            // Add reversing ledger entry
            LedgerEntry ledger = new LedgerEntry();
            ledger.setCustomer(customer);
            ledger.setEntryType(LedgerEntryType.INVOICE);
            ledger.setReferenceNo("CANCEL-" + invoice.getInvoiceNo());
            ledger.setDebit(BigDecimal.ZERO);
            ledger.setCredit(dueToRevert);
            ledger.setRunningBalance(customer.getCurrentDue());
            ledger.setEntryDate(LocalDateTime.now());
            ledgerRepository.save(ledger);

            // Reversing credit history
            CustomerCreditHistory history = new CustomerCreditHistory();
            history.setCustomer(customer);
            history.setTransactionType(CreditTransactionType.INVOICE.name());
            history.setReferenceNo("CANCEL-" + invoice.getInvoiceNo());
            history.setAmount(dueToRevert.negate());
            history.setRemarks("Invoice cancelled");
            history.setCreatedAt(LocalDateTime.now());
            creditHistoryRepository.save(history);
        }

        invoice.setInvoiceStatus(InvoiceStatus.CANCELLED);
        Invoice cancelledInvoice = invoiceRepository.save(invoice);
        return mapToResponse(cancelledInvoice);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        Customer c = invoice.getCustomer();
        List<InvoiceItemResponse> itemResponses = invoice.getItems() != null
                ? invoice.getItems().stream().map(it -> InvoiceItemResponse.builder()
                        .id(it.getId())
                        .itemCode(it.getItemCode())
                        .itemName(it.getItemName())
                        .brand(it.getBrand())
                        .color(it.getColor())
                        .size(it.getSize())
                        .hsnCode(it.getHsnCode())
                        .quantity(it.getQuantity())
                        .unit(it.getUnit())
                        .rate(it.getRate())
                        .amount(it.getAmount())
                        .build())
                .collect(Collectors.toList())
                : List.of();

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNo(invoice.getInvoiceNo())
                .customerId(c != null ? c.getId() : null)
                .customerName(c != null ? (c.getShopName() != null ? c.getShopName() : c.getOwnerName()) : "Walk-in Customer")
                .customerPhone(c != null ? c.getPhone() : null)
                .customerGstin(c != null ? c.getGstin() : null)
                .customerAddress(c != null ? c.getAddress() : null)
                .subtotal(invoice.getSubtotal())
                .gstAmount(invoice.getGstAmount())
                .discountAmount(invoice.getDiscountAmount())
                .finalAmount(invoice.getFinalAmount())
                .paidAmount(invoice.getPaidAmount())
                .dueAmount(invoice.getDueAmount())
                .paymentStatus(invoice.getPaymentStatus())
                .invoiceStatus(invoice.getInvoiceStatus())
                .notes(invoice.getNotes())
                .invoiceDate(invoice.getInvoiceDate())
                .items(itemResponses)
                .build();
    }
}
