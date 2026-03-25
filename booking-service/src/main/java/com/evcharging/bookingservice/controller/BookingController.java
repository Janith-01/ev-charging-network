package com.evcharging.bookingservice.controller;

import com.evcharging.bookingservice.dto.BookingRequest;
import com.evcharging.bookingservice.dto.BookingResponse;
import com.evcharging.bookingservice.model.Session;
import com.evcharging.bookingservice.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Controller", description = "Manage EV Charging Station Bookings")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new booking",
            description = "Verifies charger availability via Station Service (Circuit Breaker protected) before confirming")
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details", description = "Fetch booking details by booking ID")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user bookings", description = "Fetch all bookings for a specific user")
    public ResponseEntity<List<BookingResponse>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @PutMapping("/{id}/start")
    @Operation(summary = "Start a charging session", description = "Start a new charging session for a confirmed booking")
    public ResponseEntity<Session> startSession(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.startSession(id));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking", description = "Cancel an existing booking")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PutMapping("/{id}/end")
    @Operation(summary = "End a charging session",
            description = "End session and trigger billing to Payment Service. Provide kwhConsumed as query param.")
    public ResponseEntity<Session> endSession(
            @PathVariable Long id,
            @RequestParam Double kwhConsumed
    ) {
        return ResponseEntity.ok(bookingService.endSession(id, kwhConsumed));
    }
}
