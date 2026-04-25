package com.evcharging.notificationservice.controller;

import com.evcharging.notificationservice.config.RabbitMQConfig;
import com.evcharging.notificationservice.dto.NotificationEvent;
import com.evcharging.notificationservice.model.Notification;
import com.evcharging.notificationservice.repository.NotificationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
@Tag(name = "Notifications", description = "Notification endpoints for the React frontend")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final RabbitTemplate rabbitTemplate;

    @GetMapping
    @Operation(summary = "Get all notifications")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by id")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        return ResponseEntity.ok(notification);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all notifications for a user, newest first")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping
    @Operation(summary = "Create notification directly")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .message(request.getMessage())
                .type(request.getType())
                .isRead(request.getIsRead() != null ? request.getIsRead() : false)
                .build();

        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update notification")
    public ResponseEntity<Notification> updateNotification(
            @PathVariable Long id,
            @RequestBody Notification request
    ) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notification.setUserId(request.getUserId());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType());
        if (request.getIsRead() != null) {
            notification.setIsRead(request.getIsRead());
        }

        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);

        log.info("Notification {} marked as read", id);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification")
    public ResponseEntity<String> deleteNotification(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notificationRepository.delete(notification);
        return ResponseEntity.ok("Notification deleted successfully");
    }

    @PostMapping("/test-send")
    @Operation(summary = "Manually publish a notification event to RabbitMQ (for Swagger testing)")
    public ResponseEntity<String> testSend(@RequestBody NotificationEvent event) {
        String routingKey = "notification." + event.getType().name().toLowerCase();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                routingKey,
                event
        );

        log.info("Test event published with routingKey: {} for userId: {}", routingKey, event.getUserId());
        return ResponseEntity.ok("Event published to exchange '" + RabbitMQConfig.EXCHANGE
                + "' with routingKey '" + routingKey + "'");
    }
}
