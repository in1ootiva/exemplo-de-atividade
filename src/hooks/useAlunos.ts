import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Aluno, AlunoWithTurma } from '@/types';
import { useAuth } from './useAuth';

export function useAlunos(turmaId?: string) {
  const [alunos, setAlunos] = useState<AlunoWithTurma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAlunos = async (specificTurmaId?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('alunos')
        .select(`
          *,
          turma:turma_id(id, nome)
        `)
        .order('nome', { ascending: true });

      // Filtrar por turma se especificado
      const targetTurmaId = specificTurmaId || turmaId;
      if (targetTurmaId) {
        query = query.eq('turma_id', targetTurmaId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Formatar dados com nome da turma
      const alunosFormatados: AlunoWithTurma[] = (data || []).map((aluno: any) => ({
        ...aluno,
        turma_nome: aluno.turma?.nome || 'Turma não encontrada',
      }));

      setAlunos(alunosFormatados);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching alunos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlunosByTurma = async (turmaId: string) => {
    return fetchAlunos(turmaId);
  };

  const addAluno = async (alunoData: Omit<Aluno, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error: insertError } = await supabase
        .from('alunos')
        .insert([alunoData])
        .select()
        .single();

      if (insertError) throw insertError;
      
      await fetchAlunos(); // Recarregar lista
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding aluno:', err);
      throw err;
    }
  };

  const updateAluno = async (id: string, updates: Partial<Aluno>) => {
    if (!user) return;

    try {
      const { data, error: updateError } = await supabase
        .from('alunos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      await fetchAlunos(); // Recarregar lista
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating aluno:', err);
      throw err;
    }
  };

  const deleteAluno = async (id: string) => {
    if (!user) return;

    try {
      console.log(`🗑️ Inativando aluno: ${id}`);
      
      // Primeiro, remover o card do aluno (se existir)
      const { error: cardDeleteError } = await supabase
        .from('aluno_cards')
        .delete()
        .eq('aluno_id', id);

      if (cardDeleteError) {
        console.error('Erro ao deletar card do aluno:', cardDeleteError);
        // Não lançar erro aqui, pois o aluno pode não ter card
      } else {
        console.log('✅ Card do aluno removido com sucesso');
      }

      // Depois, marcar aluno como inativo (soft delete)
      const { error: deleteError } = await supabase
        .from('alunos')
        .update({ status: 'inativo' })
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      console.log('✅ Aluno marcado como inativo');
      await fetchAlunos(); // Recarregar lista
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error deleting aluno:', err);
      throw err;
    }
  };

  const getAlunoById = async (id: string): Promise<AlunoWithTurma | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('alunos')
        .select(`
          *,
          turma:turma_id(id, nome)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        ...data,
        turma_nome: data.turma?.nome || 'Turma não encontrada',
      };
    } catch (err: any) {
      console.error('Error fetching aluno by id:', err);
      return null;
    }
  };

  const getAlunosAtivosByTurma = async (turmaId: string): Promise<Aluno[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('alunos')
        .select('*')
        .eq('turma_id', turmaId)
        .eq('status', 'ativo')
        .order('nome', { ascending: true });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching alunos ativos:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [user, turmaId]);

  return {
    alunos,
    loading,
    error,
    addAluno,
    updateAluno,
    deleteAluno,
    getAlunoById,
    getAlunosAtivosByTurma,
    fetchAlunosByTurma,
    refetch: fetchAlunos,
  };
}

