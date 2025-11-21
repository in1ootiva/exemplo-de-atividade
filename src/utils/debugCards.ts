/**
 * Utilitários de Debug para Cards de Alunos
 * Use estas funções no console do navegador para diagnosticar problemas
 */

import { supabase } from '@/lib/supabase';

/**
 * Lista todos os cards com informações dos alunos
 */
export async function listarTodosCards() {
  console.log('📋 Buscando todos os cards...');
  
  const { data, error } = await supabase
    .from('aluno_cards')
    .select(`
      id,
      column_id,
      total_faltas,
      faltas_consecutivas,
      aluno:aluno_id(id, nome, email, status, turma_id)
    `);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log(`✅ Total de cards: ${data?.length || 0}`);
  console.table(data);
  return data;
}

/**
 * Lista apenas cards de alunos inativos
 */
export async function listarCardsInativos() {
  console.log('🔍 Buscando cards de alunos inativos...');
  
  const { data, error } = await supabase
    .from('aluno_cards')
    .select(`
      id,
      column_id,
      total_faltas,
      aluno:aluno_id(id, nome, email, status)
    `);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  const cardsInativos = data?.filter((card: any) => 
    card.aluno?.status === 'inativo' || !card.aluno
  );

  console.log(`⚠️ Cards de alunos inativos: ${cardsInativos?.length || 0}`);
  console.table(cardsInativos);
  return cardsInativos;
}

/**
 * Busca card de um aluno específico por nome
 */
export async function buscarCardPorNome(nome: string) {
  console.log(`🔎 Buscando cards para: ${nome}`);
  
  const { data: alunos, error: alunoError } = await supabase
    .from('alunos')
    .select('id, nome, email, status, turma_id')
    .ilike('nome', `%${nome}%`);

  if (alunoError) {
    console.error('❌ Erro ao buscar aluno:', alunoError);
    return;
  }

  if (!alunos || alunos.length === 0) {
    console.log('❌ Nenhum aluno encontrado com esse nome');
    return;
  }

  console.log(`👤 Alunos encontrados:`, alunos);

  for (const aluno of alunos) {
    const { data: cards, error: cardError } = await supabase
      .from('aluno_cards')
      .select('*')
      .eq('aluno_id', aluno.id);

    if (cardError) {
      console.error(`❌ Erro ao buscar cards de ${aluno.nome}:`, cardError);
      continue;
    }

    console.log(`\n📊 Cards de ${aluno.nome} (${aluno.status}):`);
    console.table(cards);
  }

  return alunos;
}

/**
 * Remove card de um aluno específico por nome
 */
export async function removerCardPorNome(nome: string) {
  const alunos = await buscarCardPorNome(nome);
  
  if (!alunos || alunos.length === 0) {
    return;
  }

  if (alunos.length > 1) {
    console.warn('⚠️ Mais de um aluno encontrado. Especifique melhor o nome.');
    return;
  }

  const aluno = alunos[0];
  
  if (!confirm(`Deseja remover o card de ${aluno.nome}? (${aluno.status})`)) {
    console.log('❌ Operação cancelada');
    return;
  }

  console.log(`🗑️ Removendo card de ${aluno.nome}...`);
  
  const { error } = await supabase
    .from('aluno_cards')
    .delete()
    .eq('aluno_id', aluno.id);

  if (error) {
    console.error('❌ Erro ao remover card:', error);
    return;
  }

  console.log(`✅ Card de ${aluno.nome} removido com sucesso!`);
}

/**
 * Remove TODOS os cards de alunos inativos
 */
export async function limparTodosCardsInativos() {
  const cardsInativos = await listarCardsInativos();
  
  if (!cardsInativos || cardsInativos.length === 0) {
    console.log('✅ Nenhum card inativo encontrado!');
    return;
  }

  if (!confirm(`Deseja remover ${cardsInativos.length} card(s) de alunos inativos?`)) {
    console.log('❌ Operação cancelada');
    return;
  }

  console.log(`🗑️ Removendo ${cardsInativos.length} cards...`);
  
  const ids = cardsInativos.map((c: any) => c.id);
  const { error } = await supabase
    .from('aluno_cards')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('❌ Erro ao remover cards:', error);
    return;
  }

  console.log(`✅ ${cardsInativos.length} cards removidos com sucesso!`);
}

// Expor funções globalmente para uso no console
if (typeof window !== 'undefined') {
  (window as any).debugCards = {
    listarTodosCards,
    listarCardsInativos,
    buscarCardPorNome,
    removerCardPorNome,
    limparTodosCardsInativos,
  };
  
  console.log(`
🛠️ Debug Cards disponível!

Use no console:
- debugCards.listarTodosCards()
- debugCards.listarCardsInativos()
- debugCards.buscarCardPorNome("Luan")
- debugCards.removerCardPorNome("Luan Oliveira")
- debugCards.limparTodosCardsInativos()
  `);
}

