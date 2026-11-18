package com.wholesale.store.reports.service.impl;

import com.wholesale.store.customers.entity.Customer;
import com.wholesale.store.customers.repo.CustomerRepository;
import com.wholesale.store.invoices.dto.InvoiceResponse;
import com.wholesale.store.invoices.entity.Invoice;
import com.wholesale.store.invoices.enums.InvoiceStatus;
import com.wholesale.store.invoices.repo.InvoiceRepository;
import com.wholesale.store.payments.repo.PaymentRepository;
import com.wholesale.store.reports.dto.*;
import com.wholesale.store.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardMetricsResponse getDashboardMetrics() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(LocalTime.MAX);

        YearMonth ym = YearMonth.from(today);
        LocalDateTime monthStart = ym.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = ym.atEndOfMonth().atTime(LocalTime.MAX);

        BigDecimal todaySales = invoiceRepository.getSalesAmountBetween(todayStart, todayEnd);
        BigDecimal todayPayments = paymentRepository.getPaymentsCollectedBetween(todayStart, todayEnd);
        BigDecimal totalOutstandingDue = customerRepository.getTotalOutstandingDues();
        Long activeCustomers = customerRepository.countActiveCustomers();
        Long todayInvoicesCount = invoiceRepository.getInvoiceCountBetween(todayStart, todayEnd);

        BigDecimal monthSales = invoiceRepository.getSalesAmountBetween(monthStart, monthEnd);
        BigDecimal monthPayments = paymentRepository.getPaymentsCollectedBetween(monthStart, monthEnd);

        // Recent Invoices (top 5)
        List<Invoice> recent = invoiceRepository.findAll(
                PageRequest.of(0, 5, Sort.by("invoiceDate").descending())
        ).getContent();

        List<InvoiceResponse> recentResponses = recent.stream()
                .map(this::mapInvoiceSimple)
                .collect(Collectors.toList());

        // Top 5 Dues
        List<Customer> topDues = customerRepository.findByCurrentDueGreaterThanOrderByCurrentDueDesc(BigDecimal.ZERO);
        List<OutstandingCustomerItem> topDueItems = topDues.stream()
                .limit(5)
                .map(this::mapToOutstandingItem)
                .collect(Collectors.toList());

        return DashboardMetricsResponse.builder()
                .todaySales(todaySales)
                .todayPayments(todayPayments)
                .totalOutstandingDue(totalOutstandingDue)
                .activeCustomers(activeCustomers)
                .todayInvoicesCount(todayInvoicesCount)
                .monthSales(monthSales)
                .monthPayments(monthPayments)
                .recentInvoices(recentResponses)
                .topDueCustomers(topDueItems)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OutstandingDuesResponse getOutstandingDuesReport() {
        List<Customer> customers = customerRepository.findByCurrentDueGreaterThanOrderByCurrentDueDesc(BigDecimal.ZERO);

        BigDecimal totalOutstanding = BigDecimal.ZERO;
        BigDecimal bracket0To30 = BigDecimal.ZERO;
        BigDecimal bracket31To60 = BigDecimal.ZERO;
        BigDecimal bracket60Plus = BigDecimal.ZERO;

        List<OutstandingCustomerItem> items = new ArrayList<>();

        for (Customer c : customers) {
            OutstandingCustomerItem item = mapToOutstandingItem(c);
            items.add(item);
            totalOutstanding = totalOutstanding.add(c.getCurrentDue());

            if (item.getDaysOverdue() <= 30) {
                bracket0To30 = bracket0To30.add(c.getCurrentDue());
            } else if (item.getDaysOverdue() <= 60) {
                bracket31To60 = bracket31To60.add(c.getCurrentDue());
            } else {
                bracket60Plus = bracket60Plus.add(c.getCurrentDue());
            }
        }

        return OutstandingDuesResponse.builder()
                .totalOutstanding(totalOutstanding)
                .bracket0To30(bracket0To30)
                .bracket31To60(bracket31To60)
                .bracket60Plus(bracket60Plus)
                .customers(items)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DailySalesReport getDailySalesReport(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        List<Invoice> invoices = invoiceRepository.findByInvoiceDateBetweenAndInvoiceStatusNotOrderByInvoiceDateDesc(
                start, end, InvoiceStatus.CANCELLED
        );

        BigDecimal grossSales = BigDecimal.ZERO;
        BigDecimal gstCollected = BigDecimal.ZERO;
        BigDecimal discountGiven = BigDecimal.ZERO;
        BigDecimal netSales = BigDecimal.ZERO;
        BigDecimal cashCollections = BigDecimal.ZERO;
        BigDecimal creditIssued = BigDecimal.ZERO;

        List<InvoiceResponse> invoiceResponses = new ArrayList<>();

        for (Invoice inv : invoices) {
            grossSales = grossSales.add(inv.getSubtotal() != null ? inv.getSubtotal() : BigDecimal.ZERO);
            gstCollected = gstCollected.add(inv.getGstAmount() != null ? inv.getGstAmount() : BigDecimal.ZERO);
            discountGiven = discountGiven.add(inv.getDiscountAmount() != null ? inv.getDiscountAmount() : BigDecimal.ZERO);
            netSales = netSales.add(inv.getFinalAmount() != null ? inv.getFinalAmount() : BigDecimal.ZERO);
            cashCollections = cashCollections.add(inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO);
            creditIssued = creditIssued.add(inv.getDueAmount() != null ? inv.getDueAmount() : BigDecimal.ZERO);

            invoiceResponses.add(mapInvoiceSimple(inv));
        }

        return DailySalesReport.builder()
                .reportDate(date)
                .totalInvoices((long) invoices.size())
                .grossSales(grossSales)
                .gstCollected(gstCollected)
                .discountGiven(discountGiven)
                .netSales(netSales)
                .cashCollections(cashCollections)
                .creditIssued(creditIssued)
                .invoices(invoiceResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlySummaryReport getMonthlySummaryReport(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(LocalTime.MAX);

        List<Invoice> invoices = invoiceRepository.findByInvoiceDateBetweenAndInvoiceStatusNotOrderByInvoiceDateDesc(
                start, end, InvoiceStatus.CANCELLED
        );

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalGst = BigDecimal.ZERO;
        BigDecimal paidOnInvoices = BigDecimal.ZERO;
        BigDecimal creditIssued = BigDecimal.ZERO;

        for (Invoice inv : invoices) {
            totalRevenue = totalRevenue.add(inv.getFinalAmount() != null ? inv.getFinalAmount() : BigDecimal.ZERO);
            totalGst = totalGst.add(inv.getGstAmount() != null ? inv.getGstAmount() : BigDecimal.ZERO);
            paidOnInvoices = paidOnInvoices.add(inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO);
            creditIssued = creditIssued.add(inv.getDueAmount() != null ? inv.getDueAmount() : BigDecimal.ZERO);
        }

        BigDecimal directPayments = paymentRepository.getPaymentsCollectedBetween(start, end);

        return MonthlySummaryReport.builder()
                .year(year)
                .month(month)
                .totalRevenue(totalRevenue)
                .totalGstCollected(totalGst)
                .totalPaymentsCollected(directPayments)
                .netCreditChange(creditIssued.subtract(directPayments))
                .totalInvoices((long) invoices.size())
                .totalPayments(0L)
                .build();
    }

    private OutstandingCustomerItem mapToOutstandingItem(Customer c) {
        List<Invoice> pending = invoiceRepository.findPendingInvoices(c.getId());
        LocalDateTime oldest = pending.isEmpty() ? null : pending.get(0).getInvoiceDate();

        long days = 0;
        if (oldest != null) {
            days = Math.max(0, ChronoUnit.DAYS.between(oldest.toLocalDate(), LocalDate.now()));
        }

        String bracket = days <= 30 ? "0-30 days" : days <= 60 ? "31-60 days" : "60+ days";

        return OutstandingCustomerItem.builder()
                .customerId(c.getId())
                .shopName(c.getShopName())
                .ownerName(c.getOwnerName())
                .phone(c.getPhone())
                .currentDue(c.getCurrentDue())
                .creditLimit(c.getCreditLimit())
                .oldestPendingInvoiceDate(oldest)
                .daysOverdue(days)
                .agingBracket(bracket)
                .unpaidInvoicesCount((long) pending.size())
                .build();
    }

    private InvoiceResponse mapInvoiceSimple(Invoice inv) {
        Customer c = inv.getCustomer();
        return InvoiceResponse.builder()
                .id(inv.getId())
                .invoiceNo(inv.getInvoiceNo())
                .customerId(c != null ? c.getId() : null)
                .customerName(c != null ? (c.getShopName() != null ? c.getShopName() : c.getOwnerName()) : "Walk-in Customer")
                .customerPhone(c != null ? c.getPhone() : null)
                .finalAmount(inv.getFinalAmount())
                .paidAmount(inv.getPaidAmount())
                .dueAmount(inv.getDueAmount())
                .paymentStatus(inv.getPaymentStatus())
                .invoiceStatus(inv.getInvoiceStatus())
                .invoiceDate(inv.getInvoiceDate())
                .build();
    }
}
