export const TYPE_EQUIVALENTS: Record<string, string> = {
  TRANSFER_IN: 'TRANSFER_OUT',
  TRANSFER_OUT: 'TRANSFER_IN',
};

export const VALID_TYPES = ['BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT'];

export function typesMatch(typeA: string, typeB: string): boolean {
  if (typeA === typeB) return true;
  return TYPE_EQUIVALENTS[typeA] === typeB;
}
