package com.wholesale.store.payments.service;

import com.wholesale.store.payments.dto.CreatePaymentRequest;
import com.wholesale.store.payments.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse receivePayment(CreatePaymentRequest request);

}