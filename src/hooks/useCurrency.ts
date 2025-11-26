import { useState, useEffect } from 'react';
import { getCurrentCurrency } from '@/lib/currency';

export const useCurrency = () => {
  const [currency, setCurrency] = useState(getCurrentCurrency());

  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  return currency;
};

