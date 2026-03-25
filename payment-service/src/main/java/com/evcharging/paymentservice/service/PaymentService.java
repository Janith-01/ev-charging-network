package com.evcharging.paymentservice.service;

import com.evcharging.paymentservice.client.BookingServiceClient;
import com.evcharging.paymentservice.dto.*;
import com.evcharging.paymentservice.model.*;
import com.evcharging.paymentservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final TransactionRepository transactionRepository;
    private final RefundRepository refundRepository;
    private final BookingServiceClient bookingServiceClient;

    // ——— Process Payment ———

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        Double amount = request.getAmount();
        Double kwhConsumed = request.getKwhConsumed();
        Double pricePerKwh = request.getPricePerKwh();

        // If amount or kwh details are missing, try to fetch from Booking Service
        if ((amount == null || kwhConsumed == null) && request.getBookingId() != null) {
            try {
                BookingDto booking = bookingServiceClient.getBookingById(request.getBookingId());
                log.info("Fetched booking details for bookingId: {}", booking.getId());
                // If the caller didn't provide these, we use defaults
                if (kwhConsumed == null) kwhConsumed = 0.0;
                if (pricePerKwh == null) pricePerKwh = 0.0;
                if (amount == null) amount = kwhConsumed * pricePerKwh;
            } catch (Exception e) {
                log.warn("Could not fetch booking details from Booking Service: {}", e.getMessage());
                if (amount == null) amount = 0.0;
                if (kwhConsumed == null) kwhConsumed = 0.0;
                if (pricePerKwh == null) pricePerKwh = 0.0;
            }
        }

        // Default nulls
        if (amount == null) amount = 0.0;
        if (kwhConsumed == null) kwhConsumed = 0.0;
        if (pricePerKwh == null) pricePerKwh = (kwhConsumed > 0) ? amount / kwhConsumed : 0.0;

        // 1. Create Payment
        Payment payment = Payment.builder()
                .userId(request.getUserId())
                .amount(amount)
                .status(PaymentStatus.COMPLETED)
                .build();
        Payment savedPayment = paymentRepository.save(payment);

        // 2. Create Invoice
        Invoice invoice = Invoice.builder()
                .paymentId(savedPayment.getId())
                .bookingId(request.getBookingId())
                .totalKwh(kwhConsumed)
                .pricePerKwh(pricePerKwh)
                .issueDate(LocalDate.now())
                .build();
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 3. Create Transaction record
        String gatewayRef = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        Transaction transaction = Transaction.builder()
                .paymentId(savedPayment.getId())
                .gatewayReference(gatewayRef)
                .build();
        Transaction savedTxn = transactionRepository.save(transaction);

        log.info("Payment processed — paymentId: {}, amount: {}, txn: {}",
                savedPayment.getId(), amount, gatewayRef);

        return buildResponse(savedPayment, savedInvoice, savedTxn);
    }

    // ——— Get Payment by ID ———

    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        Invoice invoice = invoiceRepository.findByPaymentId(id).orElse(null);
        Transaction txn = transactionRepository.findByPaymentId(id).orElse(null);

        return buildResponse(payment, invoice, txn);
    }

    // ——— Get Invoice by Booking ID ———

    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Invoice invoice = invoiceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No invoice found for bookingId: " + bookingId));

        Payment payment = paymentRepository.findById(invoice.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found for invoice"));

        Transaction txn = transactionRepository.findByPaymentId(payment.getId()).orElse(null);

        return buildResponse(payment, invoice, txn);
    }

    // ——— Refund ———

    @Transactional
    public Refund processRefund(Long paymentId, RefundRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        if (request.getRefundAmount() > payment.getAmount()) {
            throw new RuntimeException("Refund amount exceeds original payment amount");
        }

        Refund refund = Refund.builder()
                .paymentId(paymentId)
                .refundAmount(request.getRefundAmount())
                .reason(request.getReason())
                .build();

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        log.info("Refund processed — paymentId: {}, refundAmount: {}", paymentId, request.getRefundAmount());

        return refundRepository.save(refund);
    }

    // ——— Payment History/Ledger for User ———

    public List<PaymentResponse> getPaymentHistory(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(payment -> {
                    Invoice invoice = invoiceRepository.findByPaymentId(payment.getId()).orElse(null);
                    Transaction txn = transactionRepository.findByPaymentId(payment.getId()).orElse(null);
                    return buildResponse(payment, invoice, txn);
                })
                .collect(Collectors.toList());
    }

    // ——— Response Builder ———

    private PaymentResponse buildResponse(Payment payment, Invoice invoice, Transaction txn) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setUserId(payment.getUserId());
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus());

        if (invoice != null) {
            response.setBookingId(invoice.getBookingId());
            response.setTotalKwh(invoice.getTotalKwh());
            response.setPricePerKwh(invoice.getPricePerKwh());
            response.setIssueDate(invoice.getIssueDate());
        }

        if (txn != null) {
            response.setGatewayReference(txn.getGatewayReference());
        }

        return response;
    }
}
