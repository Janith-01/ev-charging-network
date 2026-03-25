package com.evcharging.bookingservice.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {
    private Long userId;
    private Long stationId;
    private Long chargerId;
    private LocalDate date;
}
