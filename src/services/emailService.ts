import { supabase } from '@/lib/supabase';
import { EmailTipo, EmailPrioridade } from '@/types';

/**
 * Interface para envio de email
 */
interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
  from: string;
}

/**
 * Registra log de email no banco
 */
async function logEmail(
  destinatario: string,
  assunto: string,
  tipo: EmailTipo,
  template: string,
  prioridade: EmailPrioridade,
  userId: string,
  status: 'enviado' | 'erro' | 'pendente',
  errorMessage?: string
) {
  try {
    await supabase.from('email_logs').insert([{
      destinatario,
      assunto,
      tipo,
      template,
      status,
      prioridade,
      enviado_por: userId,
      erro_mensagem: errorMessage,
    }]);
  } catch (error) {
    console.error('Erro ao registrar log de email:', error);
  }
}

/**
 * NOTA: A função de envio via Resend MCP deve ser chamada via cursor/agent
 * Esta é uma função placeholder que simula o envio.
 * 
 * Na implementação real, você usará o MCP do Resend chamando a função
 * mcp_resend_send-email com os parâmetros apropriados.
 */
export async function enviarEmail(
  emailData: EmailData,
  tipo: EmailTipo,
  template: string,
  userId: string,
  prioridade: EmailPrioridade = 'normal'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Log inicial como pendente
    await logEmail(
      emailData.to,
      emailData.subject,
      tipo,
      template,
      prioridade,
      userId,
      'pendente'
    );

    // Chamar Edge Function do Supabase para enviar email via Resend
    const { data: functionData, error: functionError } = await supabase.functions.invoke('send-email', {
      body: {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      },
    });

    if (functionError) {
      console.error('❌ Erro na Edge Function:', functionError);
      throw new Error(functionError.message || 'Erro ao chamar função de envio de email');
    }

    if (!functionData?.success) {
      const errorMsg = functionData?.error || 'Erro desconhecido ao enviar email';
      console.error('❌ Erro ao enviar email:', errorMsg, functionData);
      
      // Mensagem mais amigável se for problema de configuração
      if (errorMsg.includes('RESEND_API_KEY')) {
        throw new Error('RESEND_API_KEY não configurada no Supabase. Configure em Settings → Edge Functions → Secrets');
      }
      
      throw new Error(errorMsg);
    }

    console.log('📧 Email enviado com sucesso:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from,
      id: functionData.id,
    });

    // Log de sucesso
    await logEmail(
      emailData.to,
      emailData.subject,
      tipo,
      template,
      prioridade,
      userId,
      'enviado'
    );

    return { success: true };
  } catch (error: any) {
    // Log de erro
    await logEmail(
      emailData.to,
      emailData.subject,
      tipo,
      template,
      prioridade,
      userId,
      'erro',
      error.message
    );

    return {
      success: false,
      error: error.message || 'Erro ao enviar email',
    };
  }
}

/**
 * Fila de emails pendentes
 */
const filaEmails: Array<{
  emailData: EmailData;
  tipo: EmailTipo;
  template: string;
  userId: string;
  prioridade: EmailPrioridade;
}> = [];

/**
 * Adiciona email na fila para processamento posterior
 */
export function adicionarEmailFila(
  emailData: EmailData,
  tipo: EmailTipo,
  template: string,
  userId: string,
  prioridade: EmailPrioridade = 'normal'
) {
  filaEmails.push({
    emailData,
    tipo,
    template,
    userId,
    prioridade,
  });

  // Log como pendente
  logEmail(
    emailData.to,
    emailData.subject,
    tipo,
    template,
    prioridade,
    userId,
    'pendente'
  );
}

/**
 * Processa fila de emails (enviando os de alta prioridade primeiro)
 */
export async function processarFila(
  maxEmails: number
): Promise<{ enviados: number; erros: number }> {
  let enviados = 0;
  let erros = 0;

  // Ordenar por prioridade
  filaEmails.sort((a, b) => {
    if (a.prioridade === 'alta' && b.prioridade !== 'alta') return -1;
    if (a.prioridade !== 'alta' && b.prioridade === 'alta') return 1;
    return 0;
  });

  // Processar até o máximo permitido
  const emailsParaProcessar = filaEmails.splice(0, maxEmails);

  for (const item of emailsParaProcessar) {
    const resultado = await enviarEmail(
      item.emailData,
      item.tipo,
      item.template,
      item.userId,
      item.prioridade
    );

    if (resultado.success) {
      enviados++;
    } else {
      erros++;
    }
  }

  return { enviados, erros };
}

/**
 * Retorna número de emails na fila
 */
export function getTamanhoFila(): number {
  return filaEmails.length;
}

/**
 * Limpa a fila
 */
export function limparFila() {
  filaEmails.length = 0;
}

/**
 * Verifica quota antes de enviar
 */
export async function verificarQuota(): Promise<{
  canSend: boolean;
  remaining: number;
  message: string;
}> {
  try {
    const { data: quota } = await supabase
      .from('email_quota')
      .select('*')
      .single();

    if (!quota) {
      return {
        canSend: false,
        remaining: 0,
        message: 'Erro ao verificar quota',
      };
    }

    // Verificar se precisa resetar
    const hoje = new Date().toISOString().split('T')[0];
    const lastReset = quota.last_reset.split('T')[0];

    let currentCount = quota.daily_count;
    if (lastReset < hoje) {
      // Resetar quota
      await supabase
        .from('email_quota')
        .update({
          daily_count: 0,
          last_reset: hoje,
        })
        .eq('id', quota.id);
      
      currentCount = 0;
    }

    const remaining = quota.daily_limit - currentCount;
    const canSend = remaining > 0;

    let message = '';
    if (!canSend) {
      message = 'Limite diário de emails atingido';
    } else if (remaining <= 5) {
      message = `Atenção: apenas ${remaining} emails restantes`;
    } else {
      message = `${remaining} emails disponíveis`;
    }

    return { canSend, remaining, message };
  } catch (error) {
    console.error('Erro ao verificar quota:', error);
    return {
      canSend: false,
      remaining: 0,
      message: 'Erro ao verificar quota',
    };
  }
}

/**
 * Envia email verificando quota primeiro
 */
export async function enviarEmailComQuota(
  emailData: EmailData,
  tipo: EmailTipo,
  template: string,
  userId: string,
  prioridade: EmailPrioridade = 'normal'
): Promise<{ success: boolean; error?: string; queued?: boolean }> {
  // Verificar quota
  const quotaStatus = await verificarQuota();

  if (!quotaStatus.canSend) {
    // Se for prioridade alta, adicionar na fila
    if (prioridade === 'alta') {
      adicionarEmailFila(emailData, tipo, template, userId, prioridade);
      return {
        success: false,
        error: 'Limite atingido. Email adicionado à fila com prioridade alta.',
        queued: true,
      };
    } else {
      // Se for prioridade normal, apenas adicionar na fila
      adicionarEmailFila(emailData, tipo, template, userId, prioridade);
      return {
        success: false,
        error: 'Limite atingido. Email adicionado à fila.',
        queued: true,
      };
    }
  }

  // Enviar o email
  const resultado = await enviarEmail(emailData, tipo, template, userId, prioridade);

  // Se enviou com sucesso, incrementar contador
  if (resultado.success) {
    await supabase.rpc('increment_email_count');
  }

  return resultado;
}

/**
 * Retorna logs de emails enviados
 */
export async function getEmailLogs(
  userId: string,
  limit: number = 50
) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('enviado_por', userId)
      .order('enviado_em', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar logs de email:', error);
    return [];
  }
}

/**
 * Retorna estatísticas de envio
 */
export async function getEmailStats(userId: string) {
  try {
    const { data: logs } = await supabase
      .from('email_logs')
      .select('status, tipo')
      .eq('enviado_por', userId);

    if (!logs) return null;

    return {
      total: logs.length,
      enviados: logs.filter(l => l.status === 'enviado').length,
      erros: logs.filter(l => l.status === 'erro').length,
      pendentes: logs.filter(l => l.status === 'pendente').length,
      manuais: logs.filter(l => l.tipo === 'manual').length,
      automaticos: logs.filter(l => l.tipo === 'automatico').length,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de email:', error);
    return null;
  }
}

