package com.evcharging.notificationservice.dto;

import com.evcharging.notificationservice.model.Channel;
import com.evcharging.notificationservice.model.NotificationType;
import lombok.Data;

@Data
public class NotificationRequest {
    private Long userId;
    private String message;
    private NotificationType type;
    private Channel channel;
}
