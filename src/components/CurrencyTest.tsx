import { useCurrency } from '@/hooks/useCurrency';
import { formatCurrency } from '@/lib/currency';

const CurrencyTest = () => {
  const currentCurrency = useCurrency();

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Currency Test Component</h3>
      <div className="space-y-2">
        <p><strong>Current Currency:</strong> {currentCurrency}</p>
        <p><strong>Sample Amount:</strong> {formatCurrency(1234.56)}</p>
        <p><strong>Large Amount:</strong> {formatCurrency(50000)}</p>
        <p><strong>Small Amount:</strong> {formatCurrency(0.99)}</p>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Try changing the currency using the currency switcher in the navbar!
      </p>
    </div>
  );
};

export default CurrencyTest;

