import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Chamada, ChamadaCompleta, ChamadaAluno, ChamadaListItem } from '@/types';
import { useAuth } from './useAuth';

export function useChamadas(turmaId?: string) {
  const [chamadas, setChamadas] = useState<ChamadaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchChamadas = async (specificTurmaId?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('chamadas')
        .select(`
          *,
          turma:turma_id(id, nome),
          professor:professor_id(id, name)
        `)
        .order('data', { ascending: false });

      const targetTurmaId = specificTurmaId || turmaId;
      if (targetTurmaId) {
        query = query.eq('turma_id', targetTurmaId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Buscar presenças para cada chamada
      const chamadasCompletas: ChamadaCompleta[] = await Promise.all(
        (data || []).map(async (chamada: any) => {
          const { data: presencas } = await supabase
            .from('chamadas_alunos')
            .select('*')
            .eq('chamada_id', chamada.id);

          return {
            ...chamada,
            turma_nome: chamada.turma?.nome || 'Turma não encontrada',
            professor_nome: chamada.professor?.name || 'Professor não encontrado',
            presencas: presencas || [],
          };
        })
      );

      setChamadas(chamadasCompletas);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching chamadas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChamadasByTurma = async (turmaId: string) => {
    return fetchChamadas(turmaId);
  };

  const gerarChamada = async (turmaId: string, data: string): Promise<ChamadaCompleta | null> => {
    if (!user) return null;

    try {
      // Verificar se já existe chamada para esta turma nesta data
      const { data: existingChamada } = await supabase
        .from('chamadas')
        .select('*')
        .eq('turma_id', turmaId)
        .eq('data', data)
        .single();

      if (existingChamada) {
        throw new Error('Já existe uma chamada para esta turma nesta data');
      }

      // Buscar todos os alunos ativos da turma
      const { data: alunos, error: alunosError } = await supabase
        .from('alunos')
        .select('*')
        .eq('turma_id', turmaId)
        .eq('status', 'ativo');

      if (alunosError) throw alunosError;

      if (!alunos || alunos.length === 0) {
        throw new Error('Nenhum aluno ativo encontrado nesta turma');
      }

      // Criar a chamada
      const { data: novaChamada, error: chamadaError } = await supabase
        .from('chamadas')
        .insert([{
          turma_id: turmaId,
          data: data,
          professor_id: user.id,
        }])
        .select()
        .single();

      if (chamadaError) throw chamadaError;

      // Criar registros de presença para cada aluno (todos como ausente por padrão)
      const presencas = alunos.map(aluno => ({
        chamada_id: novaChamada.id,
        aluno_id: aluno.id,
        presente: false,
      }));

      const { data: presencasCriadas, error: presencasError } = await supabase
        .from('chamadas_alunos')
        .insert(presencas)
        .select();

      if (presencasError) throw presencasError;

      // Buscar informações completas da chamada
      const { data: turma } = await supabase
        .from('turmas')
        .select('nome')
        .eq('id', turmaId)
        .single();

      const chamadaCompleta: ChamadaCompleta = {
        ...novaChamada,
        turma_nome: turma?.nome || 'Turma não encontrada',
        professor_nome: user.email || 'Professor',
        presencas: presencasCriadas || [],
      };

      await fetchChamadas(); // Recarregar lista
      return chamadaCompleta;
    } catch (err: any) {
      setError(err.message);
      console.error('Error gerando chamada:', err);
      throw err;
    }
  };

  const salvarChamada = async (
    chamadaId: string,
    presencas: { aluno_id: string; presente: boolean; observacao?: string }[]
  ) => {
    if (!user) return;

    try {
      // Atualizar cada presença
      const updates = presencas.map(async (presenca) => {
        const { error } = await supabase
          .from('chamadas_alunos')
          .update({
            presente: presenca.presente,
            observacao: presenca.observacao,
          })
          .eq('chamada_id', chamadaId)
          .eq('aluno_id', presenca.aluno_id);

        if (error) throw error;
      });

      await Promise.all(updates);

      // Buscar a chamada para obter a turma_id
      const { data: chamada } = await supabase
        .from('chamadas')
        .select('turma_id')
        .eq('id', chamadaId)
        .single();

      if (chamada) {
        // Recalcular cards dos alunos que faltaram
        // Isso será feito pelo serviço de recálculo
        const alunosFaltaram = presencas
          .filter(p => !p.presente)
          .map(p => p.aluno_id);

        // Retornar IDs dos alunos que faltaram para processamento posterior
        await fetchChamadas(); // Recarregar lista
        return { alunosFaltaram, turmaId: chamada.turma_id };
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error salvando chamada:', err);
      throw err;
    }
  };

  const getChamadaById = async (id: string): Promise<ChamadaCompleta | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chamadas')
        .select(`
          *,
          turma:turma_id(id, nome),
          professor:professor_id(id, name)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Buscar presenças com informações dos alunos
      const { data: presencas } = await supabase
        .from('chamadas_alunos')
        .select(`
          *,
          aluno:aluno_id(id, nome, email)
        `)
        .eq('chamada_id', id);

      return {
        ...data,
        turma_nome: data.turma?.nome || 'Turma não encontrada',
        professor_nome: data.professor?.name || 'Professor não encontrado',
        presencas: presencas || [],
      };
    } catch (err: any) {
      console.error('Error fetching chamada by id:', err);
      return null;
    }
  };

  const getChamadaListByTurma = async (turmaId: string, data: string): Promise<ChamadaListItem[]> => {
    try {
      // Buscar chamada específica
      const { data: chamada } = await supabase
        .from('chamadas')
        .select('id')
        .eq('turma_id', turmaId)
        .eq('data', data)
        .single();

      if (!chamada) return [];

      // Buscar presenças com nomes dos alunos
      const { data: presencas } = await supabase
        .from('chamadas_alunos')
        .select(`
          *,
          aluno:aluno_id(id, nome)
        `)
        .eq('chamada_id', chamada.id);

      if (!presencas) return [];

      return presencas.map((p: any) => ({
        aluno_id: p.aluno_id,
        aluno_nome: p.aluno?.nome || 'Aluno não encontrado',
        presente: p.presente,
        observacao: p.observacao,
      }));
    } catch (err: any) {
      console.error('Error fetching chamada list:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchChamadas();
  }, [user, turmaId]);

  return {
    chamadas,
    loading,
    error,
    gerarChamada,
    salvarChamada,
    getChamadasByTurma,
    getChamadaById,
    getChamadaListByTurma,
    refetch: fetchChamadas,
  };
}

