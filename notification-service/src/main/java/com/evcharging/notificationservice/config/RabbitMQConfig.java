package com.evcharging.notificationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.queues.booking-confirmed}")
    private String bookingConfirmedQueue;

    @Value("${rabbitmq.queues.payment-completed}")
    private String paymentCompletedQueue;

    @Value("${rabbitmq.routing-keys.booking-confirmed}")
    private String bookingConfirmedRoutingKey;

    @Value("${rabbitmq.routing-keys.payment-completed}")
    private String paymentCompletedRoutingKey;

    // ——— Exchange ———

    @Bean
    public TopicExchange evChargingExchange() {
        return new TopicExchange(exchange);
    }

    // ——— Queues ———

    @Bean
    public Queue bookingConfirmedQueue() {
        return QueueBuilder.durable(bookingConfirmedQueue).build();
    }

    @Bean
    public Queue paymentCompletedQueue() {
        return QueueBuilder.durable(paymentCompletedQueue).build();
    }

    // ——— Bindings ———

    @Bean
    public Binding bookingConfirmedBinding() {
        return BindingBuilder
                .bind(bookingConfirmedQueue())
                .to(evChargingExchange())
                .with(bookingConfirmedRoutingKey);
    }

    @Bean
    public Binding paymentCompletedBinding() {
        return BindingBuilder
                .bind(paymentCompletedQueue())
                .to(evChargingExchange())
                .with(paymentCompletedRoutingKey);
    }

    // ——— JSON Message Converter ———

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
