package com.wholesale.store.payments.service.impl;

import com.wholesale.store.payments.entity.PaymentSequence;
import com.wholesale.store.payments.repo.PaymentSequenceRepository;
import com.wholesale.store.payments.service.PaymentNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class PaymentNumberGeneratorImpl
        implements PaymentNumberGenerator {

    private final PaymentSequenceRepository repository;

    @Override
    @Transactional
    public String generateReceiptNumber() {

        String financialYear = String.valueOf(Year.now().getValue());

        PaymentSequence sequence =
                repository.findById(financialYear).orElseGet(() -> {
                            PaymentSequence s = new PaymentSequence();
                            s.setFinancialYear(financialYear);
                            s.setLastNumber(0L);
                            return repository.save(s);
                        });

        Long nextNumber = sequence.getLastNumber() + 1;
        sequence.setLastNumber(nextNumber);
        repository.save(sequence);

        return String.format(
                "RCPT-%s-%06d",
                financialYear,
                nextNumber
        );
    }
}