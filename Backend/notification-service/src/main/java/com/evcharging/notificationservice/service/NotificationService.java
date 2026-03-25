package com.evcharging.notificationservice.service;

import com.evcharging.notificationservice.dto.NotificationRequest;
import com.evcharging.notificationservice.dto.NotificationResponse;
import com.evcharging.notificationservice.model.*;
import com.evcharging.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ——— Send / Create Notification ———

    public NotificationResponse sendNotification(NotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .message(request.getMessage())
                .type(request.getType() != null ? request.getType() : NotificationType.BOOKING_CONFIRMATION)
                .channel(request.getChannel() != null ? request.getChannel() : Channel.EMAIL)
                .deliveryStatus(DeliveryStatus.PENDING)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Simulate sending email
        simulateEmailDelivery(saved);

        // Mark as SENT
        saved.setDeliveryStatus(DeliveryStatus.SENT);
        notificationRepository.save(saved);

        log.info("✅ Notification SENT — id: {}, userId: {}, type: {}, channel: {}",
                saved.getId(), saved.getUserId(), saved.getType(), saved.getChannel());

        return mapToResponse(saved);
    }

    // ——— Create Notification from Event (RabbitMQ) ———

    public void createFromEvent(Long userId, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .channel(Channel.EMAIL)
                .deliveryStatus(DeliveryStatus.PENDING)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        simulateEmailDelivery(saved);

        saved.setDeliveryStatus(DeliveryStatus.SENT);
        notificationRepository.save(saved);

        log.info("✅ Event Notification SENT — id: {}, userId: {}, type: {}", saved.getId(), userId, type);
    }

    // ——— Get User Notifications ———

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ——— Get Notification by ID ———

    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        return mapToResponse(notification);
    }

    // ——— Mark as Read ———

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    // ——— Mark All as Read ———

    @Transactional
    public int markAllAsRead(Long userId) {
        int count = notificationRepository.markAllAsReadByUserId(userId);
        log.info("Marked {} notifications as read for userId: {}", count, userId);
        return count;
    }

    // ——— Simulated Email Delivery ———

    private void simulateEmailDelivery(Notification notification) {
        log.info("═══════════════════════════════════════════════════════════");
        log.info("📧 SIMULATED EMAIL DELIVERY");
        log.info("───────────────────────────────────────────────────────────");
        log.info("  To:      User #{}", notification.getUserId());
        log.info("  Type:    {}", notification.getType());
        log.info("  Channel: {}", notification.getChannel());
        log.info("  Message: {}", notification.getMessage());
        log.info("═══════════════════════════════════════════════════════════");
    }

    // ——— Mapper ———

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setUserId(notification.getUserId());
        response.setMessage(notification.getMessage());
        response.setTimestamp(notification.getTimestamp());
        response.setType(notification.getType());
        response.setDeliveryStatus(notification.getDeliveryStatus());
        response.setChannel(notification.getChannel());
        response.setIsRead(notification.getIsRead());
        return response;
    }
}
