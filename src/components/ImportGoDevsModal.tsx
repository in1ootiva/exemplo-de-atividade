import { useState, useEffect } from 'react';
import { useImportGoDevs } from '@/hooks/useImportGoDevs';
import { useProfile } from '@/hooks/useProfile';
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
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Database, Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { GoDevsTurma } from '@/types';

interface ImportGoDevsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportGoDevsModal({ open, onOpenChange, onSuccess }: ImportGoDevsModalProps) {
  const { listarTurmasGoDevs, listarAlunosGoDevs, importarTurma, loading } = useImportGoDevs();
  const { profile } = useProfile();
  
  const [step, setStep] = useState<'list' | 'config' | 'importing' | 'success'>('list');
  const [turmasGoDevs, setTurmasGoDevs] = useState<GoDevsTurma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<GoDevsTurma | null>(null);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Configuração da turma
  const [horario, setHorario] = useState('19:00');
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);

  const diasDaSemana = [
    { value: 'segunda', label: 'Segunda' },
    { value: 'terca', label: 'Terça' },
    { value: 'quarta', label: 'Quarta' },
    { value: 'quinta', label: 'Quinta' },
    { value: 'sexta', label: 'Sexta' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
  ];

  // Carregar turmas ao abrir modal
  useEffect(() => {
    if (open && step === 'list') {
      loadTurmas();
    }
  }, [open]);

  const loadTurmas = async () => {
    try {
      setLocalLoading(true);
      setError(null);
      setTurmasGoDevs([]);
      
      const turmas = await listarTurmasGoDevs();
      setTurmasGoDevs(turmas);
      
      if (turmas.length === 0) {
        setError('Nenhuma turma encontrada no GoDevs. Verifique as permissões RLS.');
      }
    } catch (err: any) {
      console.error('Erro ao buscar turmas:', err);
      setError(err.message || 'Erro ao conectar com GoDevs');
      setTurmasGoDevs([]);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSelecionarTurma = async (turma: GoDevsTurma) => {
    try {
      setError(null);
      setTurmaSelecionada(turma);
      
      // Buscar quantos alunos tem nessa turma
      const alunos = await listarAlunosGoDevs(turma.id);
      setTotalAlunos(alunos.length);
      
      setStep('config');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleDia = (dia: string) => {
    setDiasSelecionados(prev => 
      prev.includes(dia) 
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    );
  };

  const handleImportar = async () => {
    if (!turmaSelecionada || !profile) return;
    
    if (diasSelecionados.length === 0) {
      setError('Selecione pelo menos um dia de aula');
      return;
    }

    try {
      setError(null);
      setStep('importing');

      const resultado = await importarTurma(
        turmaSelecionada,
        profile.id, // coordenador
        profile.id, // professor (pode ser alterado depois)
        diasSelecionados,
        horario
      );

      console.log('✅ Importação concluída:', resultado);
      
      setStep('success');
      
      // Fechar modal após 2 segundos e recarregar lista
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setStep('config');
    }
  };

  const handleClose = () => {
    setStep('list');
    setTurmaSelecionada(null);
    setDiasSelecionados([]);
    setHorario('19:00');
    setError(null);
    setTotalAlunos(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Importar do GoDevs
          </DialogTitle>
          <DialogDescription>
            {step === 'list' && 'Selecione uma turma para importar'}
            {step === 'config' && 'Configure os dias e horário da turma'}
            {step === 'importing' && 'Importando turma e alunos...'}
            {step === 'success' && 'Importação concluída com sucesso!'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* STEP 1: Lista de turmas */}
        {step === 'list' && (
          <div className="space-y-3">
            {localLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Carregando turmas...</p>
              </div>
            ) : turmasGoDevs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma turma encontrada no GoDevs</p>
                <p className="text-xs mt-2">Verifique o console (F12) para mais detalhes</p>
              </div>
            ) : (
              turmasGoDevs.map((turma) => (
                <Card 
                  key={turma.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelecionarTurma(turma)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{turma.nome}</h3>
                        {turma.descricao && (
                          <p className="text-sm text-muted-foreground">{turma.descricao}</p>
                        )}
                      </div>
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* STEP 2: Configuração */}
        {step === 'config' && turmaSelecionada && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Database className="h-4 w-4" />
                    <span>Turma: <strong>{turmaSelecionada.nome}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{totalAlunos} aluno(s) serão importados</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div>
                <Label>Dias de Aula</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {diasDaSemana.map((dia) => (
                    <div key={dia.value} className="flex items-center gap-2">
                      <Checkbox
                        id={dia.value}
                        checked={diasSelecionados.includes(dia.value)}
                        onCheckedChange={() => handleToggleDia(dia.value)}
                      />
                      <Label htmlFor={dia.value} className="cursor-pointer">
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="horario">Horário</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="horario"
                    type="time"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Importando */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">Importando turma...</p>
            <p className="text-sm text-muted-foreground">
              Isso pode levar alguns segundos
            </p>
          </div>
        )}

        {/* STEP 4: Sucesso */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Importação concluída!</p>
            <p className="text-sm text-muted-foreground">
              Turma e alunos importados com sucesso
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'list' && (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}
          
          {step === 'config' && (
            <>
              <Button variant="outline" onClick={() => setStep('list')}>
                Voltar
              </Button>
              <Button onClick={handleImportar} disabled={loading || diasSelecionados.length === 0}>
                Importar Turma
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

