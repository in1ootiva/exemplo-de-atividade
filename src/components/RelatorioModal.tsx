import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEmailQuota } from '@/hooks/useEmailQuota';
import { Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface RelatorioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: 'turma' | 'consolidado';
  turmaId?: string;
  turmaNome?: string;
  onEnviar: (destinatarios: string[], from: string) => Promise<void>;
}

export function RelatorioModal({
  open,
  onOpenChange,
  tipo,
  turmaId,
  turmaNome,
  onEnviar,
}: RelatorioModalProps) {
  const [destinatarios, setDestinatarios] = useState('');
  const [from, setFrom] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { getQuotaStatus, canSendEmail } = useEmailQuota();

  const quotaStatus = getQuotaStatus();

  const handleEnviar = async () => {
    setError('');
    setSuccess(false);

    // Validar campos
    if (!destinatarios || destinatarios.trim() === '') {
      setError('Digite pelo menos um destinatário');
      return;
    }

    if (!from || from.trim() === '') {
      setError('Digite o email do remetente');
      return;
    }

    // Validar formato de emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const listaDestinatarios = destinatarios
      .split(',')
      .map(e => e.trim())
      .filter(e => e !== '');

    const emailsInvalidos = listaDestinatarios.filter(email => !emailRegex.test(email));
    if (emailsInvalidos.length > 0) {
      setError(`Emails inválidos: ${emailsInvalidos.join(', ')}`);
      return;
    }

    if (!emailRegex.test(from.trim())) {
      setError('Email do remetente inválido');
      return;
    }

    // Verificar quota
    const numDestinatarios = listaDestinatarios.length;
    if (!canSendEmail(numDestinatarios)) {
      setError(`Quota insuficiente. Necessário: ${numDestinatarios}, Disponível: ${quotaStatus.current}`);
      return;
    }

    // Enviar
    setSending(true);
    try {
      await onEnviar(listaDestinatarios, from.trim());
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setDestinatarios('');
        setFrom('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar relatório');
    } finally {
      setSending(false);
    }
  };

  const getTitulo = () => {
    if (tipo === 'turma') {
      return `Enviar Relatório - ${turmaNome || 'Turma'}`;
    }
    return 'Enviar Relatório Consolidado';
  };

  const getDescricao = () => {
    if (tipo === 'turma') {
      return 'Envie o relatório de frequência desta turma por email';
    }
    return 'Envie o relatório consolidado de todas as turmas por email';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            {getTitulo()}
          </DialogTitle>
          <DialogDescription>{getDescricao()}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Relatório Enviado!
            </h3>
            <p className="text-sm text-gray-600">
              O relatório foi enviado com sucesso para os destinatários.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Quota Warning */}
              {quotaStatus.status !== 'safe' && (
                <div className={`p-3 rounded-md border ${
                  quotaStatus.status === 'limit' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`h-5 w-5 mt-0.5 ${
                      quotaStatus.status === 'limit' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {quotaStatus.status === 'limit' 
                          ? 'Limite de emails atingido!' 
                          : 'Atenção: Quota baixa'}
                      </p>
                      <p className="text-xs mt-1">
                        Emails disponíveis hoje: {quotaStatus.limit - quotaStatus.current}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* From */}
              <div className="space-y-2">
                <Label htmlFor="from">
                  De (Remetente) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="from"
                  type="email"
                  placeholder="seu-email@dominio.com"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Use um email de domínio verificado no Resend
                </p>
              </div>

              {/* Destinatários */}
              <div className="space-y-2">
                <Label htmlFor="destinatarios">
                  Para (Destinatários) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="destinatarios"
                  type="text"
                  placeholder="email1@exemplo.com, email2@exemplo.com"
                  value={destinatarios}
                  onChange={(e) => setDestinatarios(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Separe múltiplos emails com vírgula
                </p>
              </div>

              {/* Preview Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>O relatório incluirá:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  {tipo === 'turma' ? (
                    <>
                      <li>Estatísticas de frequência da turma</li>
                      <li>Lista de alunos com alertas</li>
                      <li>Detalhes de contatos dos alunos</li>
                    </>
                  ) : (
                    <>
                      <li>Visão geral de todas as turmas</li>
                      <li>Distribuição de alertas</li>
                      <li>Turmas que precisam de atenção</li>
                      <li>Sugestões de ação</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEnviar}
                disabled={sending || quotaStatus.status === 'limit'}
              >
                {sending ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Relatório
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

