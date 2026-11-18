package com.wholesale.store.payments.service;

import com.wholesale.store.payments.dto.CreatePaymentRequest;
import com.wholesale.store.payments.dto.PaymentResponse;
import org.springframework.data.domain.Page;

public interface PaymentService {

    PaymentResponse receivePayment(CreatePaymentRequest request);

    PaymentResponse getPaymentById(Integer id);

    Page<PaymentResponse> getAllPayments(int page, int size, Integer customerId);
}
