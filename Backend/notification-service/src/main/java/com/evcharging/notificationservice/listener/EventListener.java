package com.evcharging.notificationservice.listener;

import com.evcharging.notificationservice.dto.NotificationEvent;
import com.evcharging.notificationservice.model.NotificationType;
import com.evcharging.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventListener {

    private final NotificationService notificationService;

    /**
     * Consumes booking_confirmed events from RabbitMQ.
     * Saves a BOOKING_CONFIRMATION notification and simulates email delivery.
     */
    @RabbitListener(queues = "${rabbitmq.queues.booking-confirmed}")
    public void handleBookingConfirmed(NotificationEvent event) {
        log.info("📥 Received booking_confirmed event — userId: {}, bookingId: {}",
                event.getUserId(), event.getBookingId());

        String message = event.getMessage() != null
                ? event.getMessage()
                : String.format("Your booking #%d has been confirmed! " +
                    "Please arrive at the charging station on time.", event.getBookingId());

        notificationService.createFromEvent(
                event.getUserId(),
                message,
                NotificationType.BOOKING_CONFIRMATION
        );
    }

    /**
     * Consumes payment_completed events from RabbitMQ.
     * Saves a PAYMENT_RECEIPT notification and simulates email delivery.
     */
    @RabbitListener(queues = "${rabbitmq.queues.payment-completed}")
    public void handlePaymentCompleted(NotificationEvent event) {
        log.info("📥 Received payment_completed event — userId: {}, bookingId: {}",
                event.getUserId(), event.getBookingId());

        String message = event.getMessage() != null
                ? event.getMessage()
                : String.format("Payment for booking #%d has been processed successfully. " +
                    "Your receipt is now available in your account.", event.getBookingId());

        notificationService.createFromEvent(
                event.getUserId(),
                message,
                NotificationType.PAYMENT_RECEIPT
        );
    }
}
