package com.evcharging.bookingservice.service;

import com.evcharging.bookingservice.client.PaymentServiceClient;
import com.evcharging.bookingservice.client.StationServiceClient;
import com.evcharging.bookingservice.dto.*;
import com.evcharging.bookingservice.model.*;
import com.evcharging.bookingservice.repository.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SessionRepository sessionRepository;
    private final StationServiceClient stationServiceClient;
    private final PaymentServiceClient paymentServiceClient;

    // ——— Create Booking with Circuit Breaker on Station lookup ———

    @Transactional
    @CircuitBreaker(name = "stationServiceCB", fallbackMethod = "createBookingFallback")
    public BookingResponse createBooking(BookingRequest request) {
        // 1. Verify charger availability from Station Service
        StationDto station = stationServiceClient.getStationById(request.getStationId());

        if (station.getAvailableSlots() == null || station.getAvailableSlots() <= 0) {
            throw new RuntimeException("No available chargers at station: " + request.getStationId());
        }

        boolean chargerExists = station.getChargers().stream()
                .anyMatch(c -> c.getId().equals(request.getChargerId())
                        && "AVAILABLE".equals(c.getStatus()));

        if (!chargerExists) {
            throw new RuntimeException("Charger " + request.getChargerId()
                    + " is not available at station " + request.getStationId());
        }

        // 2. Create the booking
        Booking booking = Booking.builder()
                .userId(request.getUserId())
                .stationId(request.getStationId())
                .chargerId(request.getChargerId())
                .date(request.getDate())
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    /**
     * Fallback when station-service is unreachable.
     * Creates booking with PENDING status for manual confirmation later.
     */
    public BookingResponse createBookingFallback(BookingRequest request, Throwable t) {
        log.warn("Station Service unavailable. Creating booking as PENDING. Reason: {}", t.getMessage());

        Booking booking = Booking.builder()
                .userId(request.getUserId())
                .stationId(request.getStationId())
                .chargerId(request.getChargerId())
                .date(request.getDate())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    // ——— Get Booking ———

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    public List<BookingResponse> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ——— Start Charging Session ———

    @Transactional
    public Session startSession(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot start session for a cancelled booking");
        }

        if (sessionRepository.findByBookingId(bookingId).isPresent()) {
            throw new RuntimeException("Session already started for booking: " + bookingId);
        }

        Session session = Session.builder()
                .bookingId(bookingId)
                .startTime(LocalDateTime.now())
                .build();

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return sessionRepository.save(session);
    }

    // ——— Cancel Booking ———

    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    // ——— End Session & Trigger Payment (called internally or via separate endpoint) ———

    @Transactional
    public Session endSession(Long bookingId, Double kwhConsumed) {
        Session session = sessionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No active session for booking: " + bookingId));

        if (session.getEndTime() != null) {
            throw new RuntimeException("Session already ended for booking: " + bookingId);
        }

        session.setEndTime(LocalDateTime.now());
        session.setKwhConsumed(kwhConsumed);
        Session saved = sessionRepository.save(session);

        // Trigger billing via Payment Service
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        try {
            StationDto station = stationServiceClient.getStationById(booking.getStationId());
            double amount = kwhConsumed * station.getPricingPerKwh();

            PaymentRequest paymentRequest = PaymentRequest.builder()
                    .bookingId(bookingId)
                    .userId(booking.getUserId())
                    .stationId(booking.getStationId())
                    .amount(amount)
                    .kwhConsumed(kwhConsumed)
                    .build();

            paymentServiceClient.createPayment(paymentRequest);
            log.info("Payment triggered for booking {} — amount: {}", bookingId, amount);
        } catch (Exception e) {
            log.error("Failed to trigger payment for booking {}. Manual reconciliation needed. Error: {}",
                    bookingId, e.getMessage());
        }

        return saved;
    }

    // ——— Mapper ———

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUserId());
        response.setStationId(booking.getStationId());
        response.setChargerId(booking.getChargerId());
        response.setDate(booking.getDate());
        response.setStatus(booking.getStatus());
        return response;
    }
}
