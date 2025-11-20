import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { Mail, Plus, X, Clock, Power } from 'lucide-react';

interface EmailConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailConfigModal({ open, onOpenChange }: EmailConfigModalProps) {
  const { config, loading, toggleAutoEnvio, setHorarioEnvio, addDestinatario, removeDestinatario } = useEmailConfig();
  const [novoEmail, setNovoEmail] = useState('');
  const [horario, setHorario] = useState('18:00');
  const [error, setError] = useState('');

  useEffect(() => {
    if (config) {
      setHorario(config.horario_envio);
    }
  }, [config]);

  const handleAddEmail = async () => {
    setError('');
    
    if (!novoEmail || novoEmail.trim() === '') {
      setError('Digite um email válido');
      return;
    }

    try {
      await addDestinatario(novoEmail.trim());
      setNovoEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar email');
    }
  };

  const handleRemoveEmail = async (email: string) => {
    try {
      await removeDestinatario(email);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover email');
    }
  };

  const handleToggleAuto = async () => {
    try {
      await toggleAutoEnvio();
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar configuração');
    }
  };

  const handleSaveHorario = async () => {
    try {
      await setHorarioEnvio(horario);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar horário');
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Configurações de Email</DialogTitle>
          <DialogDescription>
            Configure o envio automático de relatórios por email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Toggle Envio Automático */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Power className={`h-5 w-5 ${config?.auto_envio_ativo ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium">Envio Automático</p>
                <p className="text-sm text-gray-600">
                  {config?.auto_envio_ativo ? 'Ativado' : 'Desativado'}
                </p>
              </div>
            </div>
            <Button
              variant={config?.auto_envio_ativo ? 'default' : 'outline'}
              onClick={handleToggleAuto}
            >
              {config?.auto_envio_ativo ? 'Desativar' : 'Ativar'}
            </Button>
          </div>

          {/* Horário de Envio */}
          <div className="space-y-2">
            <Label htmlFor="horario" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Envio Diário
            </Label>
            <div className="flex gap-2">
              <Input
                id="horario"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveHorario}>
                Salvar
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Os relatórios serão enviados automaticamente neste horário
            </p>
          </div>

          {/* Lista de Destinatários */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Destinatários dos Relatórios
            </Label>
            
            {/* Lista de emails */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {config?.emails_destinatarios.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm">{email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!config?.emails_destinatarios || config.emails_destinatarios.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum destinatário configurado
                </p>
              )}
            </div>

            {/* Adicionar novo email */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="novo@email.com"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddEmail();
                  }
                }}
              />
              <Button onClick={handleAddEmail}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

