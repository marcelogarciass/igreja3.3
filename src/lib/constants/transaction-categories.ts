export const TRANSACTION_CATEGORIES = [
  'Oferta',
  'Oferta missionaria',
  'Dizimo',
  'Construção',
  'Manutenção',
  'Oferta solidaria',
  'Agua',
  'Luz',
  'Telefone',
  'Pastoral',
  'Diversas'
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];
