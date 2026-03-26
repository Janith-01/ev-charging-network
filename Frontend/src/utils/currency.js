export const formatLKR = (amount) => {
  if (amount === undefined || amount === null) return 'LKR 0.00'
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount)
}
