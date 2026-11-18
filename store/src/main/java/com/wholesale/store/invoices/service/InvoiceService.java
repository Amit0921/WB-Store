package com.wholesale.store.invoices.service;

import com.wholesale.store.invoices.dto.CreateInvoiceRequest;
import com.wholesale.store.invoices.dto.InvoiceResponse;
import com.wholesale.store.invoices.enums.InvoiceStatus;
import com.wholesale.store.invoices.enums.PaymentStatus;
import org.springframework.data.domain.Page;

public interface InvoiceService {

    InvoiceResponse createInvoice(CreateInvoiceRequest request);

    InvoiceResponse getInvoiceById(Integer id);

    Page<InvoiceResponse> getAllInvoices(int page, int size, Integer customerId, PaymentStatus paymentStatus, InvoiceStatus invoiceStatus);

    InvoiceResponse cancelInvoice(Integer id);
}
