package com.example.stockportfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class StockPortfolioApplication {
    public static void main(String[] args) {
        SpringApplication.run(StockPortfolioApplication.class, args);
    }

    @Bean
    CommandLineRunner validateEnvironment(Environment env) {
        return args -> {
            String apiKey = env.getProperty("finnhub.api.key");
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new IllegalStateException(
                    "Finnhub API key is not configured. Please set FINNHUB_API_KEY environment variable."
                );
            }
            System.out.println("Environment validation successful - Finnhub API key is configured.");
        };
    }
}
