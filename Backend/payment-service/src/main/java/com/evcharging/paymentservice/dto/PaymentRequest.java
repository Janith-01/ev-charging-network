package com.evcharging.paymentservice.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long bookingId;
    private Long userId;
    private Long stationId;
    private Double amount;
    private Double kwhConsumed;
    private Double pricePerKwh;
}
