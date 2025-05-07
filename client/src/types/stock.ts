export interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

export type PortfolioMetrics = {
  totalValue: number;
  totalInvestment: number;
  topPerformer: Stock | null;
  worstPerformer: Stock | null;
};