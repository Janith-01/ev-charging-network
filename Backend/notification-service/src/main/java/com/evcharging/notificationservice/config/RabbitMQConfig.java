package com.evcharging.notificationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SuppressWarnings("null")
public class RabbitMQConfig {

    public static final String QUEUE = "notification_queue";
    public static final String EXCHANGE = "ev_exchange";
    public static final String ROUTING_KEY = "notification.#";

    // ——— Queue ———

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    // ——— Exchange ———

    @Bean
    public TopicExchange evExchange() {
        return new TopicExchange(EXCHANGE);
    }

    // ——— Binding: notification.# → notification_queue ———

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange evExchange) {
        return BindingBuilder
                .bind(notificationQueue)
                .to(evExchange)
                .with(ROUTING_KEY);
    }

    // ——— JSON Serialization ———

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
