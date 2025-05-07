package com.example.stockportfolio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.Map;
import javax.annotation.PostConstruct;

@Service
public class FinnhubService {
    
    @Value("${finnhub.api.key:#{null}}")
    private String apiKey;
    
    private final String FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
    private final RestTemplate restTemplate;
    
    public FinnhubService() {
        this.restTemplate = new RestTemplate();
    }

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("FINNHUB_API_KEY environment variable is not set. Please set it in your .env file.");
        }
    }
    
    @SuppressWarnings("unchecked")
    public Map<String, Object> getQuote(String symbol) {
        String url = UriComponentsBuilder
            .fromHttpUrl(FINNHUB_BASE_URL)
            .path("/quote")
            .queryParam("symbol", symbol.toUpperCase())
            .queryParam("token", apiKey)
            .toUriString();
            
        return restTemplate.getForObject(url, Map.class);
    }
    
    @SuppressWarnings("unchecked")
    public Map<String, Object> searchSymbols(String query) {
        String url = UriComponentsBuilder
            .fromHttpUrl(FINNHUB_BASE_URL)
            .path("/search")
            .queryParam("q", query)
            .queryParam("token", apiKey)
            .toUriString();
            
        return restTemplate.getForObject(url, Map.class);
    }
}
