import axios from 'axios';
import { Stock } from '../types/stock';

const API_BASE_URL = 'http://localhost:8086/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const stockApi = {
  getAllStocks: async (): Promise<Stock[]> => {
    const response = await api.get('/stocks');
    return response.data;
  },

  addStock: async (stock: Stock): Promise<Stock> => {
    const response = await api.post('/stocks', stock);
    return response.data;
  },

  updateStock: async (id: number, stock: Stock): Promise<Stock> => {
    const response = await api.put(`/stocks/${id}`, stock);
    return response.data;
  },

  deleteStock: async (id: number): Promise<void> => {
    await api.delete(`/stocks/${id}`);
  },

  getPortfolioValue: async (): Promise<number> => {
    const response = await api.get('/stocks/portfolio-value');
    return response.data;
  },
};
