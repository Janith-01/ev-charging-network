package com.evcharging.bookingservice.dto;

import com.evcharging.bookingservice.model.BookingStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingResponse {
    private Long id;
    private Long userId;
    private Long stationId;
    private Long chargerId;
    private LocalDate date;
    private BookingStatus status;
}
