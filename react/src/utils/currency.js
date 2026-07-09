// Formats a number as Myanmar Kyat currency (e.g. 25000 -> "MMK 25,000")
export const formatMMK = (amount) =>
  new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(amount);