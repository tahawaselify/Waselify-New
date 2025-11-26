import { convertUSDToCurrency } from './exchangeRates';
import i18n from './i18n';

// Get current currency preference from localStorage
export const getCurrentCurrency = (): string => {
  return localStorage.getItem('preferred-currency') || 'USD';
};

// Set currency preference
export const setCurrentCurrency = (currency: string) => {
  localStorage.setItem('preferred-currency', currency);
};

// Format amount based on current currency preference with real conversion
export const formatCurrency = async (amountUSD: number, options?: Intl.NumberFormatOptions, complexity?: string): Promise<string> => {
  // Check if this is a high complexity workflow that should show "Contact for cost"
  if ((complexity || '').toLowerCase() === 'high') {
    return i18n.t('marketplace.contactForCost');
  }

  if (Number.isNaN(amountUSD) || amountUSD === undefined || amountUSD === null) {
    return `${getCurrentCurrency() === 'QAR' ? 'QAR' : '$'} 0.00`;
  }

  const currency = getCurrentCurrency();
  let convertedAmount = await convertUSDToCurrency(amountUSD, currency);
  
  // Round up QAR to nearest 100
  if (currency === 'QAR') {
    convertedAmount = roundUpQAR(convertedAmount);
  }
  
  try {
    if (currency === 'QAR') {
      return new Intl.NumberFormat('en-QA', {
        style: 'currency',
        currency: 'QAR',
        minimumFractionDigits: 0, // No decimal places for rounded QAR
        maximumFractionDigits: 0,
        ...options,
      }).format(convertedAmount);
    } else {
      // USD formatting
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
      }).format(convertedAmount);
    }
  } catch (_e) {
    // Fallback if Intl is not available
    const rounded = currency === 'QAR' ? convertedAmount : Math.round((convertedAmount + Number.EPSILON) * 100) / 100;
    const symbol = currency === 'QAR' ? 'QAR' : '$';
    return `${symbol} ${rounded.toLocaleString()}`;
  }
};

// Round up QAR to nearest 100
const roundUpQAR = (amount: number): number => {
  return Math.ceil(amount / 100) * 100;
};

// Synchronous version for backward compatibility (uses fallback rates)
export const formatCurrencySync = (amountUSD: number, options?: Intl.NumberFormatOptions, complexity?: string): string => {
  // Check if this is a high complexity workflow that should show "Contact for cost"
  if ((complexity || '').toLowerCase() === 'high') {
    return i18n.t('marketplace.contactForCost');
  }

  if (Number.isNaN(amountUSD) || amountUSD === undefined || amountUSD === null) {
    return `${getCurrentCurrency() === 'QAR' ? 'QAR' : '$'} 0.00`;
  }

  const currency = getCurrentCurrency();
  // Use fallback rate for synchronous operations
  const fallbackRate = currency === 'QAR' ? 3.65 : 1;
  let convertedAmount = amountUSD * fallbackRate;
  
  // Round up QAR to nearest 100
  if (currency === 'QAR') {
    convertedAmount = roundUpQAR(convertedAmount);
  }
  
  try {
    if (currency === 'QAR') {
      return new Intl.NumberFormat('en-QA', {
        style: 'currency',
        currency: 'QAR',
        minimumFractionDigits: 0, // No decimal places for rounded QAR
        maximumFractionDigits: 0,
        ...options,
      }).format(convertedAmount);
    } else {
      // USD formatting
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
      }).format(convertedAmount);
    }
  } catch (_e) {
    // Fallback if Intl is not available
    const rounded = currency === 'QAR' ? convertedAmount : Math.round((convertedAmount + Number.EPSILON) * 100) / 100;
    const symbol = currency === 'QAR' ? 'QAR' : '$';
    return `${symbol} ${rounded.toLocaleString()}`;
  }
};

// Legacy function for backward compatibility
export const formatQAR = (amount: number, options?: Intl.NumberFormatOptions): string => {
  if (Number.isNaN(amount) || amount === undefined || amount === null) {
    return 'QAR 0.00';
  }
  try {
    return new Intl.NumberFormat('en-QA', {
      style: 'currency',
      currency: 'QAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  } catch (_e) {
    // Fallback if Intl is not available in some environments
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return `QAR ${rounded.toLocaleString()}`;
  }
};



