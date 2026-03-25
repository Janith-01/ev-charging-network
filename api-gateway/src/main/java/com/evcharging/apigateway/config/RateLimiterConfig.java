package com.evcharging.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            // Priority 1: User ID from Authorization Token
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader != null && !authHeader.isEmpty()) {
                return Mono.just(authHeader);
            }
            
            // Priority 2: Fallback to IP address
            String ip = "anonymous";
            if (exchange.getRequest().getRemoteAddress() != null 
                    && exchange.getRequest().getRemoteAddress().getAddress() != null) {
                ip = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
            }
            return Mono.just(ip);
        };
    }
}
