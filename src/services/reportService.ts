import { supabase } from '@/lib/supabase';
import { RelatorioTurma, RelatorioConsolidado, AlunoCardWithDetails } from '@/types';

/**
 * Gera dados do relatório de uma turma específica
 */
export async function gerarRelatorioTurma(turmaId: string): Promise<RelatorioTurma | null> {
  try {
    // Buscar informações da turma
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select(`
        id,
        nome,
        professor:professor_id(raw_user_meta_data)
      `)
      .eq('id', turmaId)
      .single();

    if (turmaError) throw turmaError;

    // Buscar última chamada
    const { data: ultimaChamada } = await supabase
      .from('chamadas')
      .select('data')
      .eq('turma_id', turmaId)
      .order('data', { ascending: false })
      .limit(1)
      .single();

    // Buscar todos os alunos da turma
    const { data: alunos } = await supabase
      .from('alunos')
      .select('id')
      .eq('turma_id', turmaId)
      .eq('status', 'ativo');

    // Buscar cards da turma com detalhes
    const { data: cards } = await supabase
      .from('aluno_cards')
      .select(`
        *,
        aluno:aluno_id(id, nome, email, telefone),
        turma:turma_id(nome)
      `)
      .eq('turma_id', turmaId);

    // Formatar cards
    const cardsFormatados: AlunoCardWithDetails[] = (cards || []).map((card: any) => ({
      ...card,
      aluno_nome: card.aluno?.nome || 'Aluno não encontrado',
      aluno_email: card.aluno?.email || '',
      aluno_telefone: card.aluno?.telefone,
      turma_nome: card.turma?.nome || 'Turma não encontrada',
    }));

    // Calcular alertas
    const alertas = {
      faltou_ultima: cardsFormatados.filter(c => c.column_id === 'faltou_ultima').length,
      faltou_2_seguidas: cardsFormatados.filter(c => c.column_id === 'faltou_2_seguidas').length,
      faltou_3_mais_seguidas: cardsFormatados.filter(c => c.column_id === 'faltou_3_mais_seguidas').length,
      faltas_intercaladas: cardsFormatados.filter(c => c.column_id === 'faltas_intercaladas').length,
    };

    return {
      turma_id: turma.id,
      turma_nome: turma.nome,
      professor_nome: (turma as any).professor_nome || 'Não atribuído',
      data_ultima_chamada: ultimaChamada?.data,
      total_alunos: alunos?.length || 0,
      alertas,
      alunos_detalhados: cardsFormatados,
    };
  } catch (error) {
    console.error('Erro ao gerar relatório da turma:', error);
    return null;
  }
}

/**
 * Gera dados do relatório consolidado de todas as turmas
 */
export async function gerarRelatorioConsolidado(): Promise<RelatorioConsolidado | null> {
  try {
    // Buscar todas as turmas ativas
    const { data: turmas, error: turmasError } = await supabase
      .from('turmas')
      .select('id, nome')
      .eq('ativa', true);

    if (turmasError) throw turmasError;

    // Buscar todos os alunos ativos
    const { data: alunos } = await supabase
      .from('alunos')
      .select('id')
      .eq('status', 'ativo');

    // Buscar todos os cards
    const { data: cards } = await supabase
      .from('aluno_cards')
      .select('*');

    // Calcular métricas por categoria
    const metricas_por_categoria = {
      faltou_ultima: cards?.filter(c => c.column_id === 'faltou_ultima').length || 0,
      faltou_2_seguidas: cards?.filter(c => c.column_id === 'faltou_2_seguidas').length || 0,
      faltou_3_mais_seguidas: cards?.filter(c => c.column_id === 'faltou_3_mais_seguidas').length || 0,
      faltas_intercaladas: cards?.filter(c => c.column_id === 'faltas_intercaladas').length || 0,
    };

    // Calcular alertas por turma
    const turmasCriticas = await Promise.all(
      (turmas || []).map(async (turma) => {
        const { data: cardsTurma } = await supabase
          .from('aluno_cards')
          .select('id')
          .eq('turma_id', turma.id);

        return {
          turma_nome: turma.nome,
          total_alertas: cardsTurma?.length || 0,
        };
      })
    );

    // Top 3 turmas com mais alertas
    const top3 = turmasCriticas
      .sort((a, b) => b.total_alertas - a.total_alertas)
      .slice(0, 3);

    // Sugestões de ação
    const sugestoes_acao: string[] = [];
    
    if (metricas_por_categoria.faltou_3_mais_seguidas > 0) {
      sugestoes_acao.push(`🚨 URGENTE: ${metricas_por_categoria.faltou_3_mais_seguidas} aluno(s) com 3+ faltas consecutivas necessitam contato imediato`);
    }
    
    if (metricas_por_categoria.faltou_2_seguidas > 5) {
      sugestoes_acao.push(`⚠️ ${metricas_por_categoria.faltou_2_seguidas} alunos com 2 faltas seguidas - acompanhar de perto`);
    }
    
    if (top3.length > 0 && top3[0].total_alertas > 5) {
      sugestoes_acao.push(`📊 Turma "${top3[0].turma_nome}" precisa de atenção especial (${top3[0].total_alertas} alertas)`);
    }

    if (sugestoes_acao.length === 0) {
      sugestoes_acao.push('✅ Situação sob controle. Continuar monitoramento regular.');
    }

    return {
      data_geracao: new Date().toISOString(),
      total_turmas: turmas?.length || 0,
      total_alunos: alunos?.length || 0,
      total_alertas: cards?.length || 0,
      metricas_por_categoria,
      turmas_criticas: top3,
      sugestoes_acao,
    };
  } catch (error) {
    console.error('Erro ao gerar relatório consolidado:', error);
    return null;
  }
}

/**
 * Formata relatório de turma em HTML
 */
export function formatarEmailHTMLTurma(relatorio: RelatorioTurma): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      opacity: 0.9;
    }
    .section {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    .section h2 {
      margin-top: 0;
      color: #667eea;
      font-size: 20px;
    }
    .alert-box {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
    }
    .alert-item {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 8px;
      flex: 1;
      margin: 0 5px;
    }
    .alert-item .number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .alert-item .label {
      font-size: 12px;
      color: #666;
    }
    .alert-item.warning .number { color: #f59e0b; }
    .alert-item.danger .number { color: #ef4444; }
    .alert-item.critical .number { color: #991b1b; }
    .alert-item.info .number { color: #3b82f6; }
    .aluno-list {
      margin-top: 15px;
    }
    .aluno-item {
      background: white;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 5px;
      border-left: 3px solid #667eea;
    }
    .aluno-item.critico {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .aluno-nome {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .aluno-info {
      font-size: 13px;
      color: #666;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório de Frequência</h1>
    <p><strong>Turma:</strong> ${relatorio.turma_nome}</p>
    <p><strong>Professor:</strong> ${relatorio.professor_nome}</p>
    ${relatorio.data_ultima_chamada ? `<p><strong>Última Chamada:</strong> ${new Date(relatorio.data_ultima_chamada).toLocaleDateString('pt-BR')}</p>` : ''}
    <p><strong>Total de Alunos:</strong> ${relatorio.total_alunos}</p>
  </div>

  <div class="section">
    <h2>📈 Resumo de Alertas</h2>
    <div class="alert-box">
      <div class="alert-item info">
        <div class="number">${relatorio.alertas.faltou_ultima}</div>
        <div class="label">Faltou Última</div>
      </div>
      <div class="alert-item warning">
        <div class="number">${relatorio.alertas.faltou_2_seguidas}</div>
        <div class="label">2 Seguidas</div>
      </div>
      <div class="alert-item danger">
        <div class="number">${relatorio.alertas.faltou_3_mais_seguidas}</div>
        <div class="label">3+ Seguidas</div>
      </div>
      <div class="alert-item critical">
        <div class="number">${relatorio.alertas.faltas_intercaladas}</div>
        <div class="label">Intercaladas</div>
      </div>
    </div>
  </div>

  ${relatorio.alunos_detalhados.length > 0 ? `
  <div class="section">
    <h2>👥 Alunos que Precisam de Atenção</h2>
    <div class="aluno-list">
      ${relatorio.alunos_detalhados
        .sort((a, b) => b.faltas_consecutivas - a.faltas_consecutivas)
        .map(aluno => `
          <div class="aluno-item ${aluno.faltas_consecutivas >= 3 ? 'critico' : ''}">
            <div class="aluno-nome">
              ${aluno.faltas_consecutivas >= 3 ? '🚨 ' : ''}${aluno.aluno_nome}
            </div>
            <div class="aluno-info">
              Total de Faltas: ${aluno.total_faltas} | 
              Faltas Consecutivas: ${aluno.faltas_consecutivas} | 
              ${aluno.aluno_email}
              ${aluno.aluno_telefone ? ` | ${aluno.aluno_telefone}` : ''}
            </div>
            ${aluno.observacao ? `<div class="aluno-info" style="margin-top: 5px; font-style: italic;">Obs: ${aluno.observacao}</div>` : ''}
          </div>
        `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Este relatório foi gerado automaticamente pelo Sistema de Acompanhamento Acadêmico.</p>
    <p>Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
  </div>
</body>
</html>
  `;

  const text = `
RELATÓRIO DE FREQUÊNCIA
Turma: ${relatorio.turma_nome}
Professor: ${relatorio.professor_nome}
${relatorio.data_ultima_chamada ? `Última Chamada: ${new Date(relatorio.data_ultima_chamada).toLocaleDateString('pt-BR')}` : ''}
Total de Alunos: ${relatorio.total_alunos}

RESUMO DE ALERTAS:
- Faltou Última Aula: ${relatorio.alertas.faltou_ultima}
- 2 Faltas Seguidas: ${relatorio.alertas.faltou_2_seguidas}
- 3+ Faltas Seguidas: ${relatorio.alertas.faltou_3_mais_seguidas}
- Faltas Intercaladas: ${relatorio.alertas.faltas_intercaladas}

${relatorio.alunos_detalhados.length > 0 ? `
ALUNOS QUE PRECISAM DE ATENÇÃO:
${relatorio.alunos_detalhados
  .sort((a, b) => b.faltas_consecutivas - a.faltas_consecutivas)
  .map(aluno => `
${aluno.faltas_consecutivas >= 3 ? '🚨 ' : ''}${aluno.aluno_nome}
- Total de Faltas: ${aluno.total_faltas}
- Faltas Consecutivas: ${aluno.faltas_consecutivas}
- Contato: ${aluno.aluno_email}${aluno.aluno_telefone ? ` | ${aluno.aluno_telefone}` : ''}
${aluno.observacao ? `- Observação: ${aluno.observacao}` : ''}
`).join('\n')}
` : ''}

---
Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
  `;

  return { html, text };
}

/**
 * Formata relatório consolidado em HTML
 */
export function formatarEmailHTMLConsolidado(relatorio: RelatorioConsolidado): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-card .number {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }
    .stat-card .label {
      font-size: 14px;
      color: #666;
    }
    .section {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    .section h2 {
      margin-top: 0;
      color: #667eea;
      font-size: 20px;
    }
    .alert-bar {
      display: flex;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
      margin: 15px 0;
    }
    .alert-bar div {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .turma-item {
      background: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .turma-item .turma-nome {
      font-weight: bold;
    }
    .turma-item .badge {
      background: #ef4444;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
    }
    .sugestoes {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
    }
    .sugestoes ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .sugestoes li {
      margin: 5px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório Consolidado</h1>
    <p>Visão Geral de Todas as Turmas</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="number">${relatorio.total_turmas}</div>
      <div class="label">Turmas Ativas</div>
    </div>
    <div class="stat-card">
      <div class="number">${relatorio.total_alunos}</div>
      <div class="label">Total de Alunos</div>
    </div>
    <div class="stat-card">
      <div class="number">${relatorio.total_alertas}</div>
      <div class="label">Alertas Ativos</div>
    </div>
  </div>

  <div class="section">
    <h2>📈 Distribuição de Alertas</h2>
    <div class="alert-bar">
      ${relatorio.metricas_por_categoria.faltou_ultima > 0 ? `<div style="background: #3b82f6; width: ${(relatorio.metricas_por_categoria.faltou_ultima / relatorio.total_alertas * 100)}%">${relatorio.metricas_por_categoria.faltou_ultima}</div>` : ''}
      ${relatorio.metricas_por_categoria.faltou_2_seguidas > 0 ? `<div style="background: #f59e0b; width: ${(relatorio.metricas_por_categoria.faltou_2_seguidas / relatorio.total_alertas * 100)}%">${relatorio.metricas_por_categoria.faltou_2_seguidas}</div>` : ''}
      ${relatorio.metricas_por_categoria.faltou_3_mais_seguidas > 0 ? `<div style="background: #ef4444; width: ${(relatorio.metricas_por_categoria.faltou_3_mais_seguidas / relatorio.total_alertas * 100)}%">${relatorio.metricas_por_categoria.faltou_3_mais_seguidas}</div>` : ''}
      ${relatorio.metricas_por_categoria.faltas_intercaladas > 0 ? `<div style="background: #ec4899; width: ${(relatorio.metricas_por_categoria.faltas_intercaladas / relatorio.total_alertas * 100)}%">${relatorio.metricas_por_categoria.faltas_intercaladas}</div>` : ''}
    </div>
    <p style="font-size: 13px; color: #666; margin-top: 10px;">
      <span style="color: #3b82f6;">■</span> Faltou Última (${relatorio.metricas_por_categoria.faltou_ultima}) | 
      <span style="color: #f59e0b;">■</span> 2 Seguidas (${relatorio.metricas_por_categoria.faltou_2_seguidas}) | 
      <span style="color: #ef4444;">■</span> 3+ Seguidas (${relatorio.metricas_por_categoria.faltou_3_mais_seguidas}) | 
      <span style="color: #ec4899;">■</span> Intercaladas (${relatorio.metricas_por_categoria.faltas_intercaladas})
    </p>
  </div>

  ${relatorio.turmas_criticas.length > 0 ? `
  <div class="section">
    <h2>🔴 Turmas que Precisam de Atenção</h2>
    ${relatorio.turmas_criticas.map((turma, index) => `
      <div class="turma-item">
        <div>
          <span style="color: #666; margin-right: 10px;">#${index + 1}</span>
          <span class="turma-nome">${turma.turma_nome}</span>
        </div>
        <div class="badge">${turma.total_alertas} alertas</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="sugestoes">
    <h3 style="margin-top: 0; color: #d97706;">💡 Sugestões de Ação</h3>
    <ul>
      ${relatorio.sugestoes_acao.map(sugestao => `<li>${sugestao}</li>`).join('')}
    </ul>
  </div>

  <div class="footer">
    <p>Este relatório foi gerado automaticamente pelo Sistema de Acompanhamento Acadêmico.</p>
    <p>Data: ${new Date(relatorio.data_geracao).toLocaleDateString('pt-BR')} às ${new Date(relatorio.data_geracao).toLocaleTimeString('pt-BR')}</p>
  </div>
</body>
</html>
  `;

  const text = `
RELATÓRIO CONSOLIDADO
Visão Geral de Todas as Turmas

ESTATÍSTICAS GERAIS:
- Turmas Ativas: ${relatorio.total_turmas}
- Total de Alunos: ${relatorio.total_alunos}
- Alertas Ativos: ${relatorio.total_alertas}

DISTRIBUIÇÃO DE ALERTAS:
- Faltou Última Aula: ${relatorio.metricas_por_categoria.faltou_ultima}
- 2 Faltas Seguidas: ${relatorio.metricas_por_categoria.faltou_2_seguidas}
- 3+ Faltas Seguidas: ${relatorio.metricas_por_categoria.faltou_3_mais_seguidas}
- Faltas Intercaladas: ${relatorio.metricas_por_categoria.faltas_intercaladas}

${relatorio.turmas_criticas.length > 0 ? `
TURMAS QUE PRECISAM DE ATENÇÃO:
${relatorio.turmas_criticas.map((turma, i) => `${i + 1}. ${turma.turma_nome} - ${turma.total_alertas} alertas`).join('\n')}
` : ''}

SUGESTÕES DE AÇÃO:
${relatorio.sugestoes_acao.map(s => `- ${s}`).join('\n')}

---
Relatório gerado em: ${new Date(relatorio.data_geracao).toLocaleString('pt-BR')}
  `;

  return { html, text };
}

/**
 * Envia relatório de turma por email
 */
export async function enviarRelatorioTurma(
  turmaId: string,
  destinatarios: string[],
  _userId: string,
  from: string
) {
  const relatorio = await gerarRelatorioTurma(turmaId);
  
  if (!relatorio) {
    throw new Error('Erro ao gerar relatório da turma');
  }

  const { html, text } = formatarEmailHTMLTurma(relatorio);
  
  // Retornar dados para envio
  return {
    assunto: `Relatório de Frequência - ${relatorio.turma_nome}`,
    html,
    text,
    destinatarios,
    from,
  };
}

/**
 * Envia relatório consolidado por email
 */
export async function enviarRelatorioConsolidado(
  destinatarios: string[],
  _userId: string,
  from: string
) {
  const relatorio = await gerarRelatorioConsolidado();
  
  if (!relatorio) {
    throw new Error('Erro ao gerar relatório consolidado');
  }

  const { html, text } = formatarEmailHTMLConsolidado(relatorio);
  
  // Retornar dados para envio
  return {
    assunto: 'Relatório Consolidado - Todas as Turmas',
    html,
    text,
    destinatarios,
    from,
  };
}

