import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DealCard } from '@/types';

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (deal: Omit<DealCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  columnId: string;
  existingDeal?: DealCard;
}

export function DealDialog({ open, onOpenChange, onSave, columnId, existingDeal }: DealDialogProps) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingDeal) {
      setTitle(existingDeal.title);
      setValue(existingDeal.value?.toString() || '');
      setContactName(existingDeal.contact_name || '');
      setContactEmail(existingDeal.contact_email || '');
      setContactPhone(existingDeal.contact_phone || '');
      setNotes(existingDeal.notes || '');
    } else {
      // Reset form when opening for new deal
      setTitle('');
      setValue('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setNotes('');
    }
  }, [existingDeal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Por favor, preencha o nome da negociação.');
      return;
    }

    onSave({
      title: title.trim(),
      value: value ? parseFloat(value) : undefined,
      contact_name: contactName.trim() || undefined,
      contact_email: contactEmail.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      column_id: existingDeal?.column_id || columnId,
      order: existingDeal?.order || 0,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {existingDeal ? 'Editar Negociação' : 'Nova Negociação'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações sobre a negociação. Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Nome da Negociação <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Redesign do Site XYZ"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">Valor Estimado (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ex: 5000.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactName">Nome do Contato</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Email do Contato</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Ex: joao@empresa.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Telefone do Contato</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre a negociação..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {existingDeal ? 'Salvar Alterações' : 'Adicionar Negociação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

