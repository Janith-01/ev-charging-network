package com.evcharging.notificationservice.controller;

import com.evcharging.notificationservice.dto.NotificationRequest;
import com.evcharging.notificationservice.dto.NotificationResponse;
import com.evcharging.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Controller", description = "Manage EV Charging Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    @Operation(summary = "Send notification",
            description = "Manually trigger a notification (Admin/System use)")
    public ResponseEntity<NotificationResponse> sendNotification(@RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.sendNotification(request));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user notifications",
            description = "Fetch all notifications for a specific user, ordered by most recent")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID",
            description = "Fetch a specific notification by its ID")
    public ResponseEntity<NotificationResponse> getNotification(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark as read",
            description = "Mark a specific notification as read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/user/{userId}/read-all")
    @Operation(summary = "Mark all as read",
            description = "Mark all notifications for a user as read")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@PathVariable Long userId) {
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read",
                "count", count
        ));
    }
}
