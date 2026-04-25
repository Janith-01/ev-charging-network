package com.evcharging.notificationservice.dto;

import com.evcharging.notificationservice.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO carried through RabbitMQ messages.
 * Producers (booking-service, payment-service, etc.) publish this to the exchange.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    @NotNull(message = "User id is required")
    @Positive(message = "User id must be positive")
    private Long userId;

    @NotBlank(message = "Message is required")
    @Size(max = 1000, message = "Message must be at most 1000 characters")
    private String message;

    @NotNull(message = "Notification type is required")
    private NotificationType type;
}
