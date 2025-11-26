import { useState, useEffect } from 'react';
import { getExchangeRate } from '@/lib/exchangeRates';
import { useCurrency } from '@/hooks/useCurrency';

const ExchangeRateDisplay = () => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentCurrency = useCurrency();

  useEffect(() => {
    const fetchRate = async () => {
      if (currentCurrency === 'USD') {
        setExchangeRate(1);
        setIsLoading(false);
        return;
      }

      try {
        const rate = await getExchangeRate(currentCurrency);
        setExchangeRate(rate);
      } catch (error) {
        console.warn('Failed to fetch exchange rate:', error);
        setExchangeRate(currentCurrency === 'QAR' ? 3.65 : 1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
  }, [currentCurrency]);

  if (currentCurrency === 'USD') return null;

  return (
    <div className="text-xs text-gray-500 mt-2">
      {isLoading ? (
        <span>Loading exchange rate...</span>
      ) : (
        <span>
          Exchange rate: 1 USD = {exchangeRate?.toFixed(2)} {currentCurrency}
        </span>
      )}
    </div>
  );
};

export default ExchangeRateDisplay;






