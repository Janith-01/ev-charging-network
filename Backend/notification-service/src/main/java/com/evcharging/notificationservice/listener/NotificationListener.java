package com.evcharging.notificationservice.listener;

import com.evcharging.notificationservice.dto.NotificationEvent;
import com.evcharging.notificationservice.model.Notification;
import com.evcharging.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class NotificationListener {

    private final NotificationRepository notificationRepository;

    @RabbitListener(queues = "notification_queue")
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("📩 Received event — userId: {}, type: {}", event.getUserId(), event.getType());

        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .message(event.getMessage())
                .type(event.getType())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        log.info("✅ Notification persisted — id: {}, userId: {}, type: {}",
                saved.getId(), saved.getUserId(), saved.getType());
    }
}
