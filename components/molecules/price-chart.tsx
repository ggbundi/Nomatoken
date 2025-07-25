"use client"

import { useState, useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceBadge } from '@/components/atoms/price-badge';
import { LoadingSpinner } from '@/components/atoms/loading-spinner';
import { TrendingUp } from 'lucide-react';

interface PriceData {
  timestamp: string;
  price: number;
  volume: number;
}

interface PriceChartProps {
  className?: string;
}

export function PriceChart({ className }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState('0.0245');
  const [priceChange, setPriceChange] = useState(12.45);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time price updates
    const generateMockData = () => {
      const data = [];
      const now = new Date();
      const intervals = timeRange === '1H' ? 60 : timeRange === '24H' ? 24 : timeRange === '7D' ? 7 : 30;
      const intervalMs = timeRange === '1H' ? 60000 : timeRange === '24H' ? 3600000 : 86400000;

      for (let i = intervals; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * intervalMs));
        const basePrice = 0.0245;
        const volatility = 0.02;
        const price = basePrice + (Math.random() - 0.5) * volatility;
        
        data.push({
          timestamp: timestamp.toISOString(),
          price: Math.max(0.01, price),
          volume: Math.random() * 100000
        });
      }
      return data;
    };

    setIsLoading(true);
    setTimeout(() => {
      const data = generateMockData();
      setPriceData(data);
      setCurrentPrice(data[data.length - 1]?.price.toFixed(4) || '0.0245');
      
      // Calculate price change
      if (data.length > 1) {
        const change = ((data[data.length - 1].price - data[0].price) / data[0].price) * 100;
        setPriceChange(change);
      }
      
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  // Real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = parseFloat(currentPrice) + (Math.random() - 0.5) * 0.001;
      setCurrentPrice(Math.max(0.01, newPrice).toFixed(4));
      
      // Update the last data point
      setPriceData(prev => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          price: Math.max(0.01, newPrice)
        };
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const timeRangeOptions = ['1H', '24H', '7D', '30D'] as const;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === '1H') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '24H') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-noma-primary" />
            NOMA/USD Price Chart
          </CardTitle>
          <div className="flex gap-1">
            {timeRangeOptions.map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs px-3 py-1"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PriceBadge price={currentPrice} change={priceChange} />
          <div className="text-sm text-muted-foreground">
            Volume: $1.2M (24h)
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTimestamp}
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                domain={['dataMin - 0.001', 'dataMax + 0.001']}
                tickFormatter={(value) => `$${value.toFixed(4)}`}
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
                labelFormatter={(label) => formatTimestamp(label)}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}