export const getDenominationsBreakdown = (amount: number) => {
  const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
  let remaining = Math.abs(amount);
  const breakdown: { value: number; count: number; type: 'bill' | 'coin' }[] = [];

  for (const d of denominations) {
    const count = Math.floor(remaining / d);
    if (count > 0) {
      breakdown.push({
        value: d,
        count,
        type: d >= 20 ? 'bill' : 'coin'
      });
      remaining = parseFloat((remaining % d).toFixed(2));
    }
  }
  return breakdown;
};

export const getBreakdownSpeech = (amount: number) => {
  const breakdown = getDenominationsBreakdown(amount);
  const parts = breakdown.map(({ value, count, type }) => {
    const typeLabel = type === 'bill' ? 'billete' : 'moneda';
    const plural = count > 1 ? 's' : '';
    const label = value < 1 ? `${value * 100} centavos` : `${value} pesos`;
    return `${count} ${typeLabel}${plural} de ${label}`;
  });

  const intro = amount < 0 ? "El balance negativo de " : "El balance de ";
  if (parts.length === 0) return `${intro} cero pesos.`;
  
  return `${intro} ${Math.abs(amount)} pesos se compone de: ${parts.join(', ')}.`;
};
