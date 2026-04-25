package com.evcharging.paymentservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    @NotNull(message = "User id is required")
    @Positive(message = "User id must be positive")
    private Long userId;

    @Column(nullable = false)
    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount cannot be negative")
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Payment status is required")
    private PaymentStatus status;
}
