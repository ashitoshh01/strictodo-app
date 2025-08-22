
// Utility functions for currency formatting
export const formatCurrency = (amountInPaise: number): string => {
  const amountInRupees = amountInPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInRupees);
};

export const formatPrice = (amountInPaise: number): string => {
  return formatCurrency(amountInPaise);
};

export const parsePrice = (priceString: string): number => {
  // Convert price string to paise (smallest currency unit)
  const numericValue = parseFloat(priceString.replace(/[^0-9.-]+/g, ''));
  return Math.round(numericValue * 100);
};
