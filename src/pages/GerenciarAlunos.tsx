import { useState } from 'react';
import { useAlunos } from '@/hooks/useAlunos';
import { useTurmas } from '@/hooks/useTurmas';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash2, Mail, Phone, Users, Loader2, Filter, CheckCircle } from 'lucide-react';
import { Aluno } from '@/types';

export function GerenciarAlunos() {
  const { alunos, loading, addAluno, updateAluno, deleteAluno } = useAlunos();
  const { turmas } = useTurmas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [turmaFiltro, setTurmaFiltro] = useState<string>('todas');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    turma_id: '',
  });
  const [saving, setSaving] = useState(false);

  const handleOpenDialog = (aluno?: Aluno) => {
    if (aluno) {
      setEditingAluno(aluno);
      setFormData({
        nome: aluno.nome,
        email: aluno.email,
        telefone: aluno.telefone || '',
        turma_id: aluno.turma_id,
      });
    } else {
      setEditingAluno(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        turma_id: turmas[0]?.id || '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.turma_id) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      if (editingAluno) {
        await updateAluno(editingAluno.id, formData);
      } else {
        await addAluno({
          ...formData,
          status: 'ativo',
        } as any);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      alert('Erro ao salvar aluno');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja inativar este aluno?')) return;

    try {
      await deleteAluno(id);
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      alert('Erro ao inativar aluno');
    }
  };

  const alunosFiltrados =
    turmaFiltro === 'todas'
      ? alunos
      : alunos.filter((a) => a.turma_id === turmaFiltro);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Alunos</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os alunos das turmas
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      {/* Filtro de Turmas */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {turmaFiltro === 'todas'
                ? 'Todas as Turmas'
                : turmas.find((t) => t.id === turmaFiltro)?.nome}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTurmaFiltro('todas')}>
              Todas as Turmas
            </DropdownMenuItem>
            {turmas.map((turma) => (
              <DropdownMenuItem
                key={turma.id}
                onClick={() => setTurmaFiltro(turma.id)}
              >
                {turma.nome}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-gray-600">
          {alunosFiltrados.length} aluno(s)
        </span>
      </div>

      {alunosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum aluno cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                {turmaFiltro === 'todas'
                  ? 'Comece adicionando seus primeiros alunos'
                  : 'Nenhum aluno nesta turma'}
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Aluno
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alunosFiltrados.map((aluno) => (
            <Card key={aluno.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{aluno.nome}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(aluno)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(aluno.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{aluno.email}</span>
                  </div>
                  {aluno.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{aluno.telefone}</span>
                    </div>
                  )}
                  {aluno.atividades_entregues !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-700">
                        {aluno.atividades_entregues} atividade(s) entregue(s)
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {aluno.turma_nome}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        aluno.status === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {aluno.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
            </DialogTitle>
            <DialogDescription>
              {editingAluno
                ? 'Atualize as informações do aluno'
                : 'Adicione um novo aluno à turma'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@exemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="turma">Turma *</Label>
              <select
                id="turma"
                value={formData.turma_id}
                onChange={(e) =>
                  setFormData({ ...formData, turma_id: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione uma turma</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
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

