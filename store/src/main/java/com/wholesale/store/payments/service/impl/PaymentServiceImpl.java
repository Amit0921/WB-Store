package com.wholesale.store.payments.service.impl;

import com.wholesale.store.common.exception.BadRequestException;
import com.wholesale.store.common.exception.ResourceNotFoundException;
import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.customers.repo.CustomerRepository;
import com.wholesale.store.invoices.entity.Invoice;
import com.wholesale.store.invoices.enums.PaymentStatus;
import com.wholesale.store.invoices.repo.InvoiceRepository;
import com.wholesale.store.ledger.entity.CustomerCreditHistory;
import com.wholesale.store.ledger.entity.LedgerEntry;
import com.wholesale.store.invoices.enums.CreditTransactionType;
import com.wholesale.store.invoices.repo.CustomerCreditHistoryRepository;
import com.wholesale.store.ledger.enums.LedgerEntryType;
import com.wholesale.store.ledger.repo.LedgerRepository;
import com.wholesale.store.payments.dto.CreatePaymentRequest;
import com.wholesale.store.payments.dto.PaymentResponse;
import com.wholesale.store.payments.entity.Payment;
import com.wholesale.store.payments.repo.PaymentRepository;
import com.wholesale.store.payments.service.PaymentNumberGenerator;
import com.wholesale.store.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl
        implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final LedgerRepository ledgerRepository;
    private final CustomerCreditHistoryRepository creditHistoryRepository;
    private final PaymentNumberGenerator paymentNumberGenerator;

    @Override
    @Transactional
    public PaymentResponse receivePayment(
            CreatePaymentRequest request
    ) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        BigDecimal paymentAmount = request.getAmount();

        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        if(paymentAmount.compareTo(customer.getCurrentDue()) > 0){
            throw new BadRequestException("Payment exceeds customer due amount");
        }

        BigDecimal remainingAmount = paymentAmount;

        List<Invoice> pendingInvoices =
                invoiceRepository.findPendingInvoices(customer.getId());

        for (Invoice invoice : pendingInvoices) {

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
        customer.setCurrentDue(customer.getCurrentDue().subtract(paymentAmount));
        customerRepository.save(customer);

        Payment payment = new Payment();
        payment.setCustomer(customer);
        payment.setAmount(paymentAmount);
        payment.setPaymentMode(request.getPaymentMode());
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setNotes(request.getNotes());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setReceiptNo(paymentNumberGenerator.generateReceiptNumber());
        paymentRepository.save(payment);

        CustomerCreditHistory history = new CustomerCreditHistory();
        history.setCustomer(customer);
        history.setTransactionType(CreditTransactionType.PAYMENT.name());
        history.setReferenceNo(payment.getId().toString());
        history.setAmount(paymentAmount.negate());
        history.setRemarks("Payment received");
        history.setCreatedAt(LocalDateTime.now());
        creditHistoryRepository.save(history);

        LedgerEntry ledger = new LedgerEntry();
        ledger.setCustomer(customer);
        ledger.setEntryType(LedgerEntryType.PAYMENT);
        ledger.setReferenceNo(payment.getId().toString());
        ledger.setDebit(BigDecimal.ZERO);
        ledger.setCredit(paymentAmount);
        ledger.setRunningBalance(customer.getCurrentDue());
        ledger.setEntryDate(LocalDateTime.now());
        ledgerRepository.save(ledger);

        return PaymentResponse.builder()
                .customerName(customer.getShopName())
                .paidAmount(paymentAmount)
                .remainingDue(customer.getCurrentDue())
                .build();
    }
}