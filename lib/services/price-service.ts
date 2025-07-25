// Price service for fetching real-time cryptocurrency prices
export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: number;
}

export interface PriceCache {
  [symbol: string]: TokenPrice;
}

class PriceService {
  private cache: PriceCache = {};
  private cacheExpiry = 60000; // 1 minute cache

  // Fetch prices from CoinGecko API
  async fetchPricesFromCoinGecko(symbols: string[]): Promise<PriceCache> {
    try {
      const coinGeckoIds = {
        'BNB': 'binancecoin',
        'USDC': 'usd-coin',
        'USDT': 'tether'
      };

      const ids = symbols.map(symbol => coinGeckoIds[symbol as keyof typeof coinGeckoIds]).filter(Boolean);
      
      if (ids.length === 0) return {};

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prices from CoinGecko');
      }

      const data = await response.json();
      const prices: PriceCache = {};

      Object.entries(coinGeckoIds).forEach(([symbol, id]) => {
        if (data[id]) {
          prices[symbol] = {
            symbol,
            price: data[id].usd,
            change24h: data[id].usd_24h_change || 0,
            lastUpdated: Date.now()
          };
        }
      });

      return prices;
    } catch (error) {
      console.error('Error fetching prices from CoinGecko:', error);
      return {};
    }
  }

  // Fallback to Binance API
  async fetchPricesFromBinance(symbols: string[]): Promise<PriceCache> {
    try {
      const binanceSymbols = {
        'BNB': 'BNBUSDT',
        'USDC': 'USDCUSDT', // USDC price in USDT
        'USDT': 'USDTUSD'   // This might not exist, USDT is typically 1 USD
      };

      const prices: PriceCache = {};

      // For stablecoins, set price to 1
      if (symbols.includes('USDC')) {
        prices['USDC'] = {
          symbol: 'USDC',
          price: 1.0,
          change24h: 0,
          lastUpdated: Date.now()
        };
      }

      if (symbols.includes('USDT')) {
        prices['USDT'] = {
          symbol: 'USDT',
          price: 1.0,
          change24h: 0,
          lastUpdated: Date.now()
        };
      }

      // Fetch BNB price if needed
      if (symbols.includes('BNB')) {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT');
        
        if (response.ok) {
          const data = await response.json();
          prices['BNB'] = {
            symbol: 'BNB',
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            lastUpdated: Date.now()
          };
        }
      }

      return prices;
    } catch (error) {
      console.error('Error fetching prices from Binance:', error);
      return {};
    }
  }

  // Get fallback prices (hardcoded as last resort)
  getFallbackPrices(symbols: string[]): PriceCache {
    const fallbackPrices: PriceCache = {};

    symbols.forEach(symbol => {
      switch (symbol) {
        case 'BNB':
          fallbackPrices[symbol] = {
            symbol,
            price: 300, // Approximate BNB price
            change24h: 0,
            lastUpdated: Date.now()
          };
          break;
        case 'USDC':
        case 'USDT':
          fallbackPrices[symbol] = {
            symbol,
            price: 1.0,
            change24h: 0,
            lastUpdated: Date.now()
          };
          break;
      }
    });

    return fallbackPrices;
  }

  // Check if cache is valid
  private isCacheValid(symbol: string): boolean {
    const cached = this.cache[symbol];
    if (!cached) return false;
    return Date.now() - cached.lastUpdated < this.cacheExpiry;
  }

  // Get price for a single token
  async getTokenPrice(symbol: string): Promise<TokenPrice | null> {
    // Check cache first
    if (this.isCacheValid(symbol)) {
      return this.cache[symbol];
    }

    // Fetch new prices
    const prices = await this.getTokenPrices([symbol]);
    return prices[symbol] || null;
  }

  // Get prices for multiple tokens
  async getTokenPrices(symbols: string[]): Promise<PriceCache> {
    // Filter out symbols that are still cached and valid
    const symbolsToFetch = symbols.filter(symbol => !this.isCacheValid(symbol));
    
    if (symbolsToFetch.length === 0) {
      // Return cached prices
      const result: PriceCache = {};
      symbols.forEach(symbol => {
        if (this.cache[symbol]) {
          result[symbol] = this.cache[symbol];
        }
      });
      return result;
    }

    let newPrices: PriceCache = {};

    // Try CoinGecko first
    try {
      newPrices = await this.fetchPricesFromCoinGecko(symbolsToFetch);
    } catch (error) {
      console.warn('CoinGecko failed, trying Binance:', error);
    }

    // If CoinGecko failed or didn't return all prices, try Binance
    const missingSymbols = symbolsToFetch.filter(symbol => !newPrices[symbol]);
    if (missingSymbols.length > 0) {
      try {
        const binancePrices = await this.fetchPricesFromBinance(missingSymbols);
        newPrices = { ...newPrices, ...binancePrices };
      } catch (error) {
        console.warn('Binance failed, using fallback prices:', error);
      }
    }

    // Use fallback for any remaining missing prices
    const stillMissingSymbols = symbolsToFetch.filter(symbol => !newPrices[symbol]);
    if (stillMissingSymbols.length > 0) {
      const fallbackPrices = this.getFallbackPrices(stillMissingSymbols);
      newPrices = { ...newPrices, ...fallbackPrices };
    }

    // Update cache
    Object.assign(this.cache, newPrices);

    // Return all requested prices (cached + new)
    const result: PriceCache = {};
    symbols.forEach(symbol => {
      if (this.cache[symbol]) {
        result[symbol] = this.cache[symbol];
      }
    });

    return result;
  }

  // Calculate USD value from token amount
  async calculateUSDValue(amount: string, symbol: string): Promise<number> {
    const price = await this.getTokenPrice(symbol);
    if (!price) return 0;
    
    return parseFloat(amount) * price.price;
  }

  // Calculate token amount from USD value
  async calculateTokenAmount(usdValue: number, symbol: string): Promise<string> {
    const price = await this.getTokenPrice(symbol);
    if (!price || price.price === 0) return '0';
    
    return (usdValue / price.price).toFixed(6);
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache = {};
  }

  // Get all cached prices
  getCachedPrices(): PriceCache {
    return { ...this.cache };
  }
}

// Export singleton instance
export const priceService = new PriceService();
export default priceService;
