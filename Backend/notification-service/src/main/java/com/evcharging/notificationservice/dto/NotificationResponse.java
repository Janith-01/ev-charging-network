package com.evcharging.notificationservice.dto;

import com.evcharging.notificationservice.model.Channel;
import com.evcharging.notificationservice.model.DeliveryStatus;
import com.evcharging.notificationservice.model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String message;
    private LocalDateTime timestamp;
    private NotificationType type;
    private DeliveryStatus deliveryStatus;
    private Channel channel;
    private Boolean isRead;
}
