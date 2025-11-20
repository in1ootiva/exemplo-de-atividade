// ============================================
// TIPOS DE INTEGRAÇÃO GODEVS
// ============================================

export interface GoDevsTurma {
  id: string;
  nome: string;
  descricao?: string;
  created_at?: string;
}

export interface GoDevsAluno {
  id: string;
  turma_id: string;
  nome_completo?: string;
  nome?: string;
  email: string;
  telefone?: string;
  atividades_entregues?: number;
  ultima_entrega?: string;
  nota_media?: number;
  created_at?: string;
}

export interface ImportacaoResultado {
  turma: Turma;
  alunosImportados: number;
  erros?: string[];
}

export interface SincronizacaoResultado {
  atualizados: number;
  novos: number;
  erros?: string[];
}

// ============================================
// TIPOS DE PERFIS E AUTENTICAÇÃO
// ============================================

export type UserRole = 'coordenador' | 'professor';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// TIPOS DE TURMAS
// ============================================

export interface Turma {
  id: string;
  nome: string;
  coordenador_id: string | null;
  professor_id: string | null;
  dias_aula: string[];
  horario: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface TurmaWithDetails extends Turma {
  professor_nome?: string;
  coordenador_nome?: string;
  total_alunos?: number;
}

// ============================================
// TIPOS DE ALUNOS
// ============================================

export type AlunoStatus = 'ativo' | 'inativo';

export interface Aluno {
  id: string;
  turma_id: string;
  nome: string;
  email: string;
  telefone?: string;
  status: AlunoStatus;
  atividades_entregues?: number;
  created_at: string;
  updated_at: string;
}

export interface AlunoWithTurma extends Aluno {
  turma_nome?: string;
}

// ============================================
// TIPOS DE CHAMADAS
// ============================================

export interface Chamada {
  id: string;
  turma_id: string;
  data: string;
  professor_id: string;
  created_at: string;
}

export interface ChamadaAluno {
  id: string;
  chamada_id: string;
  aluno_id: string;
  presente: boolean;
  observacao?: string;
}

export interface ChamadaCompleta extends Chamada {
  turma_nome?: string;
  professor_nome?: string;
  presencas: ChamadaAluno[];
}

export interface ChamadaListItem {
  aluno_id: string;
  aluno_nome: string;
  presente: boolean;
  observacao?: string;
}

// ============================================
// TIPOS DE CARDS DO KANBAN
// ============================================

export type ColumnId = 
  | 'faltou_ultima' 
  | 'faltou_2_seguidas' 
  | 'faltou_3_mais_seguidas' 
  | 'faltas_intercaladas' 
  | 'contato_realizado';

export interface AlunoCard {
  id: string;
  aluno_id: string;
  turma_id: string;
  column_id: ColumnId;
  total_faltas: number;
  faltas_consecutivas: number;
  ultima_falta: string | null;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export interface AlunoCardWithDetails extends AlunoCard {
  aluno_nome: string;
  aluno_email: string;
  aluno_telefone?: string;
  turma_nome: string;
  atividades_entregues?: number;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
  description: string;
}

export const ACADEMIC_COLUMNS: Column[] = [
  {
    id: 'faltou_ultima',
    title: 'Faltou Última Aula',
    color: '#3b82f6',
    description: 'Alunos que faltaram apenas a última aula',
  },
  {
    id: 'faltou_2_seguidas',
    title: 'Faltou 2 Seguidas',
    color: '#f59e0b',
    description: 'Alunos com 2 faltas consecutivas',
  },
  {
    id: 'faltou_3_mais_seguidas',
    title: 'Faltou 3+ Seguidas',
    color: '#ef4444',
    description: 'Alunos com 3 ou mais faltas consecutivas (CRÍTICO)',
  },
  {
    id: 'faltas_intercaladas',
    title: 'Faltas Intercaladas',
    color: '#ec4899',
    description: 'Alunos com 3+ faltas não consecutivas',
  },
  {
    id: 'contato_realizado',
    title: 'Contato Realizado',
    color: '#10b981',
    description: 'Alunos com contato feito e observação registrada',
  },
];

// ============================================
// TIPOS DE EMAIL
// ============================================

export type EmailTipo = 'manual' | 'automatico';
export type EmailStatus = 'enviado' | 'erro' | 'pendente';
export type EmailPrioridade = 'alta' | 'normal';

export interface EmailLog {
  id: string;
  destinatario: string;
  assunto: string;
  tipo: EmailTipo;
  template: string;
  status: EmailStatus;
  prioridade: EmailPrioridade;
  enviado_por: string;
  enviado_em: string;
  erro_mensagem?: string;
}

export interface EmailQuota {
  id: string;
  daily_count: number;
  daily_limit: number;
  last_reset: string;
  warning_threshold: number;
}

export interface EmailConfig {
  id: string;
  user_id: string;
  auto_envio_ativo: boolean;
  horario_envio: string;
  emails_destinatarios: string[];
}

export interface QuotaStatus {
  current: number;
  limit: number;
  percentage: number;
  canSend: boolean;
  status: 'safe' | 'warning' | 'critical' | 'limit';
}

// ============================================
// TIPOS DE RELATÓRIOS
// ============================================

export interface RelatorioTurma {
  turma_id: string;
  turma_nome: string;
  professor_nome: string;
  data_ultima_chamada?: string;
  total_alunos: number;
  alertas: {
    faltou_ultima: number;
    faltou_2_seguidas: number;
    faltou_3_mais_seguidas: number;
    faltas_intercaladas: number;
  };
  alunos_detalhados: AlunoCardWithDetails[];
}

export interface RelatorioConsolidado {
  data_geracao: string;
  total_turmas: number;
  total_alunos: number;
  total_alertas: number;
  metricas_por_categoria: {
    faltou_ultima: number;
    faltou_2_seguidas: number;
    faltou_3_mais_seguidas: number;
    faltas_intercaladas: number;
  };
  turmas_criticas: {
    turma_nome: string;
    total_alertas: number;
  }[];
  sugestoes_acao: string[];
}

// ============================================
// TIPOS DE HISTÓRICO
// ============================================

export interface FaltaHistorico {
  data: string;
  presente: boolean;
}

export interface CalculoFaltas {
  total_faltas: number;
  faltas_consecutivas: number;
  ultima_falta: string | null;
  column_id: ColumnId | null;
}

