package com.evcharging.paymentservice.client;

import com.evcharging.paymentservice.dto.BookingDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * FeignClient to call Booking Service.
 * Uses URL-based configuration to avoid circular startup dependency
 * (booking-service also calls payment-service, but via its own Feign URL config).
 * No service-discovery coupling — both services resolve each other by explicit URL.
 */
@FeignClient(
        name = "booking-service",
        url = "${feign.booking-service.url}"
)
public interface BookingServiceClient {

    @GetMapping("/api/bookings/{id}")
    BookingDto getBookingById(@PathVariable("id") Long id);
}
