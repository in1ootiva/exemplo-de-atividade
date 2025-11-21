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
  const dataFormatada = relatorio.data_ultima_chamada 
    ? new Date(relatorio.data_ultima_chamada).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    : 'Nenhuma chamada registrada';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      padding: 20px;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: #1f2937;
      color: #ffffff;
      padding: 32px 40px;
      border-bottom: 3px solid #3b82f6;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    .header-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      font-size: 14px;
    }
    .header-info-item {
      color: #d1d5db;
    }
    .header-info-item strong {
      color: #ffffff;
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 40px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }
    .summary-item {
      text-align: center;
      padding: 16px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .summary-item .value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
      line-height: 1;
    }
    .summary-item .label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .summary-item.info .value { color: #3b82f6; }
    .summary-item.warning .value { color: #f59e0b; }
    .summary-item.danger .value { color: #ef4444; }
    .summary-item.intercaladas .value { color: #8b5cf6; }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .alunos-list {
      margin-top: 16px;
    }
    .aluno-item {
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 12px;
      border-left: 4px solid #3b82f6;
    }
    .aluno-item.critico {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .aluno-item:last-child {
      margin-bottom: 0;
    }
    .aluno-nome {
      font-weight: 600;
      color: #1f2937;
      font-size: 15px;
      margin-bottom: 8px;
    }
    .aluno-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .aluno-details-item {
      display: flex;
      align-items: center;
    }
    .aluno-details-item strong {
      color: #374151;
      margin-right: 6px;
      font-weight: 500;
    }
    .aluno-obs {
      font-size: 13px;
      color: #6b7280;
      font-style: italic;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
    }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .empty-state-text {
      font-size: 14px;
    }
    .footer {
      background: #f9fafb;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .footer-date {
      font-size: 12px;
      color: #9ca3af;
    }
    @media only screen and (max-width: 600px) {
      .summary {
        grid-template-columns: repeat(2, 1fr);
      }
      .header-info {
        grid-template-columns: 1fr;
      }
      .aluno-details {
        grid-template-columns: 1fr;
      }
      .content {
        padding: 24px;
      }
      .header {
        padding: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Relatório de Frequência</h1>
      <div class="header-info">
        <div class="header-info-item">
          <strong>Turma</strong>
          ${relatorio.turma_nome}
        </div>
        <div class="header-info-item">
          <strong>Professor</strong>
          ${relatorio.professor_nome}
        </div>
        <div class="header-info-item">
          <strong>Última Chamada</strong>
          ${dataFormatada}
        </div>
        <div class="header-info-item">
          <strong>Total de Alunos</strong>
          ${relatorio.total_alunos}
        </div>
      </div>
    </div>
    
    <div class="content">
      <div class="summary">
        <div class="summary-item info">
          <div class="value">${relatorio.alertas.faltou_ultima}</div>
          <div class="label">Faltou Última</div>
        </div>
        <div class="summary-item warning">
          <div class="value">${relatorio.alertas.faltou_2_seguidas}</div>
          <div class="label">2 Seguidas</div>
        </div>
        <div class="summary-item danger">
          <div class="value">${relatorio.alertas.faltou_3_mais_seguidas}</div>
          <div class="label">3+ Seguidas</div>
        </div>
        <div class="summary-item intercaladas">
          <div class="value">${relatorio.alertas.faltas_intercaladas}</div>
          <div class="label">Intercaladas</div>
        </div>
      </div>

      ${relatorio.alunos_detalhados.length > 0 ? `
      <div class="section">
        <div class="section-title">Alunos que Requerem Atenção</div>
        <div class="alunos-list">
          ${relatorio.alunos_detalhados
            .sort((a, b) => b.faltas_consecutivas - a.faltas_consecutivas)
            .map(aluno => `
              <div class="aluno-item ${aluno.faltas_consecutivas >= 3 ? 'critico' : ''}">
                <div class="aluno-nome">
                  ${aluno.faltas_consecutivas >= 3 ? '⚠️ ' : ''}${aluno.aluno_nome}
                </div>
                <div class="aluno-details">
                  <div class="aluno-details-item">
                    <strong>Total de Faltas:</strong> ${aluno.total_faltas}
                  </div>
                  <div class="aluno-details-item">
                    <strong>Faltas Consecutivas:</strong> ${aluno.faltas_consecutivas}
                  </div>
                  <div class="aluno-details-item">
                    <strong>Email:</strong> ${aluno.aluno_email}
                  </div>
                  ${aluno.aluno_telefone ? `
                  <div class="aluno-details-item">
                    <strong>Telefone:</strong> ${aluno.aluno_telefone}
                  </div>
                  ` : ''}
                </div>
                ${aluno.observacao ? `
                <div class="aluno-obs">
                  <strong>Observação:</strong> ${aluno.observacao}
                </div>
                ` : ''}
              </div>
            `).join('')}
        </div>
      </div>
      ` : `
      <div class="section">
        <div class="empty-state">
          <div class="empty-state-icon">✓</div>
          <div class="empty-state-text">Nenhum aluno requer atenção especial no momento.</div>
        </div>
      </div>
      `}
    </div>

    <div class="footer">
      <div class="footer-text">Sistema de Acompanhamento Acadêmico</div>
      <div class="footer-date">${new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
RELATÓRIO DE FREQUÊNCIA
${'='.repeat(50)}

Turma: ${relatorio.turma_nome}
Professor: ${relatorio.professor_nome}
Última Chamada: ${dataFormatada}
Total de Alunos: ${relatorio.total_alunos}

RESUMO DE ALERTAS
${'-'.repeat(50)}
Faltou Última Aula: ${relatorio.alertas.faltou_ultima}
2 Faltas Seguidas: ${relatorio.alertas.faltou_2_seguidas}
3+ Faltas Seguidas: ${relatorio.alertas.faltou_3_mais_seguidas}
Faltas Intercaladas: ${relatorio.alertas.faltas_intercaladas}

${relatorio.alunos_detalhados.length > 0 ? `
ALUNOS QUE REQUEREM ATENÇÃO
${'-'.repeat(50)}
${relatorio.alunos_detalhados
  .sort((a, b) => b.faltas_consecutivas - a.faltas_consecutivas)
  .map((aluno, index) => `
${index + 1}. ${aluno.aluno_nome}${aluno.faltas_consecutivas >= 3 ? ' [URGENTE]' : ''}
   Total de Faltas: ${aluno.total_faltas}
   Faltas Consecutivas: ${aluno.faltas_consecutivas}
   Email: ${aluno.aluno_email}${aluno.aluno_telefone ? `\n   Telefone: ${aluno.aluno_telefone}` : ''}${aluno.observacao ? `\n   Observação: ${aluno.observacao}` : ''}
`).join('\n')}
` : 'Nenhum aluno requer atenção especial no momento.'}

${'-'.repeat(50)}
Sistema de Acompanhamento Acadêmico
${new Date().toLocaleDateString('pt-BR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
  `;

  return { html, text };
}

/**
 * Formata relatório consolidado em HTML
 */
export function formatarEmailHTMLConsolidado(relatorio: RelatorioConsolidado): { html: string; text: string } {
  const dataFormatada = new Date(relatorio.data_geracao).toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      padding: 20px;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: #1f2937;
      color: #ffffff;
      padding: 32px 40px;
      border-bottom: 3px solid #3b82f6;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .header .subtitle {
      font-size: 14px;
      color: #9ca3af;
      font-weight: 400;
    }
    .content {
      padding: 40px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .summary-item {
      text-align: center;
      padding: 20px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .summary-item .value {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
      line-height: 1;
    }
    .summary-item .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .alerts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .alert-item {
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      border-left: 4px solid;
    }
    .alert-item.info {
      border-left-color: #3b82f6;
    }
    .alert-item.warning {
      border-left-color: #f59e0b;
    }
    .alert-item.danger {
      border-left-color: #ef4444;
    }
    .alert-item.intercaladas {
      border-left-color: #8b5cf6;
    }
    .alert-item .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .alert-item .value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
    }
    .turmas-list {
      margin-top: 16px;
    }
    .turma-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .turma-item:last-child {
      margin-bottom: 0;
    }
    .turma-item .nome {
      font-weight: 600;
      color: #1f2937;
      font-size: 15px;
    }
    .turma-item .badge {
      background: #fee2e2;
      color: #991b1b;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .actions {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid #f59e0b;
      border-radius: 6px;
      padding: 20px;
      margin-top: 32px;
    }
    .actions-title {
      font-size: 14px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .actions-list {
      list-style: none;
    }
    .actions-list li {
      font-size: 14px;
      color: #78350f;
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    .actions-list li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #f59e0b;
      font-weight: bold;
    }
    .actions-list li:last-child {
      margin-bottom: 0;
    }
    .footer {
      background: #f9fafb;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .footer-date {
      font-size: 12px;
      color: #9ca3af;
    }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .empty-state-text {
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .summary {
        grid-template-columns: 1fr;
      }
      .alerts-grid {
        grid-template-columns: 1fr;
      }
      .content {
        padding: 24px;
      }
      .header {
        padding: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Relatório de Acompanhamento</h1>
      <div class="subtitle">Visão consolidada das turmas</div>
    </div>
    
    <div class="content">
      <div class="summary">
        <div class="summary-item">
          <div class="value">${relatorio.total_turmas}</div>
          <div class="label">Turmas</div>
        </div>
        <div class="summary-item">
          <div class="value">${relatorio.total_alunos}</div>
          <div class="label">Alunos</div>
        </div>
        <div class="summary-item">
          <div class="value">${relatorio.total_alertas}</div>
          <div class="label">Alertas</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Situação por Categoria</div>
        <div class="alerts-grid">
          <div class="alert-item info">
            <div class="label">Faltou Última Aula</div>
            <div class="value">${relatorio.metricas_por_categoria.faltou_ultima}</div>
          </div>
          <div class="alert-item warning">
            <div class="label">2 Faltas Seguidas</div>
            <div class="value">${relatorio.metricas_por_categoria.faltou_2_seguidas}</div>
          </div>
          <div class="alert-item danger">
            <div class="label">3+ Faltas Seguidas</div>
            <div class="value">${relatorio.metricas_por_categoria.faltou_3_mais_seguidas}</div>
          </div>
          <div class="alert-item intercaladas">
            <div class="label">Faltas Intercaladas</div>
            <div class="value">${relatorio.metricas_por_categoria.faltas_intercaladas}</div>
          </div>
        </div>
      </div>

      ${relatorio.turmas_criticas.length > 0 ? `
      <div class="section">
        <div class="section-title">Turmas que Requerem Atenção</div>
        <div class="turmas-list">
          ${relatorio.turmas_criticas.map((turma, index) => `
            <div class="turma-item">
              <div class="nome">${index + 1}. ${turma.turma_nome}</div>
              <div class="badge">${turma.total_alertas} alerta${turma.total_alertas !== 1 ? 's' : ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : `
      <div class="section">
        <div class="empty-state">
          <div class="empty-state-icon">✓</div>
          <div class="empty-state-text">Nenhuma turma requer atenção especial no momento.</div>
        </div>
      </div>
      `}

      <div class="actions">
        <div class="actions-title">Ações Recomendadas</div>
        <ul class="actions-list">
          ${relatorio.sugestoes_acao.map(sugestao => `<li>${sugestao.replace(/[🚨⚠️📊✅]/g, '').trim()}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">Sistema de Acompanhamento Acadêmico</div>
      <div class="footer-date">${dataFormatada}</div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
RELATÓRIO DE ACOMPANHAMENTO
${'='.repeat(50)}
Visão consolidada das turmas

ESTATÍSTICAS GERAIS
${'-'.repeat(50)}
Turmas: ${relatorio.total_turmas}
Alunos: ${relatorio.total_alunos}
Alertas: ${relatorio.total_alertas}

SITUAÇÃO POR CATEGORIA
${'-'.repeat(50)}
Faltou Última Aula: ${relatorio.metricas_por_categoria.faltou_ultima}
2 Faltas Seguidas: ${relatorio.metricas_por_categoria.faltou_2_seguidas}
3+ Faltas Seguidas: ${relatorio.metricas_por_categoria.faltou_3_mais_seguidas}
Faltas Intercaladas: ${relatorio.metricas_por_categoria.faltas_intercaladas}

${relatorio.turmas_criticas.length > 0 ? `
TURMAS QUE REQUEREM ATENÇÃO
${'-'.repeat(50)}
${relatorio.turmas_criticas.map((turma, i) => `${i + 1}. ${turma.turma_nome} - ${turma.total_alertas} alerta${turma.total_alertas !== 1 ? 's' : ''}`).join('\n')}
` : 'Nenhuma turma requer atenção especial no momento.'}

AÇÕES RECOMENDADAS
${'-'.repeat(50)}
${relatorio.sugestoes_acao.map((s, i) => `${i + 1}. ${s.replace(/[🚨⚠️📊✅]/g, '').trim()}`).join('\n')}

${'-'.repeat(50)}
Sistema de Acompanhamento Acadêmico
${dataFormatada}
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

