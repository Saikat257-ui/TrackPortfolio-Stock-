import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Stock, PortfolioMetrics } from '../types/stock';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  stocks: Stock[];
  metrics: PortfolioMetrics;
}

export const Dashboard: React.FC<DashboardProps> = ({ stocks, metrics }) => {
  const chartData = stocks.map(stock => ({
    name: stock.symbol,
    currentValue: stock.currentPrice,
    investedValue: stock.buyPrice,
  }));

  const [displayTopPerformer, setDisplayTopPerformer] = useState<Stock | null>(null);
  const [displayWorstPerformer, setDisplayWorstPerformer] = useState<Stock | null>(null);
  const [showPortfolioDistribution, setShowPortfolioDistribution] = useState(false);

  // Calculate portfolio distribution data for pie chart
  const portfolioDistributionData = stocks.map(stock => {
    const value = stock.currentPrice;
    return {
      name: stock.symbol,
      value: value,
    };
  });

  // Define colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#6BCB77', '#4D96FF', '#9900EF', '#FCFF6C'];

  useEffect(() => {
    if (stocks.length >= 2) {
      setDisplayTopPerformer(metrics.topPerformer);
      setDisplayWorstPerformer(metrics.worstPerformer);
    }
    
    // Show portfolio distribution only when stocks are available
    setShowPortfolioDistribution(stocks.length > 0);
  }, [stocks, metrics.topPerformer, metrics.worstPerformer]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">Total Value</h3>
          <DollarSign className="h-8 w-8 text-green-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100 transition-all">
          ${metrics.totalValue.toLocaleString()}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">Total Investment</h3>
          <PieChartIcon className="h-8 w-8 text-blue-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100 transition-all">
          ${metrics.totalInvestment.toLocaleString()}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">Top Performer</h3>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
        <p className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          {displayTopPerformer ? displayTopPerformer.symbol : 'N/A'}
        </p>
        <p className="text-sm text-green-600 dark:text-green-400">
          {displayTopPerformer
            ? `${((displayTopPerformer.currentPrice - displayTopPerformer.buyPrice) / displayTopPerformer.buyPrice * 100).toFixed(2)}%`
            : 'N/A'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">Worst Performer</h3>
          <TrendingDown className="h-8 w-8 text-red-500" />
        </div>
        <p className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          {displayWorstPerformer ? displayWorstPerformer.symbol : 'N/A'}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          {displayWorstPerformer
            ? `${((displayWorstPerformer.currentPrice - displayWorstPerformer.buyPrice) / displayWorstPerformer.buyPrice * 100).toFixed(2)}%`
            : 'N/A'}
        </p>
      </div>

      <div className={`col-span-1 md:col-span-2 ${!showPortfolioDistribution ? 'md:col-span-4' : ''} bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:translate-y-1`}>
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-300">
          Portfolio Value Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="currentValue"
              fill="#10B981"
              name="Current Value"
              animationDuration={1000}
            />
            <Bar
              dataKey="investedValue"
              fill="#3B82F6"
              name="Invested Value"
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showPortfolioDistribution && (
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-700 opacity-100 max-h-[1000px] overflow-hidden portfolio-distribution-container hover:scale-102 hover:shadow-2xl hover:translate-y-1">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-300">Portfolio Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfolioDistributionData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                animationDuration={1000}
              >
                {portfolioDistributionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => typeof value === 'number' ? `$${value.toFixed(2)}` : `$${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
