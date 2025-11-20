/**
 * Script para verificar a estrutura do banco GoDevs
 * Execute: node -r tsx/register src/scripts/verificarGoDevs.ts
 */

import { supabaseGoDevs } from '../lib/supabaseGoDevs';

async function verificarEstrutura() {
  console.log('🔍 Verificando estrutura do banco GoDevs...\n');

  if (!supabaseGoDevs) {
    console.error('❌ GoDevs não configurado!');
    console.log('📝 Configure VITE_GODEVS_SUPABASE_URL e VITE_GODEVS_SUPABASE_ANON_KEY no .env.local');
    return;
  }

  // Testar diferentes nomes de tabelas
  const tabelasPossiveis = {
    turmas: ['turmas', 'classes', 'courses', 'classrooms'],
    alunos: ['alunos', 'students', 'enrollments', 'participants'],
  };

  console.log('📊 Procurando tabelas de TURMAS:');
  for (const nome of tabelasPossiveis.turmas) {
    try {
      const { data, error } = await supabaseGoDevs
        .from(nome)
        .select('*')
        .limit(1);

      if (!error && data) {
        console.log(`  ✅ Encontrado: "${nome}" (${data.length} registro(s))`);
        if (data.length > 0) {
          console.log(`     Campos:`, Object.keys(data[0]).join(', '));
        }
      }
    } catch (err) {
      // Tabela não existe
    }
  }

  console.log('\n👥 Procurando tabelas de ALUNOS:');
  for (const nome of tabelasPossiveis.alunos) {
    try {
      const { data, error } = await supabaseGoDevs
        .from(nome)
        .select('*')
        .limit(1);

      if (!error && data) {
        console.log(`  ✅ Encontrado: "${nome}" (${data.length} registro(s))`);
        if (data.length > 0) {
          console.log(`     Campos:`, Object.keys(data[0]).join(', '));
        }
      }
    } catch (err) {
      // Tabela não existe
    }
  }

  // Tentar buscar turmas com o método do serviço
  console.log('\n🎯 Testando busca de turmas...');
  try {
    const { buscarTurmasGoDevs } = await import('../services/importService');
    const turmas = await buscarTurmasGoDevs();
    console.log(`  ✅ ${turmas.length} turma(s) encontrada(s)`);
    
    if (turmas.length > 0) {
      console.log('\n📋 Primeira turma:');
      console.log(JSON.stringify(turmas[0], null, 2));
    }
  } catch (err: any) {
    console.error(`  ❌ Erro:`, err.message);
  }

  // Tentar buscar alunos
  console.log('\n👥 Testando busca de alunos...');
  try {
    const { buscarTurmasGoDevs, buscarAlunosGoDevs } = await import('../services/importService');
    const turmas = await buscarTurmasGoDevs();
    
    if (turmas.length > 0) {
      const alunos = await buscarAlunosGoDevs(turmas[0].id);
      console.log(`  ✅ ${alunos.length} aluno(s) encontrado(s) na primeira turma`);
      
      if (alunos.length > 0) {
        console.log('\n👤 Primeiro aluno:');
        console.log(JSON.stringify(alunos[0], null, 2));
      }
    }
  } catch (err: any) {
    console.error(`  ❌ Erro:`, err.message);
  }

  console.log('\n✅ Verificação concluída!');
}

verificarEstrutura();

