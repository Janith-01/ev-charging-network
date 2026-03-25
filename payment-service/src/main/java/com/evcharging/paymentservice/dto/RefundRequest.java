package com.evcharging.paymentservice.dto;

import lombok.Data;

@Data
public class RefundRequest {
    private Double refundAmount;
    private String reason;
}
