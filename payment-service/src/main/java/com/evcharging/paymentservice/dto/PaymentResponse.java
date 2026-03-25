package com.evcharging.paymentservice.dto;

import com.evcharging.paymentservice.model.PaymentStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PaymentResponse {
    private Long id;
    private Long userId;
    private Double amount;
    private PaymentStatus status;
    private Long bookingId;
    private Double totalKwh;
    private Double pricePerKwh;
    private LocalDate issueDate;
    private String gatewayReference;
}
