package com.evcharging.paymentservice.service;

import com.evcharging.paymentservice.dto.NotificationEvent;
import com.evcharging.paymentservice.dto.NotificationType;
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

    public void publishPaymentSuccess(Long userId, Long bookingId, Double amount) {
        String message = "Payment successful for booking #" + bookingId + ". Amount: LKR " + amount + ".";
        publish(new NotificationEvent(userId, message, NotificationType.PAYMENT_SUCCESS));
    }

    public void publishPaymentRefunded(Long userId, Long paymentId, Double amount) {
        String message = "Refund processed for payment #" + paymentId + ". Amount: LKR " + amount + ".";
        publish(new NotificationEvent(userId, message, NotificationType.PAYMENT_REFUNDED));
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
