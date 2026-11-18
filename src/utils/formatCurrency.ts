export function formatCurrency(amount: number, currency = 'MXN'): string {
  const formattedNumber = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formattedNumber} ${currency}`;
}