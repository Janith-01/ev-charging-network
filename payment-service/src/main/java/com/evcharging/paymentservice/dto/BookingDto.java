package com.evcharging.paymentservice.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
