import { useState } from 'react';
import { useTurmas } from '@/hooks/useTurmas';
import { useProfile } from '@/hooks/useProfile';
import { useImportGoDevs } from '@/hooks/useImportGoDevs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImportGoDevsModal } from '@/components/ImportGoDevsModal';
import { Plus, Edit, Trash2, Users, Calendar, Clock, Loader2, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { Turma } from '@/types';

export function GerenciarTurmas() {
  const { turmas, loading, addTurma, updateTurma, deleteTurma, refetch } = useTurmas();
  const { profile, loading: profileLoading, isCoordenador } = useProfile();
  const { disponivel: goDevsDisponivel, sincronizarTurma } = useImportGoDevs();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [sincronizando, setSincronizando] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    horario: '',
    dias_aula: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const diasDaSemana = [
    { value: 'segunda', label: 'Segunda' },
    { value: 'terca', label: 'Terça' },
    { value: 'quarta', label: 'Quarta' },
    { value: 'quinta', label: 'Quinta' },
    { value: 'sexta', label: 'Sexta' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
  ];

  const handleOpenDialog = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setFormData({
        nome: turma.nome,
        horario: turma.horario,
        dias_aula: turma.dias_aula,
      });
    } else {
      setEditingTurma(null);
      setFormData({
        nome: '',
        horario: '',
        dias_aula: [],
      });
    }
    setDialogOpen(true);
  };

  const handleToggleDia = (dia: string) => {
    setFormData(prev => ({
      ...prev,
      dias_aula: prev.dias_aula.includes(dia)
        ? prev.dias_aula.filter(d => d !== dia)
        : [...prev.dias_aula, dia],
    }));
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.horario || formData.dias_aula.length === 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      if (editingTurma) {
        await updateTurma(editingTurma.id, formData);
      } else {
        await addTurma({
          ...formData,
          coordenador_id: null,
          professor_id: null,
          ativa: true,
        } as any);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      alert('Erro ao salvar turma');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja inativar esta turma?')) return;

    try {
      await deleteTurma(id);
    } catch (error) {
      console.error('Erro ao deletar turma:', error);
      alert('Erro ao inativar turma');
    }
  };

  const handleSincronizar = async (turmaId: string, turmaNome: string) => {
    if (!confirm(`Sincronizar alunos da turma "${turmaNome}" com o GoDevs?`)) return;

    try {
      setSincronizando(turmaId);
      const resultado = await sincronizarTurma(turmaId, turmaNome);
      
      alert(
        `Sincronização concluída!\n\n` +
        `✅ ${resultado.atualizados} aluno(s) atualizado(s)\n` +
        `➕ ${resultado.novos} aluno(s) novo(s)`
      );
      
      await refetch();
    } catch (error: any) {
      console.error('Erro ao sincronizar:', error);
      alert(`Erro ao sincronizar: ${error.message}`);
    } finally {
      setSincronizando(null);
    }
  };

  const handleImportSuccess = async () => {
    await refetch();
  };

  // Verificar se está carregando o perfil
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar permissão - se não for coordenador, mostrar mensagem
  if (profile && !isCoordenador()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Acesso Negado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Apenas coordenadores podem acessar o gerenciamento de turmas.
            </p>
            <Button 
              className="w-full mt-4" 
              onClick={() => window.location.href = '/'}
            >
              Voltar para o Acompanhamento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando turmas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Turmas</h1>
          <p className="text-muted-foreground">
            Configure e gerencie as turmas da escola
            {goDevsDisponivel && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ✓ GoDevs Conectado
              </span>
            )}
          </p>
        </div>
        
        {isCoordenador() && (
          <div className="flex gap-2">
            {goDevsDisponivel && (
              <Button variant="outline" onClick={() => setImportModalOpen(true)}>
                <Database className="h-4 w-4 mr-2" />
                Importar do GoDevs
              </Button>
            )}
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </div>
        )}
      </div>

      {turmas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma turma cadastrada</h3>
              <p className="text-gray-600 mb-4">
                Comece criando sua primeira turma
              </p>
              {isCoordenador() && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Turma
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <Card key={turma.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{turma.nome}</span>
                  {isCoordenador() && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(turma)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(turma.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{turma.horario}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {turma.dias_aula.map((dia) => (
                        <span
                          key={dia}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {dia}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Professor:</strong> {turma.professor_nome}
                    </p>
                  </div>
                  
                  {goDevsDisponivel && isCoordenador() && (
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleSincronizar(turma.id, turma.nome)}
                        disabled={sincronizando === turma.id}
                      >
                        {sincronizando === turma.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Sincronizando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Sincronizar com GoDevs
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal de Importação GoDevs */}
      <ImportGoDevsModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={handleImportSuccess}
      />

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTurma ? 'Editar Turma' : 'Nova Turma'}
            </DialogTitle>
            <DialogDescription>
              {editingTurma
                ? 'Atualize as informações da turma'
                : 'Crie uma nova turma para a escola'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Turma *</Label>
              <Input
                id="nome"
                placeholder="Ex: Python Avançado - Turma A"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">Horário *</Label>
              <Input
                id="horario"
                type="time"
                value={formData.horario}
                onChange={(e) =>
                  setFormData({ ...formData, horario: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Dias de Aula *</Label>
              <div className="flex flex-wrap gap-2">
                {diasDaSemana.map((dia) => (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => handleToggleDia(dia.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      formData.dias_aula.includes(dia.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

