package com.evcharging.bookingservice.service;

import com.evcharging.bookingservice.dto.NotificationEvent;
import com.evcharging.bookingservice.dto.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private static final String EXCHANGE = "ev_exchange";

    private final RabbitTemplate rabbitTemplate;

    public void publishBookingConfirmed(Long userId, Long bookingId, Long stationId) {
        String message = "Booking #" + bookingId + " confirmed for station #" + stationId + ".";
        publish(new NotificationEvent(userId, message, NotificationType.BOOKING_CONFIRMED));
    }

    public void publishBookingCancelled(Long userId, Long bookingId) {
        String message = "Booking #" + bookingId + " was cancelled.";
        publish(new NotificationEvent(userId, message, NotificationType.BOOKING_CANCELLED));
    }

    public void publishSystemAlert(Long userId, String message) {
        publish(new NotificationEvent(userId, message, NotificationType.SYSTEM_ALERT));
    }

    private void publish(NotificationEvent event) {
        String routingKey = "notification." + event.getType().name().toLowerCase();
        try {
            rabbitTemplate.convertAndSend(EXCHANGE, routingKey, event);
            log.info("Published notification event type={} userId={}", event.getType(), event.getUserId());
        } catch (Exception ex) {
            log.warn("Failed to publish notification event type={} userId={}: {}",
                    event.getType(), event.getUserId(), ex.getMessage());
        }
    }
}
