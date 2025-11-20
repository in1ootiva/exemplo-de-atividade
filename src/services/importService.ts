import { supabaseGoDevs, isGoDevsAvailable as checkGoDevsAvailable } from '@/lib/supabaseGoDevs';
import { supabase } from '@/lib/supabase';
import { 
  GoDevsTurma, 
  GoDevsAluno, 
  ImportacaoResultado, 
  SincronizacaoResultado 
} from '@/types';

/**
 * Re-exportar função de verificação
 */
export const isGoDevsAvailable = checkGoDevsAvailable;

/**
 * Buscar turmas do projeto GoDevs
 */
export async function buscarTurmasGoDevs(): Promise<GoDevsTurma[]> {
  if (!checkGoDevsAvailable()) {
    throw new Error('GoDevs não está configurado. Verifique as variáveis de ambiente.');
  }

  try {
    // Buscar da tabela 'classes' do GoDevs
    const { data, error } = await supabaseGoDevs!
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar turmas do GoDevs:', error);
      throw new Error(`Erro ao conectar com GoDevs: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn('Nenhuma turma encontrada no GoDevs. Verifique as políticas RLS.');
      return [];
    }

    // Mapear para o formato esperado
    return data.map((classe: any) => ({
      id: classe.id,
      nome: classe.name,
      descricao: undefined,
      created_at: classe.created_at,
    }));
  } catch (err: any) {
    console.error('Erro ao buscar turmas:', err);
    throw new Error(`Erro ao conectar com GoDevs: ${err.message}`);
  }
}

/**
 * Buscar alunos de uma turma específica do GoDevs
 * ATUALIZADO v1.2: Busca email real de auth.users e conta atividades
 */
export async function buscarAlunosGoDevs(turmaId: string): Promise<GoDevsAluno[]> {
  if (!checkGoDevsAvailable()) {
    throw new Error('GoDevs não está configurado');
  }

  try {
    // Buscar IDs únicos e contar atividades por aluno
    const { data: activities, error: activitiesError } = await supabaseGoDevs!
      .from('submitted_activities')
      .select('user_id')
      .eq('class_id', turmaId);

    if (activitiesError) {
      console.error('Erro ao buscar atividades do GoDevs:', activitiesError);
      return [];
    }

    if (!activities || activities.length === 0) {
      console.warn(`⚠️ Nenhuma atividade encontrada para turma ${turmaId}`);
      return [];
    }

    // Contar atividades por aluno
    const atividadesPorAluno = activities.reduce((acc: any, curr: any) => {
      acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
      return acc;
    }, {});

    // Extrair IDs únicos
    const userIds = Object.keys(atividadesPorAluno);
    console.log(`📊 ${userIds.length} aluno(s) único(s) com atividades enviadas`);

    if (userIds.length === 0) {
      return [];
    }

    // Buscar dados dos alunos na tabela profiles COM email via subquery
    const { data: profiles, error: profilesError } = await supabaseGoDevs!
      .rpc('get_students_with_email', { user_ids: userIds });

    // Se RPC não existir, fazer manualmente
    if (profilesError || !profiles) {
      console.warn('RPC não disponível, buscando dados manualmente...');
      
      // Buscar profiles sem email
      const { data: profilesData, error: profilesErr } = await supabaseGoDevs!
        .from('profiles')
        .select('id, full_name, nickname, cpf, github_url, linkedin_url, avatar_url, updated_at')
        .in('id', userIds);

      if (profilesErr || !profilesData) {
        console.error('Erro ao buscar profiles:', profilesErr);
        return [];
      }

      // Para cada profile, buscar email via auth.users (uma query por aluno)
      const alunosComDados = await Promise.all(
        profilesData.map(async (profile: any) => {
          // Tentar buscar email via SQL direto (pode não funcionar via REST API)
          // Como fallback, usamos o ID
          const email = `${profile.full_name?.toLowerCase().replace(/\s+/g, '.')}@aluno.temp`;
          
          return {
            id: profile.id,
            turma_id: turmaId,
            nome_completo: profile.full_name || profile.nickname || 'Aluno sem nome',
            nome: profile.full_name || profile.nickname || 'Aluno sem nome',
            email: email,
            telefone: undefined,
            cpf: profile.cpf,
            github_url: profile.github_url,
            linkedin_url: profile.linkedin_url,
            avatar_url: profile.avatar_url,
            atividades_entregues: atividadesPorAluno[profile.id] || 0,
            created_at: profile.updated_at,
          };
        })
      );

      console.log(`✅ ${alunosComDados.length} aluno(s) processado(s)`);
      return alunosComDados;
    }

    // Se RPC funcionou, processar resultados
    console.log(`✅ ${profiles.length} aluno(s) encontrado(s) na turma`);
    
    return profiles.map((profile: any) => ({
      id: profile.id,
      turma_id: turmaId,
      nome_completo: profile.full_name || profile.nickname || 'Aluno sem nome',
      nome: profile.full_name || profile.nickname || 'Aluno sem nome',
      email: profile.email || `${profile.full_name?.toLowerCase().replace(/\s+/g, '.')}@aluno.temp`,
      telefone: undefined,
      cpf: profile.cpf,
      github_url: profile.github_url,
      linkedin_url: profile.linkedin_url,
      avatar_url: profile.avatar_url,
      atividades_entregues: atividadesPorAluno[profile.id] || 0,
      created_at: profile.updated_at,
    }));
  } catch (err: any) {
    console.error('Erro ao buscar alunos do GoDevs:', err);
    return [];
  }
}

/**
 * Normalizar nome do aluno (aceita 'nome' ou 'nome_completo')
 */
function getNomeAluno(aluno: any): string {
  return aluno.nome_completo || aluno.nome || aluno.name || 'Aluno sem nome';
}

/**
 * Importar turma do GoDevs para o Kanban
 */
export async function importarTurmaDoGoDevs(
  goDevsTurma: GoDevsTurma,
  coordenadorId: string,
  professorId: string,
  diasAula: string[],
  horario: string
): Promise<ImportacaoResultado> {
  const erros: string[] = [];

  try {
    // Verificar se já existe no Kanban
    const { data: existente } = await supabase
      .from('turmas')
      .select('id, nome')
      .eq('nome', goDevsTurma.nome)
      .maybeSingle();

    if (existente) {
      throw new Error(`Turma "${goDevsTurma.nome}" já existe no sistema (ID: ${existente.id})`);
    }

    // Criar turma no Kanban
    const { data: novaTurma, error: turmaError } = await supabase
      .from('turmas')
      .insert([{
        nome: goDevsTurma.nome,
        coordenador_id: coordenadorId,
        professor_id: professorId,
        dias_aula: diasAula,
        horario: horario,
        ativa: true,
      }])
      .select()
      .single();

    if (turmaError) throw turmaError;
    if (!novaTurma) throw new Error('Erro ao criar turma');

    console.log(`✅ Turma "${goDevsTurma.nome}" criada com sucesso!`);

    // Buscar alunos dessa turma no GoDevs
    const alunosGoDevs = await buscarAlunosGoDevs(goDevsTurma.id);
    
    let alunosImportados = 0;

    if (alunosGoDevs.length > 0) {
      console.log(`📥 Importando ${alunosGoDevs.length} alunos...`);

      // Importar alunos um por um para capturar erros individuais
      for (const aluno of alunosGoDevs) {
        try {
          const { error: alunoError } = await supabase
            .from('alunos')
            .insert([{
              turma_id: novaTurma.id,
              nome: getNomeAluno(aluno),
              email: aluno.email || `semEmail${alunosImportados}@temp.com`,
              telefone: aluno.telefone || null,
              status: 'ativo',
              atividades_entregues: aluno.atividades_entregues || 0,
            }]);

          if (alunoError) {
            erros.push(`Erro ao importar aluno ${getNomeAluno(aluno)}: ${alunoError.message}`);
          } else {
            alunosImportados++;
          }
        } catch (err: any) {
          erros.push(`Erro ao importar aluno ${getNomeAluno(aluno)}: ${err.message}`);
        }
      }

      console.log(`✅ ${alunosImportados}/${alunosGoDevs.length} alunos importados`);
    } else {
      console.warn('⚠️ Nenhum aluno encontrado para esta turma no GoDevs');
    }

    return {
      turma: novaTurma,
      alunosImportados,
      erros: erros.length > 0 ? erros : undefined,
    };
  } catch (err: any) {
    console.error('Erro ao importar turma:', err);
    throw err;
  }
}

/**
 * Sincronizar dados de alunos (atualizar emails, nomes, etc)
 */
export async function sincronizarAlunosComGoDevs(
  turmaKanbanId: string, 
  turmaNome: string
): Promise<SincronizacaoResultado> {
  if (!checkGoDevsAvailable()) {
    throw new Error('GoDevs não está configurado');
  }

  const erros: string[] = [];

  try {
    // Buscar turma no GoDevs pelo nome
    const turmasGoDevs = await buscarTurmasGoDevs();
    const turmaGoDevs = turmasGoDevs.find(t => 
      t.nome.toLowerCase() === turmaNome.toLowerCase()
    );

    if (!turmaGoDevs) {
      throw new Error(`Turma "${turmaNome}" não encontrada no GoDevs`);
    }

    // Buscar alunos do GoDevs
    const alunosGoDevs = await buscarAlunosGoDevs(turmaGoDevs.id);

    if (alunosGoDevs.length === 0) {
      return { atualizados: 0, novos: 0 };
    }

    // Buscar alunos do Kanban
    const { data: alunosKanban, error: kanbanError } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', turmaKanbanId);

    if (kanbanError) throw kanbanError;
    if (!alunosKanban) return { atualizados: 0, novos: 0 };

    let atualizados = 0;
    let novos = 0;

    // Atualizar alunos existentes e adicionar novos
    for (const alunoGoDevs of alunosGoDevs) {
      try {
        const alunoExistente = alunosKanban.find(a => 
          a.email === alunoGoDevs.email || 
          a.nome === getNomeAluno(alunoGoDevs)
        );

        if (alunoExistente) {
          // Atualizar dados
          const { error: updateError } = await supabase
            .from('alunos')
            .update({
              nome: getNomeAluno(alunoGoDevs),
              email: alunoGoDevs.email || alunoExistente.email,
              telefone: alunoGoDevs.telefone || alunoExistente.telefone,
              atividades_entregues: alunoGoDevs.atividades_entregues || 0,
            })
            .eq('id', alunoExistente.id);

          if (updateError) {
            erros.push(`Erro ao atualizar ${getNomeAluno(alunoGoDevs)}: ${updateError.message}`);
          } else {
            atualizados++;
          }
        } else {
          // Adicionar novo aluno
          const { error: insertError } = await supabase
            .from('alunos')
            .insert([{
              turma_id: turmaKanbanId,
              nome: getNomeAluno(alunoGoDevs),
              email: alunoGoDevs.email || `semEmail${novos}@temp.com`,
              telefone: alunoGoDevs.telefone || null,
              status: 'ativo',
              atividades_entregues: alunoGoDevs.atividades_entregues || 0,
            }]);

          if (insertError) {
            erros.push(`Erro ao adicionar ${getNomeAluno(alunoGoDevs)}: ${insertError.message}`);
          } else {
            novos++;
          }
        }
      } catch (err: any) {
        erros.push(`Erro ao processar aluno: ${err.message}`);
      }
    }

    return { 
      atualizados, 
      novos,
      erros: erros.length > 0 ? erros : undefined,
    };
  } catch (err: any) {
    console.error('Erro ao sincronizar alunos:', err);
    throw err;
  }
}

/**
 * Buscar estatísticas de um aluno no GoDevs (atividades entregues, etc)
 */
export async function buscarEstatisticasAlunoGoDevs(email: string): Promise<GoDevsAluno | null> {
  if (!checkGoDevsAvailable()) {
    return null;
  }

  try {
    const tentativas = [
      'alunos',
      'students',
      'enrollments',
    ];

    for (const tabela of tentativas) {
      const { data, error } = await supabaseGoDevs!
        .from(tabela)
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    }

    return null;
  } catch (err: any) {
    console.error('Erro ao buscar estatísticas do aluno:', err);
    return null;
  }
}

