package com.wholesale.store.payments.service.impl;

import com.wholesale.store.common.exception.BadRequestException;
import com.wholesale.store.common.exception.ResourceNotFoundException;
import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.customers.repo.CustomerRepository;
import com.wholesale.store.invoices.entity.Invoice;
import com.wholesale.store.invoices.enums.CreditTransactionType;
import com.wholesale.store.invoices.enums.PaymentStatus;
import com.wholesale.store.invoices.repo.CustomerCreditHistoryRepository;
import com.wholesale.store.invoices.repo.InvoiceRepository;
import com.wholesale.store.ledger.entity.CustomerCreditHistory;
import com.wholesale.store.ledger.entity.LedgerEntry;
import com.wholesale.store.ledger.enums.LedgerEntryType;
import com.wholesale.store.ledger.repo.LedgerRepository;
import com.wholesale.store.payments.dto.CreatePaymentRequest;
import com.wholesale.store.payments.dto.PaymentResponse;
import com.wholesale.store.payments.entity.Payment;
import com.wholesale.store.payments.repo.PaymentRepository;
import com.wholesale.store.payments.service.PaymentNumberGenerator;
import com.wholesale.store.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final LedgerRepository ledgerRepository;
    private final CustomerCreditHistoryRepository creditHistoryRepository;
    private final PaymentNumberGenerator paymentNumberGenerator;

    @Override
    @Transactional
    public PaymentResponse receivePayment(CreatePaymentRequest request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        BigDecimal paymentAmount = request.getAmount();

        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        if (paymentAmount.compareTo(customer.getCurrentDue()) > 0) {
            throw new BadRequestException("Payment amount exceeds customer total outstanding due (₹" + customer.getCurrentDue() + ")");
        }

        Invoice specificInvoice = null;
        BigDecimal remainingAmount = paymentAmount;

        // Manual settlement against specific invoice if provided
        if (request.getInvoiceId() != null) {
            specificInvoice = invoiceRepository.findById(request.getInvoiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + request.getInvoiceId()));

            BigDecimal invoiceDue = specificInvoice.getDueAmount();
            if (remainingAmount.compareTo(invoiceDue) >= 0) {
                specificInvoice.setPaidAmount(specificInvoice.getPaidAmount().add(invoiceDue));
                specificInvoice.setDueAmount(BigDecimal.ZERO);
                specificInvoice.setPaymentStatus(PaymentStatus.PAID);
                remainingAmount = remainingAmount.subtract(invoiceDue);
            } else {
                specificInvoice.setPaidAmount(specificInvoice.getPaidAmount().add(remainingAmount));
                specificInvoice.setDueAmount(invoiceDue.subtract(remainingAmount));
                specificInvoice.setPaymentStatus(PaymentStatus.PARTIAL);
                remainingAmount = BigDecimal.ZERO;
            }
            invoiceRepository.save(specificInvoice);
        }

        // FIFO settlement on remaining amount across older pending invoices
        if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            List<Invoice> pendingInvoices = invoiceRepository.findPendingInvoices(customer.getId());

            for (Invoice invoice : pendingInvoices) {
                if (specificInvoice != null && invoice.getId().equals(specificInvoice.getId())) {
                    continue; // Already settled
                }

                if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }

                BigDecimal invoiceDue = invoice.getDueAmount();
                if (remainingAmount.compareTo(invoiceDue) >= 0) {
                    invoice.setPaidAmount(invoice.getPaidAmount().add(invoiceDue));
                    invoice.setDueAmount(BigDecimal.ZERO);
                    invoice.setPaymentStatus(PaymentStatus.PAID);
                    remainingAmount = remainingAmount.subtract(invoiceDue);
                } else {
                    invoice.setPaidAmount(invoice.getPaidAmount().add(remainingAmount));
                    invoice.setDueAmount(invoiceDue.subtract(remainingAmount));
                    invoice.setPaymentStatus(PaymentStatus.PARTIAL);
                    remainingAmount = BigDecimal.ZERO;
                }
                invoiceRepository.save(invoice);
            }
        }

        // Update customer total outstanding due
        BigDecimal updatedDue = customer.getCurrentDue().subtract(paymentAmount);
        if (updatedDue.compareTo(BigDecimal.ZERO) < 0) {
            updatedDue = BigDecimal.ZERO;
        }
        customer.setCurrentDue(updatedDue);
        customerRepository.save(customer);

        // Record Payment Voucher
        Payment payment = new Payment();
        payment.setCustomer(customer);
        payment.setInvoice(specificInvoice);
        payment.setAmount(paymentAmount);
        payment.setPaymentMode(request.getPaymentMode());
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setNotes(request.getNotes());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setReceiptNo(paymentNumberGenerator.generateReceiptNumber());
        Payment savedPayment = paymentRepository.save(payment);

        // Record credit history
        CustomerCreditHistory history = new CustomerCreditHistory();
        history.setCustomer(customer);
        history.setTransactionType(CreditTransactionType.PAYMENT.name());
        history.setReferenceNo(savedPayment.getReceiptNo());
        history.setAmount(paymentAmount.negate());
        history.setRemarks("Payment received via " + request.getPaymentMode());
        history.setCreatedAt(LocalDateTime.now());
        creditHistoryRepository.save(history);

        // Record double-entry ledger credit
        LedgerEntry ledger = new LedgerEntry();
        ledger.setCustomer(customer);
        ledger.setEntryType(LedgerEntryType.PAYMENT);
        ledger.setReferenceNo(savedPayment.getReceiptNo());
        ledger.setDebit(BigDecimal.ZERO);
        ledger.setCredit(paymentAmount);
        ledger.setRunningBalance(customer.getCurrentDue());
        ledger.setEntryDate(LocalDateTime.now());
        ledgerRepository.save(ledger);

        return mapToResponse(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment receipt not found with id: " + id));
        return mapToResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(int page, int size, Integer customerId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("paymentDate").descending());
        Page<Payment> payments;

        if (customerId != null) {
            payments = paymentRepository.findByCustomerId(customerId, pageable);
        } else {
            payments = paymentRepository.findAll(pageable);
        }

        return payments.map(this::mapToResponse);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        Customer c = payment.getCustomer();
        Invoice inv = payment.getInvoice();

        return PaymentResponse.builder()
                .id(payment.getId())
                .receiptNo(payment.getReceiptNo())
                .customerId(c != null ? c.getId() : null)
                .customerName(c != null ? (c.getShopName() != null ? c.getShopName() : c.getOwnerName()) : "Walk-in Customer")
                .customerPhone(c != null ? c.getPhone() : null)
                .invoiceId(inv != null ? inv.getId() : null)
                .invoiceNo(inv != null ? inv.getInvoiceNo() : null)
                .amount(payment.getAmount())
                .paidAmount(payment.getAmount())
                .paymentMode(payment.getPaymentMode())
                .referenceNumber(payment.getReferenceNumber())
                .notes(payment.getNotes())
                .paymentDate(payment.getPaymentDate())
                .remainingDue(c != null ? c.getCurrentDue() : BigDecimal.ZERO)
                .build();
    }
}
