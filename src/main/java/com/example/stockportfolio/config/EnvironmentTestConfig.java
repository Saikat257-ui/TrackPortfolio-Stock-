package com.example.stockportfolio.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvironmentTestConfig implements InitializingBean {
    
    @Value("${finnhub.api.key:MISSING}")
    private String finnhubApiKey;
    
    @Override
    public void afterPropertiesSet() {
        System.out.println("===========================================");
        System.out.println("Environment Configuration Test");
        System.out.println("===========================================");
        System.out.println("Finnhub API Key: " + (finnhubApiKey != null ? "SET" : "NOT SET"));
        System.out.println("===========================================");
    }
}