// $949.00 MXN, $1,699.00 MXN — formato de miles + siempre 2 decimales + moneda.
export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}
