import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Turma, TurmaWithDetails } from '@/types';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function useTurmas() {
  const [turmas, setTurmas] = useState<TurmaWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();

  const fetchTurmas = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('turmas')
        .select(`
          *,
          professor:professor_id(id, name),
          coordenador:coordenador_id(id, name)
        `)
        .eq('ativa', true)
        .order('nome', { ascending: true });

      // Se for professor, filtrar apenas suas turmas
      if (profile.role === 'professor') {
        query = query.eq('professor_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Formatar dados com nomes dos professores/coordenadores
      const turmasFormatadas: TurmaWithDetails[] = (data || []).map((turma: any) => ({
        ...turma,
        professor_nome: turma.professor?.name || 'Não atribuído',
        coordenador_nome: turma.coordenador?.name || 'Não atribuído',
      }));

      setTurmas(turmasFormatadas);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching turmas:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTurma = async (turmaData: Omit<Turma, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || profile?.role !== 'coordenador') {
      throw new Error('Apenas coordenadores podem criar turmas');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('turmas')
        .insert([turmaData])
        .select()
        .single();

      if (insertError) throw insertError;
      
      await fetchTurmas(); // Recarregar lista
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding turma:', err);
      throw err;
    }
  };

  const updateTurma = async (id: string, updates: Partial<Turma>) => {
    if (!user || profile?.role !== 'coordenador') {
      throw new Error('Apenas coordenadores podem atualizar turmas');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('turmas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      await fetchTurmas(); // Recarregar lista
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating turma:', err);
      throw err;
    }
  };

  const deleteTurma = async (id: string) => {
    if (!user || profile?.role !== 'coordenador') {
      throw new Error('Apenas coordenadores podem deletar turmas');
    }

    try {
      // Soft delete - marcar como inativa ao invés de deletar
      const { error: deleteError } = await supabase
        .from('turmas')
        .update({ ativa: false })
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      await fetchTurmas(); // Recarregar lista
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting turma:', err);
      throw err;
    }
  };

  const getTurmaById = async (id: string): Promise<TurmaWithDetails | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('turmas')
        .select(`
          *,
          professor:professor_id(id, name),
          coordenador:coordenador_id(id, name)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        ...data,
        professor_nome: data.professor?.name || 'Não atribuído',
        coordenador_nome: data.coordenador?.name || 'Não atribuído',
      };
    } catch (err: any) {
      console.error('Error fetching turma by id:', err);
      return null;
    }
  };

  useEffect(() => {
    if (profile) {
      fetchTurmas();
    }
  }, [user, profile]);

  return {
    turmas,
    loading,
    error,
    addTurma,
    updateTurma,
    deleteTurma,
    getTurmaById,
    refetch: fetchTurmas,
  };
}

