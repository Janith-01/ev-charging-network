package com.evcharging.paymentservice.repository;

import com.evcharging.paymentservice.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByPaymentId(Long paymentId);
}
