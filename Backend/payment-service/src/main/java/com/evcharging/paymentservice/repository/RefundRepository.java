package com.evcharging.paymentservice.repository;

import com.evcharging.paymentservice.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByPaymentId(Long paymentId);
    void deleteByPaymentId(Long paymentId);
}
