package com.evcharging.notificationservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;

/**
 * Event payload consumed from RabbitMQ queues.
 * Published by booking-service and payment-service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {
    private String eventType;    // "booking_confirmed" or "payment_completed"
    private Long userId;
    private Long bookingId;
    private String message;
    private String email;
}
