// Exchange rate management with caching and fallback rates

interface ExchangeRates {
  USD: number;
  QAR: number;
  lastUpdated: number;
}

// Fallback exchange rates (updated periodically)
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  QAR: 3.65, // 1 USD = 3.65 QAR
  lastUpdated: Date.now()
};

// Cache for exchange rates
let cachedRates: ExchangeRates | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fetch real-time exchange rates from a free API
export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // Try to fetch from a free exchange rate API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    const rates: ExchangeRates = {
      USD: 1,
      QAR: data.rates.QAR || FALLBACK_RATES.QAR,
      lastUpdated: Date.now()
    };
    
    // Cache the rates
    cachedRates = rates;
    localStorage.setItem('exchangeRates', JSON.stringify(rates));
    
    return rates;
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using fallback:', error);
    return FALLBACK_RATES;
  }
};

// Get exchange rates (from cache or fetch new ones)
export const getExchangeRates = async (): Promise<ExchangeRates> => {
  // Check if we have cached rates that are still valid
  if (cachedRates && (Date.now() - cachedRates.lastUpdated) < CACHE_DURATION) {
    return cachedRates;
  }
  
  // Check localStorage for cached rates
  const storedRates = localStorage.getItem('exchangeRates');
  if (storedRates) {
    const parsedRates = JSON.parse(storedRates);
    if ((Date.now() - parsedRates.lastUpdated) < CACHE_DURATION) {
      cachedRates = parsedRates;
      return parsedRates;
    }
  }
  
  // Fetch new rates
  return await fetchExchangeRates();
};

// Round up QAR to nearest 100
const roundUpQAR = (amount: number): number => {
  return Math.ceil(amount / 100) * 100;
};

// Convert USD amount to target currency
export const convertUSDToCurrency = async (amountUSD: number, targetCurrency: string): Promise<number> => {
  if (targetCurrency === 'USD') return amountUSD;
  
  const rates = await getExchangeRates();
  const rate = rates[targetCurrency as keyof ExchangeRates];
  
  let convertedAmount: number;
  
  if (rate) {
    convertedAmount = amountUSD * rate;
  } else {
    // Fallback to stored rate
    convertedAmount = amountUSD * FALLBACK_RATES[targetCurrency as keyof ExchangeRates];
  }
  
  // Round up QAR to nearest 100
  if (targetCurrency === 'QAR') {
    convertedAmount = roundUpQAR(convertedAmount);
  }
  
  return convertedAmount;
};

// Get current exchange rate for a currency
export const getExchangeRate = async (currency: string): Promise<number> => {
  if (currency === 'USD') return 1;
  
  const rates = await getExchangeRates();
  return rates[currency as keyof ExchangeRates] || FALLBACK_RATES[currency as keyof ExchangeRates];
};
