package com.evcharging.apigateway.config;

// RateLimiterConfig has been disabled.
// Redis-based RequestRateLimiter was removed to allow the gateway to run without a Redis instance.
// To re-enable: add spring-boot-starter-data-redis-reactive to pom.xml,
// restore the RequestRateLimiter filters in application.yml,
// and uncomment the KeyResolver bean below.

// @Configuration
// public class RateLimiterConfig {
//
//     @Bean
//     public KeyResolver userKeyResolver() {
//         return exchange -> {
//             String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
//             if (authHeader != null && !authHeader.isEmpty()) {
//                 return Mono.just(authHeader);
//             }
//             String ip = "anonymous";
//             if (exchange.getRequest().getRemoteAddress() != null
//                     && exchange.getRequest().getRemoteAddress().getAddress() != null) {
//                 ip = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
//             }
//             return Mono.just(ip);
//         };
//     }
// }
