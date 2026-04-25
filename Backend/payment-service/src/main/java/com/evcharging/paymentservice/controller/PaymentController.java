package com.evcharging.paymentservice.controller;

import com.evcharging.paymentservice.dto.PaymentRequest;
import com.evcharging.paymentservice.dto.PaymentResponse;
import com.evcharging.paymentservice.dto.RefundRequest;
import com.evcharging.paymentservice.model.Payment;
import com.evcharging.paymentservice.model.Refund;
import com.evcharging.paymentservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Controller", description = "Manage EV Charging Payments, Invoices & Refunds")
@Validated
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Process a new payment",
            description = "Triggered by the Booking Service. Creates Payment, Invoice, and Transaction records.")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @GetMapping
    @Operation(summary = "Get all payments", description = "Fetch all payment records")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment details", description = "Fetch specific payment details by payment ID")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable @Positive(message = "Payment id must be positive") Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get invoice by booking",
            description = "Fetch the payment invoice for a specific booking")
    public ResponseEntity<PaymentResponse> getPaymentByBooking(@PathVariable @Positive(message = "Booking id must be positive") Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Process refund",
            description = "Process a refund for a cancelled booking. Validates refund amount does not exceed original payment.")
    public ResponseEntity<Refund> processRefund(
            @PathVariable @Positive(message = "Payment id must be positive") Long id,
            @Valid @RequestBody RefundRequest request
    ) {
        return ResponseEntity.ok(paymentService.processRefund(id, request));
    }

    @GetMapping("/user/{userId}/history")
    @Operation(summary = "Get user payment history",
            description = "Fetch the complete payment ledger for a user")
    public ResponseEntity<List<PaymentResponse>> getPaymentHistory(@PathVariable @Positive(message = "User id must be positive") Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update payment", description = "Update a payment record")
    public ResponseEntity<PaymentResponse> updatePayment(
            @PathVariable @Positive(message = "Payment id must be positive") Long id,
            @Valid @RequestBody Payment request
    ) {
        return ResponseEntity.ok(paymentService.updatePayment(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete payment", description = "Delete payment and its related invoice, transactions, and refunds")
    public ResponseEntity<String> deletePayment(@PathVariable @Positive(message = "Payment id must be positive") Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok("Payment deleted successfully");
    }
}
