package com.evcharging.bookingservice.repository;

import com.evcharging.bookingservice.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findByBookingId(Long bookingId);
}
