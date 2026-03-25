package com.evcharging.paymentservice.repository;

import com.evcharging.paymentservice.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByBookingId(Long bookingId);
    Optional<Invoice> findByPaymentId(Long paymentId);
}
