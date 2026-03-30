package com.evcharging.paymentservice.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * Mirrors the BookingResponse + Session from booking-service
 * for Feign deserialization.
 */
@Data
public class BookingDto {
    private Long id;
    private Long userId;
    private Long stationId;
    private Long chargerId;
    private LocalDate date;
    private String status;
}
