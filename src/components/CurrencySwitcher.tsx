import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCurrentCurrency, setCurrentCurrency } from '@/lib/currency';

const CurrencySwitcher = () => {
  const [currentCurrency, setCurrentCurrencyState] = useState(getCurrentCurrency());

  useEffect(() => {
    // Initialize with stored preference
    setCurrentCurrencyState(getCurrentCurrency());
    
    // Listen for currency changes from other components
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrentCurrencyState(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦' }
  ];

  const selectedCurrency = currencies.find(curr => curr.code === currentCurrency) || currencies[0];

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrentCurrency(currencyCode);
    setCurrentCurrencyState(currencyCode);
    
    // Force a re-render of components that use currency formatting
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currencyCode }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Coins size={16} />
          <span className="hidden sm:inline">{selectedCurrency.flag}</span>
          <span className="hidden md:inline">{selectedCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencyChange(currency.code)}
            className={`flex items-center gap-2 ${
              currentCurrency === currency.code ? 'bg-accent' : ''
            }`}
          >
            <span>{currency.flag}</span>
            <span>{currency.symbol}</span>
            <span className="hidden lg:inline">{currency.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySwitcher;
