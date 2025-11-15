export interface DealCard {
  id: string;
  user_id: string;
  title: string;
  value?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  column_id: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  user_id: string;
  title: string;
  order: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BoardState {
  columns: Column[];
  cards: DealCard[];
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'novo-lead', title: 'Novo Lead', order: 0, color: '#3b82f6' },
  { id: 'contato-feito', title: 'Contato Feito', order: 1, color: '#8b5cf6' },
  { id: 'proposta-enviada', title: 'Proposta Enviada', order: 2, color: '#f59e0b' },
  { id: 'negociacao', title: 'Negociação', order: 3, color: '#ec4899' },
  { id: 'ganho', title: 'Ganho', order: 4, color: '#10b981' },
  { id: 'perdido', title: 'Perdido', order: 5, color: '#ef4444' },
];

export const INITIAL_BOARD_STATE: BoardState = {
  columns: DEFAULT_COLUMNS,
  cards: [],
};

