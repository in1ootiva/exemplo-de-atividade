import { useState } from 'react';
import { 
  buscarTurmasGoDevs, 
  buscarAlunosGoDevs,
  importarTurmaDoGoDevs, 
  sincronizarAlunosComGoDevs,
  buscarEstatisticasAlunoGoDevs,
  isGoDevsAvailable 
} from '@/services/importService';
import { GoDevsTurma, GoDevsAluno, ImportacaoResultado, SincronizacaoResultado } from '@/types';
import { useAuth } from './useAuth';

export function useImportGoDevs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const disponivel = isGoDevsAvailable();

  /**
   * Listar todas as turmas disponíveis no GoDevs
   */
  const listarTurmasGoDevs = async (): Promise<GoDevsTurma[]> => {
    try {
      setLoading(true);
      setError(null);
      const turmas = await buscarTurmasGoDevs();
      return turmas;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar turmas do GoDevs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar alunos de uma turma específica do GoDevs
   */
  const listarAlunosGoDevs = async (turmaId: string): Promise<GoDevsAluno[]> => {
    try {
      setLoading(true);
      setError(null);
      const alunos = await buscarAlunosGoDevs(turmaId);
      return alunos;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar alunos do GoDevs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Importar turma do GoDevs para o Kanban
   */
  const importarTurma = async (
    goDevsTurma: GoDevsTurma,
    coordenadorId: string,
    professorId: string,
    diasAula: string[],
    horario: string
  ): Promise<ImportacaoResultado> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      setError(null);
      
      const resultado = await importarTurmaDoGoDevs(
        goDevsTurma,
        coordenadorId,
        professorId,
        diasAula,
        horario
      );
      
      return resultado;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao importar turma:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sincronizar dados de alunos de uma turma com o GoDevs
   */
  const sincronizarTurma = async (
    turmaKanbanId: string, 
    turmaNome: string
  ): Promise<SincronizacaoResultado> => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await sincronizarAlunosComGoDevs(turmaKanbanId, turmaNome);
      return resultado;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao sincronizar turma:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar estatísticas de um aluno específico no GoDevs
   */
  const buscarEstatisticasAluno = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await buscarEstatisticasAlunoGoDevs(email);
      return stats;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar estatísticas:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    disponivel,
    loading,
    error,
    listarTurmasGoDevs,
    listarAlunosGoDevs,
    importarTurma,
    sincronizarTurma,
    buscarEstatisticasAluno,
  };
}

