package com.wholesale.store.payments.controller;

import com.wholesale.store.common.response.ApiResponse;
import com.wholesale.store.payments.dto.CreatePaymentRequest;
import com.wholesale.store.payments.dto.PaymentResponse;
import com.wholesale.store.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> receivePayment(
            @RequestBody CreatePaymentRequest request
    ) {
        return ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment received successfully")
                .data(paymentService.receivePayment(request))
                .build();
    }
}