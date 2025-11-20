import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlunoCard, AlunoCardWithDetails, ColumnId } from '@/types';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { recalcularCardAluno, recalcularCardsAlunos, recalcularCardsTurma } from '@/services/cardCalculator';

export function useAlunoCards(turmaId?: string) {
  const [cards, setCards] = useState<AlunoCardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();

  const fetchCards = async (specificTurmaId?: string) => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('aluno_cards')
        .select(`
          *,
          aluno:aluno_id(id, nome, email, telefone, atividades_entregues),
          turma:turma_id(id, nome)
        `)
        .order('faltas_consecutivas', { ascending: false });

      const targetTurmaId = specificTurmaId || turmaId;
      if (targetTurmaId) {
        query = query.eq('turma_id', targetTurmaId);
      } else if (profile.role === 'professor') {
        // Se professor e sem turma específica, buscar cards de suas turmas
        const { data: turmasProfessor } = await supabase
          .from('turmas')
          .select('id')
          .eq('professor_id', user.id);

        if (turmasProfessor && turmasProfessor.length > 0) {
          const turmaIds = turmasProfessor.map(t => t.id);
          query = query.in('turma_id', turmaIds);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Formatar dados com informações completas
      const cardsFormatados: AlunoCardWithDetails[] = (data || []).map((card: any) => ({
        ...card,
        aluno_nome: card.aluno?.nome || 'Aluno não encontrado',
        aluno_email: card.aluno?.email || '',
        aluno_telefone: card.aluno?.telefone,
        turma_nome: card.turma?.nome || 'Turma não encontrada',
        atividades_entregues: card.aluno?.atividades_entregues || 0,
      }));

      setCards(cardsFormatados);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching aluno cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCard = async (id: string, updates: Partial<AlunoCard>) => {
    if (!user) return;

    try {
      const { data, error: updateError } = await supabase
        .from('aluno_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      await fetchCards(); // Recarregar lista
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating card:', err);
      throw err;
    }
  };

  const moverCard = async (
    cardId: string,
    novaColuna: ColumnId,
    observacao?: string
  ) => {
    if (!user) return;

    try {
      const updates: Partial<AlunoCard> = {
        column_id: novaColuna,
      };

      // Se mover para "Contato Realizado", a observação é obrigatória
      if (novaColuna === 'contato_realizado') {
        if (!observacao || observacao.trim() === '') {
          throw new Error('Observação é obrigatória ao mover para "Contato Realizado"');
        }
        updates.observacao = observacao;
      }

      await updateCard(cardId, updates);
    } catch (err: any) {
      setError(err.message);
      console.error('Error movendo card:', err);
      throw err;
    }
  };

  const recalcularCard = async (alunoId: string, turmaId: string) => {
    try {
      const sucesso = await recalcularCardAluno(alunoId, turmaId);
      
      if (sucesso) {
        await fetchCards(); // Recarregar lista
      }
      
      return sucesso;
    } catch (err: any) {
      setError(err.message);
      console.error('Error recalculando card:', err);
      return false;
    }
  };

  const recalcularMultiplosCards = async (alunosIds: string[], turmaId: string) => {
    try {
      const resultado = await recalcularCardsAlunos(alunosIds, turmaId);
      
      await fetchCards(); // Recarregar lista
      
      return resultado;
    } catch (err: any) {
      setError(err.message);
      console.error('Error recalculando múltiplos cards:', err);
      return { sucesso: 0, erros: alunosIds.length };
    }
  };

  const recalcularCardsPorTurma = async (turmaId: string) => {
    try {
      const sucesso = await recalcularCardsTurma(turmaId);
      
      if (sucesso) {
        await fetchCards(); // Recarregar lista
      }
      
      return sucesso;
    } catch (err: any) {
      setError(err.message);
      console.error('Error recalculando cards da turma:', err);
      return false;
    }
  };

  const getCardsByColumn = (columnId: ColumnId): AlunoCardWithDetails[] => {
    return cards.filter(card => card.column_id === columnId);
  };

  const getCardByAlunoId = (alunoId: string): AlunoCardWithDetails | undefined => {
    return cards.find(card => card.aluno_id === alunoId);
  };

  const getTotalCardsCriticos = (): number => {
    return cards.filter(card => card.faltas_consecutivas >= 3).length;
  };

  const getEstatisticas = () => {
    return {
      total: cards.length,
      faltou_ultima: cards.filter(c => c.column_id === 'faltou_ultima').length,
      faltou_2_seguidas: cards.filter(c => c.column_id === 'faltou_2_seguidas').length,
      faltou_3_mais_seguidas: cards.filter(c => c.column_id === 'faltou_3_mais_seguidas').length,
      faltas_intercaladas: cards.filter(c => c.column_id === 'faltas_intercaladas').length,
      contato_realizado: cards.filter(c => c.column_id === 'contato_realizado').length,
      criticos: getTotalCardsCriticos(),
    };
  };

  useEffect(() => {
    if (profile) {
      fetchCards();
    }
  }, [user, profile, turmaId]);

  return {
    cards,
    loading,
    error,
    updateCard,
    moverCard,
    recalcularCard,
    recalcularMultiplosCards,
    recalcularCardsPorTurma,
    getCardsByColumn,
    getCardByAlunoId,
    getTotalCardsCriticos,
    getEstatisticas,
    refetch: fetchCards,
  };
}

