package com.wholesale.store.invoices.service.impl;

import com.wholesale.store.invoices.entity.InvoiceSequence;
import com.wholesale.store.invoices.repo.InvoiceSequenceRepository;
import com.wholesale.store.invoices.service.InvoiceNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class InvoiceNumberGeneratorImpl implements InvoiceNumberGenerator {

    private final InvoiceSequenceRepository repository;

    @Override
    @Transactional
    public String generateInvoiceNumber() {

        String financialYear = String.valueOf(Year.now().getValue());

        InvoiceSequence sequence =
                repository.findById(financialYear)
                        .orElseGet(() -> {
                            InvoiceSequence s =
                                    new InvoiceSequence();
                            s.setFinancialYear(financialYear);
                            s.setLastNumber(0L);
                            return repository.save(s);
                        });

        Long nextNumber = sequence.getLastNumber() + 1;
        sequence.setLastNumber(nextNumber);
        repository.save(sequence);

        return String.format(
                "INV-%s-%06d",
                financialYear,
                nextNumber
        );
    }
}