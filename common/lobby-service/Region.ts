export const Region = {
  Seattle: 'Seattle',
  WashingtonDc: 'Washington_DC',
  Chicago: 'Chicago',
  London: 'London',
  Frankfurt: 'Frankfurt',
  Mumbai: 'Mumbai',
  Singapore: 'Singapore',
  Tokyo: 'Tokyo',
  Sydney: 'Sydney',
  SaoPaulo: 'Sao_Paulo',
} as const;

export type Region = (typeof Region)[keyof typeof Region];
