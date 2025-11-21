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
      
      // Primeiro, buscar IDs dos alunos ativos
      let alunosQuery = supabase
        .from('alunos')
        .select('id')
        .eq('status', 'ativo');

      const targetTurmaId = specificTurmaId || turmaId;
      if (targetTurmaId) {
        alunosQuery = alunosQuery.eq('turma_id', targetTurmaId);
      }

      const { data: alunosAtivos, error: alunosError } = await alunosQuery;
      
      if (alunosError) throw alunosError;

      // Se não há alunos ativos, retornar array vazio
      if (!alunosAtivos || alunosAtivos.length === 0) {
        setCards([]);
        setError(null);
        setLoading(false);
        return;
      }

      const alunosAtivoIds = alunosAtivos.map(a => a.id);

      // Agora buscar os cards apenas dos alunos ativos
      let query = supabase
        .from('aluno_cards')
        .select(`
          *,
          aluno:aluno_id(id, nome, email, telefone, atividades_entregues, status),
          turma:turma_id(id, nome)
        `)
        .in('aluno_id', alunosAtivoIds)
        .order('faltas_consecutivas', { ascending: false });

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

      // Formatar dados com informações completas e filtrar novamente por segurança
      const cardsFormatados: AlunoCardWithDetails[] = (data || [])
        .filter((card: any) => card.aluno && card.aluno.status === 'ativo')
        .map((card: any) => ({
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

  const limparCardsOrfaos = async () => {
    if (!user) return { removidos: 0 };

    try {
      console.log('🧹 Limpando cards órfãos...');
      
      // Buscar todos os cards
      const { data: todosCards, error: cardsError } = await supabase
        .from('aluno_cards')
        .select('id, aluno_id');

      if (cardsError) throw cardsError;

      if (!todosCards || todosCards.length === 0) {
        console.log('✅ Nenhum card encontrado');
        await fetchCards(); // Buscar cards normalmente
        return { removidos: 0 };
      }

      // Buscar todos os alunos ativos
      const { data: alunosAtivos, error: alunosError } = await supabase
        .from('alunos')
        .select('id')
        .eq('status', 'ativo');

      if (alunosError) throw alunosError;

      const alunosAtivoIds = (alunosAtivos || []).map(a => a.id);

      // Identificar cards órfãos (de alunos inativos ou inexistentes)
      const cardsOrfaos = todosCards.filter(card => !alunosAtivoIds.includes(card.aluno_id));

      if (cardsOrfaos.length === 0) {
        console.log('✅ Nenhum card órfão encontrado');
        // Buscar cards normalmente se não há órfãos
        await fetchCards();
        return { removidos: 0 };
      }

      console.log(`🗑️ Encontrados ${cardsOrfaos.length} cards órfãos. Removendo...`);

      // Remover cards órfãos
      const cardsOrfaosIds = cardsOrfaos.map(c => c.id);
      const { error: deleteError } = await supabase
        .from('aluno_cards')
        .delete()
        .in('id', cardsOrfaosIds);

      if (deleteError) throw deleteError;

      console.log(`✅ ${cardsOrfaos.length} cards órfãos removidos com sucesso`);
      
      await fetchCards(); // Recarregar lista
      return { removidos: cardsOrfaos.length };
    } catch (err: any) {
      console.error('❌ Erro ao limpar cards órfãos:', err);
      await fetchCards(); // Buscar cards mesmo com erro
      return { removidos: 0 };
    }
  };

  useEffect(() => {
    if (profile && user) {
      // Primeiro limpar cards órfãos, depois buscar cards
      const inicializar = async () => {
        await limparCardsOrfaos();
      };
      inicializar();
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
    limparCardsOrfaos,
    refetch: fetchCards,
  };
}

