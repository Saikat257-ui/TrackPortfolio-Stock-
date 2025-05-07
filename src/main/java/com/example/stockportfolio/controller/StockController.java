package com.example.stockportfolio.controller;

import com.example.stockportfolio.model.Stock;
import com.example.stockportfolio.service.FinnhubService;
import com.example.stockportfolio.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
public class StockController {
    
    @Autowired
    private StockService stockService;
    
    @Autowired
    private FinnhubService finnhubService;
    
    @GetMapping
    public List<Stock> getAllStocks() {
        return stockService.getAllStocks();
    }
    
    @PostMapping
    public Stock addStock(@RequestBody Stock stock) {
        return stockService.addStock(stock);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Stock> updateStock(@PathVariable Long id, @RequestBody Stock stock) {
        Stock updatedStock = stockService.updateStock(id, stock);
        if (updatedStock != null) {
            return ResponseEntity.ok(updatedStock);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        stockService.deleteStock(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/portfolio-value")
    public double getPortfolioValue() {
        return stockService.getPortfolioValue();
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Service operational");
    }
    
    @GetMapping("/quote/{symbol}")
    public ResponseEntity<Map<String, Object>> getStockQuote(@PathVariable String symbol) {
        try {
            Map<String, Object> quote = finnhubService.getQuote(symbol);
            return ResponseEntity.ok(quote);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of("error", "Error fetching stock quote: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchStocks(@RequestParam("q") String query) {
        try {
            Map<String, Object> searchResults = finnhubService.searchSymbols(query);
            return ResponseEntity.ok(searchResults);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of("error", "Error searching stocks: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
