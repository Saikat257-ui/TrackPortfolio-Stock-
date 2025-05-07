package com.example.stockportfolio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

@Configuration
@PropertySources({
    @PropertySource(value = "file:.env", ignoreResourceNotFound = true),
    @PropertySource(value = "classpath:application.properties")
})
public class EnvironmentConfig {
    // Configuration class to load environment variables
}