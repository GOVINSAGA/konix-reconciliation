export const ASSET_ALIASES: Record<string, string> = {
  bitcoin: 'BTC',
  btc: 'BTC',
  ethereum: 'ETH',
  eth: 'ETH',
  solana: 'SOL',
  sol: 'SOL',
  polygon: 'MATIC',
  matic: 'MATIC',
  chainlink: 'LINK',
  link: 'LINK',
  tether: 'USDT',
  usdt: 'USDT',
  'usd coin': 'USDC',
  usdc: 'USDC',
  ripple: 'XRP',
  xrp: 'XRP',
  cardano: 'ADA',
  ada: 'ADA',
  dogecoin: 'DOGE',
  doge: 'DOGE',
};

export function resolveAsset(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const normalized = raw.trim().toLowerCase();
  return ASSET_ALIASES[normalized] || raw.trim().toUpperCase();
}
