/** Format a dollar amount — e.g. 1234.5 → "$1,235" */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a number with commas — e.g. 10000 → "10,000" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}
