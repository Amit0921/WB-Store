package com.wholesale.store.invoices.service;

import com.wholesale.store.invoices.dto.CreateInvoiceRequest;
import com.wholesale.store.invoices.dto.InvoiceResponse;

public interface InvoiceService {

    InvoiceResponse createInvoice(
            CreateInvoiceRequest request
    );
}