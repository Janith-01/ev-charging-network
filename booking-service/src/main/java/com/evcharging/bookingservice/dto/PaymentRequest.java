package com.evcharging.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentRequest {
    private Long bookingId;
    private Long userId;
    private Long stationId;
    private Double amount;
    private Double kwhConsumed;
}
