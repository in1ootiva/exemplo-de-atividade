import { supabase } from '@/lib/supabase';
import { ColumnId, CalculoFaltas, FaltaHistorico } from '@/types';

/**
 * Busca o histórico de faltas de um aluno nos últimos N dias
 */
export async function buscarHistoricoFaltas(
  alunoId: string,
  diasLimite: number = 30
): Promise<FaltaHistorico[]> {
  try {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasLimite);

    const { data, error } = await supabase
      .from('chamadas_alunos')
      .select(`
        presente,
        chamada:chamada_id(data)
      `)
      .eq('aluno_id', alunoId)
      .gte('chamada.data', dataLimite.toISOString().split('T')[0])
      .order('chamada.data', { ascending: false });

    if (error) throw error;

    return (data || [])
      .map((item: any) => ({
        data: item.chamada.data,
        presente: item.presente,
      }))
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  } catch (error) {
    console.error('Erro ao buscar histórico de faltas:', error);
    return [];
  }
}

/**
 * Calcula estatísticas de faltas e determina a coluna apropriada
 */
export function calcularEstatisticasFaltas(historico: FaltaHistorico[]): CalculoFaltas {
  if (historico.length === 0) {
    return {
      total_faltas: 0,
      faltas_consecutivas: 0,
      ultima_falta: null,
      column_id: null,
    };
  }

  // Calcular total de faltas
  const totalFaltas = historico.filter(h => !h.presente).length;

  // Se não tem faltas, não precisa de card
  if (totalFaltas === 0) {
    return {
      total_faltas: 0,
      faltas_consecutivas: 0,
      ultima_falta: null,
      column_id: null,
    };
  }

  // Encontrar última falta
  const ultimaFalta = historico.find(h => !h.presente)?.data || null;

  // Calcular faltas consecutivas (começando da mais recente)
  let faltasConsecutivas = 0;
  for (const registro of historico) {
    if (!registro.presente) {
      faltasConsecutivas++;
    } else {
      break; // Para ao encontrar uma presença
    }
  }

  // Determinar coluna baseado nas regras
  let columnId: ColumnId | null = null;

  if (faltasConsecutivas >= 3) {
    columnId = 'faltou_3_mais_seguidas';
  } else if (faltasConsecutivas === 2) {
    columnId = 'faltou_2_seguidas';
  } else if (faltasConsecutivas === 1) {
    columnId = 'faltou_ultima';
  } else if (totalFaltas >= 3) {
    // Faltas não consecutivas mas total >= 3
    columnId = 'faltas_intercaladas';
  }

  return {
    total_faltas: totalFaltas,
    faltas_consecutivas: faltasConsecutivas,
    ultima_falta: ultimaFalta,
    column_id: columnId,
  };
}

/**
 * Recalcula o card de um aluno específico
 */
export async function recalcularCardAluno(alunoId: string, turmaId: string): Promise<boolean> {
  try {
    // Buscar histórico de faltas
    const historico = await buscarHistoricoFaltas(alunoId);

    // Calcular estatísticas
    const calculo = calcularEstatisticasFaltas(historico);

    // Verificar se o aluno já tem um card
    const { data: cardExistente } = await supabase
      .from('aluno_cards')
      .select('*')
      .eq('aluno_id', alunoId)
      .single();

    // Se não há faltas e não há card, não fazer nada
    if (!calculo.column_id && !cardExistente) {
      return true;
    }

    // Se não há faltas mas há card, deletar o card (aluno está indo bem)
    if (!calculo.column_id && cardExistente) {
      await supabase
        .from('aluno_cards')
        .delete()
        .eq('aluno_id', alunoId);
      return true;
    }

    // Se o aluno já estava em "Contato Realizado", manter lá
    // (só sai manualmente ou se voltar a ter 0 faltas)
    if (cardExistente && cardExistente.column_id === 'contato_realizado') {
      // Apenas atualizar as estatísticas, mas manter na mesma coluna
      await supabase
        .from('aluno_cards')
        .update({
          total_faltas: calculo.total_faltas,
          faltas_consecutivas: calculo.faltas_consecutivas,
          ultima_falta: calculo.ultima_falta,
        })
        .eq('aluno_id', alunoId);
      return true;
    }

    // Criar ou atualizar card
    const cardData = {
      aluno_id: alunoId,
      turma_id: turmaId,
      column_id: calculo.column_id,
      total_faltas: calculo.total_faltas,
      faltas_consecutivas: calculo.faltas_consecutivas,
      ultima_falta: calculo.ultima_falta,
    };

    if (cardExistente) {
      // Atualizar card existente
      await supabase
        .from('aluno_cards')
        .update(cardData)
        .eq('aluno_id', alunoId);
    } else {
      // Criar novo card
      await supabase
        .from('aluno_cards')
        .insert([cardData]);
    }

    return true;
  } catch (error) {
    console.error('Erro ao recalcular card do aluno:', error);
    return false;
  }
}

/**
 * Recalcula cards de múltiplos alunos
 */
export async function recalcularCardsAlunos(
  alunosIds: string[],
  turmaId: string
): Promise<{ sucesso: number; erros: number }> {
  let sucesso = 0;
  let erros = 0;

  for (const alunoId of alunosIds) {
    const resultado = await recalcularCardAluno(alunoId, turmaId);
    if (resultado) {
      sucesso++;
    } else {
      erros++;
    }
  }

  return { sucesso, erros };
}

/**
 * Recalcula todos os cards de uma turma
 */
export async function recalcularCardsTurma(turmaId: string): Promise<boolean> {
  try {
    // Buscar todos os alunos ativos da turma
    const { data: alunos, error } = await supabase
      .from('alunos')
      .select('id')
      .eq('turma_id', turmaId)
      .eq('status', 'ativo');

    if (error) throw error;

    if (!alunos || alunos.length === 0) {
      return true;
    }

    const alunosIds = alunos.map(a => a.id);
    await recalcularCardsAlunos(alunosIds, turmaId);

    return true;
  } catch (error) {
    console.error('Erro ao recalcular cards da turma:', error);
    return false;
  }
}

/**
 * Recalcula todos os cards do sistema (usar com cuidado!)
 */
export async function recalcularTodosCards(): Promise<boolean> {
  try {
    // Buscar todas as turmas ativas
    const { data: turmas, error } = await supabase
      .from('turmas')
      .select('id')
      .eq('ativa', true);

    if (error) throw error;

    if (!turmas || turmas.length === 0) {
      return true;
    }

    for (const turma of turmas) {
      await recalcularCardsTurma(turma.id);
    }

    return true;
  } catch (error) {
    console.error('Erro ao recalcular todos os cards:', error);
    return false;
  }
}

/**
 * Verifica se um aluno precisa de atenção urgente
 */
export function precisaAtencaoUrgente(calculo: CalculoFaltas): boolean {
  return calculo.faltas_consecutivas >= 3;
}

/**
 * Retorna uma mensagem descritiva sobre a situação do aluno
 */
export function getMensagemSituacao(calculo: CalculoFaltas): string {
  if (calculo.total_faltas === 0) {
    return 'Aluno com frequência regular';
  }

  if (calculo.faltas_consecutivas >= 3) {
    return `ATENÇÃO: ${calculo.faltas_consecutivas} faltas consecutivas! Contato urgente necessário.`;
  }

  if (calculo.faltas_consecutivas === 2) {
    return `Alerta: ${calculo.faltas_consecutivas} faltas consecutivas. Monitorar de perto.`;
  }

  if (calculo.faltas_consecutivas === 1) {
    return 'Faltou à última aula. Acompanhar.';
  }

  if (calculo.total_faltas >= 3) {
    return `${calculo.total_faltas} faltas intercaladas. Verificar padrão de ausências.`;
  }

  return `${calculo.total_faltas} falta(s) registrada(s).`;
}

