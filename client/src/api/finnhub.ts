import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086/api';

const API = axios.create({
  baseURL: API_BASE_URL
});

interface RequestQueueItem {
  request: () => Promise<void>;
  retryCount: number;
}

class FinnhubAPI {
  private priceCallbacks: Map<string, (price: number) => void> = new Map();
  private requestQueue: RequestQueueItem[] = [];
  private maxRequestsPerSecond: number = 20;
  private requestInterval: number = 1000 / this.maxRequestsPerSecond;
  private lastPrices: Map<string, number> = new Map();
  private isProcessingQueue: boolean = false;
  private lastRequestTime: number = 0;
  
  // Configuration for retry strategy
  private readonly maxRetries: number = 3;
  private readonly baseRetryDelay: number = 1000;
  private readonly maxBackoffDelay: number = 30000;

  private maxConcurrentSymbols: number = 25;
  private activeSymbols: Set<string> = new Set();

  constructor() {
    this.processQueue();
  }

  private calculateBackoffDelay(retryCount: number): number {
    const delay = Math.min(
      this.baseRetryDelay * Math.pow(2, retryCount),
      this.maxBackoffDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  private async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const minDelay = 100;
      const now = Date.now();
      const timeToWait = Math.max(minDelay, this.requestInterval - (now - this.lastRequestTime));
      
      await new Promise(resolve => setTimeout(resolve, timeToWait));

      const item = this.requestQueue.shift();
      if (!item) continue;

      try {
        this.lastRequestTime = Date.now();
        await item.request();
      } catch (error) {
        if (this.shouldRetryRequest(error) && item.retryCount < this.maxRetries) {
          const backoffDelay = this.calculateBackoffDelay(item.retryCount);
          item.retryCount++;
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          this.enqueueRequest(item.request, item.retryCount < this.maxRetries);
          console.log(`Retrying request (attempt ${item.retryCount})`);
        } else {
          console.error('Max retries reached or non-retryable error:', error);
        }
      }
    }

    this.isProcessingQueue = false;
    // Schedule next queue processing
    setTimeout(() => this.processQueue(), this.requestInterval);
  }

  private shouldRetryRequest(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Retry on rate limit (429) or server errors (500+)
      return axiosError.response?.status === 429 || 
             (axiosError.response?.status ?? 0) >= 500;
    }
    return false;
  }

  private enqueueRequest(request: () => Promise<void>, priority: boolean = false) {
    const requestItem: RequestQueueItem = { request, retryCount: 0 };
    if (priority) {
      this.requestQueue.unshift(requestItem);
    } else {
      this.requestQueue.push(requestItem);
    }
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private async fetchAndNotify(symbol: string, retryCount = 3) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const response = await API.get(`/stocks/quote/${symbol}`);
        
        // Validate response data
        const currentPrice = response.data?.c;
        if (typeof currentPrice !== 'number' || isNaN(currentPrice)) {
          throw new Error(`Invalid price data received for ${symbol}`);
        }
        
        const cachedPrice = this.lastPrices.get(symbol);
        
        if (currentPrice !== cachedPrice) {
          this.lastPrices.set(symbol, currentPrice);
          const callback = this.priceCallbacks.get(symbol);
          if (callback) {
            callback(currentPrice);
          }
        }
        return; // Success, exit the retry loop
      } catch (error) {
        lastError = error;
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          
          // Don't retry on 4xx errors (client errors)
          if (status && status >= 400 && status < 500) {
            console.error(`Client error fetching stock data for ${symbol}:`, {
              status,
              data: error.response?.data
            });
            break;
          }
          
          // Log the error but continue retrying for 5xx errors
          console.error(`Attempt ${attempt}/${retryCount} failed for ${symbol}:`, {
            status,
            data: error.response?.data
          });
        } else {
          console.error(`Unexpected error on attempt ${attempt}/${retryCount}:`, error);
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  }

  /**
   * Watch a new stock by symbol.
   * Fetches the current price immediately and sets up a callback for future updates.
   * 
   * @param symbol - The stock symbol to watch.
   * @param callback - Function to call with the updated price.
   */
  public async watchStock(symbol: string, callback: (price: number) => void) {
    if (this.activeSymbols.size >= this.maxConcurrentSymbols) {
      throw new Error(`Maximum number of watched symbols (${this.maxConcurrentSymbols}) reached`);
    }
    
    if (this.activeSymbols.has(symbol)) {
      console.warn(`Symbol ${symbol} is already being watched.`);
      return;
    }

    this.activeSymbols.add(symbol);
    this.priceCallbacks.set(symbol, callback);
    // Enqueue with high priority to fetch immediately
    this.enqueueRequest(() => this.fetchAndNotify(symbol), true);
  }

  /**
   * Unwatch a stock by symbol.
   * Removes the stock from active symbols and deletes its callback.
   * 
   * @param symbol - The stock symbol to unwatch.
   */
  public unwatchStock(symbol: string) {
    if (!this.activeSymbols.has(symbol)) {
      console.warn(`Symbol ${symbol} is not being watched.`);
      return;
    }
    this.activeSymbols.delete(symbol);
    this.priceCallbacks.delete(symbol);
  }

  /**
   * Get the current stock quote without setting up a watch.
   * 
   * @param symbol - The stock symbol to fetch.
   * @returns The stock quote data.
   */
  public async getStockQuote(symbol: string) {
    try {
      const response = await API.get(`/stock/quote/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  }

  /**
   * Search for stocks by query.
   * Returns a list of stocks that match the query.
   * 
   * @param query - The search query.
   * @returns List of stock matches.
   */
  public async searchStocks(query: string) {
    if (!query.trim()) return [];
    
    try {
      // Use the backend search API endpoint we just added
      const response = await API.get(`/stocks/search?q=${encodeURIComponent(query)}`);
      
      if (response.data && Array.isArray(response.data.result)) {
        // Process and map the finnhub response format
        return response.data.result.map((item: { symbol: string; description?: string; type?: string }) => ({
          symbol: item.symbol,
          description: item.description || item.type || `Stock ${item.symbol}`
        })).slice(0, 8); // Limit to top 8 results for usability
      }
      
      return [];
    } catch (error) {
      console.error('Error searching stocks:', error);
      // Try a fallback direct symbol lookup as last resort
      try {
        const symbolResponse = await this.searchBySymbol(query);
        return symbolResponse;
      } catch (innerError) {
        console.error('Stock search failed completely:', innerError);
        return [];
      }
    }
  }

  /**
   * Search for a stock by symbol as fallback when search API fails.
   * Makes individual quote requests when search API is unavailable.
   * 
   * @param symbol - The stock symbol to search for.
   * @returns List of stock matches with basic info.
   */
  private async searchBySymbol(symbol: string): Promise<Array<{symbol: string, description: string}>> {
    if (!symbol.trim()) return [];
    
    try {
      // Try to get a quote for the exact symbol as fallback
      const response = await API.get(`/stocks/quote/${symbol.toUpperCase()}`);
      
      if (response.data && typeof response.data === 'object') {
        // We found a matching symbol
        return [{
          symbol: symbol.toUpperCase(),
          description: `Stock ${symbol.toUpperCase()}`
        }];
      }
      
      return [];
    } catch (error) {
      // Even the fallback failed
      console.error('Direct symbol lookup failed:', error);
      return [];
    }
  }
}

export const finnhubAPI = new FinnhubAPI();