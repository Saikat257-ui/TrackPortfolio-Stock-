package com.example.stockportfolio.service;

import com.example.stockportfolio.model.Stock;
import com.example.stockportfolio.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StockService {
    
    private final StockRepository stockRepository;
    
    @Autowired
    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }
    
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }
    
    public Stock addStock(Stock stock) {
        return stockRepository.save(stock);
    }
    
    public Stock updateStock(Long id, Stock stockDetails) {
        return stockRepository.findById(id)
            .map(existingStock -> {
                existingStock.setSymbol(stockDetails.getSymbol());
                existingStock.setName(stockDetails.getName());
                existingStock.setQuantity(stockDetails.getQuantity());
                existingStock.setPurchasePrice(stockDetails.getPurchasePrice());
                return stockRepository.save(existingStock);
            })
            .orElse(null);
    }
    
    public void deleteStock(Long id) {
        stockRepository.deleteById(id);
    }
    
    public double getPortfolioValue() {
        List<Stock> stocks = stockRepository.findAll();
        return stocks.stream()
            .map(stock -> stock.getCurrentPrice().multiply(BigDecimal.valueOf(stock.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .doubleValue();
    }
}
