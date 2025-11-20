import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface ObservacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoNome: string;
  onSave: (observacao: string) => Promise<void>;
}

export function ObservacaoModal({
  open,
  onOpenChange,
  alunoNome,
  onSave,
}: ObservacaoModalProps) {
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    
    if (!observacao || observacao.trim() === '') {
      setError('A observação é obrigatória');
      return;
    }

    if (observacao.trim().length < 10) {
      setError('A observação deve ter pelo menos 10 caracteres');
      return;
    }

    setSaving(true);
    try {
      await onSave(observacao.trim());
      setObservacao('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar observação');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setObservacao('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Registrar Contato com Aluno
          </DialogTitle>
          <DialogDescription>
            Documente o motivo das faltas e as ações tomadas com{' '}
            <strong>{alunoNome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="observacao">
              Observação sobre o contato <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="observacao"
              placeholder="Ex: Aluno relatou problemas de saúde. Justificativa aceita. Acompanhar próximas aulas..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Mínimo de 10 caracteres. Seja específico sobre o motivo das faltas e as ações combinadas.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Registre informações como motivo da ausência,
              comprometimento do aluno, prazo para recuperação, e próximos passos.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar e Mover Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

