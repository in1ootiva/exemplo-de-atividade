import { useState, useEffect } from 'react';
import { useTurmas } from '@/hooks/useTurmas';
import { useAlunos } from '@/hooks/useAlunos';
import { useChamadas } from '@/hooks/useChamadas';
import { useAlunoCards } from '@/hooks/useAlunoCards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ClipboardList, Save, CheckCircle2, AlertCircle, History, Calendar, Users, Eye } from 'lucide-react';
import { ChamadaListItem, ChamadaCompleta } from '@/types';

export function Chamada() {
  const { turmas, loading: turmasLoading } = useTurmas();
  const { getAlunosAtivosByTurma } = useAlunos();
  const { chamadas, gerarChamada, salvarChamada, getChamadaById } = useChamadas();
  const { recalcularMultiplosCards } = useAlunoCards();
  
  const [turmaId, setTurmaId] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [chamadaGerada, setChamadaGerada] = useState(false);
  const [presencas, setPresencas] = useState<ChamadaListItem[]>([]);
  const [chamadaId, setChamadaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mostrarHistorico, setMostrarHistorico] = useState(true);
  const [chamadaSelecionada, setChamadaSelecionada] = useState<ChamadaCompleta | null>(null);
  const [visualizando, setVisualizando] = useState(false);

  useEffect(() => {
    if (turmas.length > 0 && !turmaId) {
      setTurmaId(turmas[0].id);
    }
  }, [turmas]);

  const handleGerarChamada = async () => {
    if (!turmaId || !data) {
      setError('Selecione uma turma e uma data');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const chamada = await gerarChamada(turmaId, data);
      
      if (chamada) {
        setChamadaId(chamada.id);
        
        // Buscar alunos e criar lista de presença
        const alunos = await getAlunosAtivosByTurma(turmaId);
        const listaPresencas: ChamadaListItem[] = alunos.map(aluno => ({
          aluno_id: aluno.id,
          aluno_nome: aluno.nome,
          presente: false,
          observacao: '',
        }));
        
        setPresencas(listaPresencas);
        setChamadaGerada(true);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar chamada');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePresenca = (alunoId: string) => {
    setPresencas(prev =>
      prev.map(p =>
        p.aluno_id === alunoId ? { ...p, presente: !p.presente } : p
      )
    );
  };

  const handleSalvarChamada = async () => {
    if (!chamadaId) return;

    setSaving(true);
    setError('');
    try {
      const presencasParaSalvar = presencas.map(p => ({
        aluno_id: p.aluno_id,
        presente: p.presente,
        observacao: p.observacao,
      }));

      const resultado = await salvarChamada(chamadaId, presencasParaSalvar);
      
      if (resultado) {
        // Recalcular cards dos alunos que faltaram
        if (resultado.alunosFaltaram.length > 0) {
          await recalcularMultiplosCards(resultado.alunosFaltaram, resultado.turmaId);
        }
        
        setSuccess(true);
        setTimeout(() => {
          setChamadaGerada(false);
          setPresencas([]);
          setChamadaId('');
          setSuccess(false);
          setMostrarHistorico(true);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar chamada');
    } finally {
      setSaving(false);
    }
  };

  const handleVisualizarChamada = async (chamada: ChamadaCompleta) => {
    setVisualizando(true);
    const chamadaCompleta = await getChamadaById(chamada.id);
    if (chamadaCompleta) {
      setChamadaSelecionada(chamadaCompleta);
    }
    setVisualizando(false);
  };

  const handleFecharVisualizacao = () => {
    setChamadaSelecionada(null);
  };

  const handleNovaChamada = () => {
    setMostrarHistorico(false);
    setChamadaGerada(false);
    setPresencas([]);
    setChamadaId('');
    setError('');
    setChamadaSelecionada(null);
  };

  const totalPresentes = presencas.filter(p => p.presente).length;
  const totalAusentes = presencas.length - totalPresentes;
  const percentualPresenca = presencas.length > 0
    ? Math.round((totalPresentes / presencas.length) * 100)
    : 0;

  if (turmasLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-green-600 mb-2">
                Chamada Salva!
              </h3>
              <p className="text-gray-600">
                A chamada foi registrada e os cards dos alunos foram atualizados automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar chamadas pela turma selecionada
  const chamadasFiltradas = turmaId 
    ? chamadas.filter(c => c.turma_id === turmaId)
    : chamadas;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chamada</h1>
          <p className="text-muted-foreground">
            Registre a presença dos alunos e monitore a frequência
          </p>
        </div>
        {mostrarHistorico && !chamadaSelecionada && (
          <Button onClick={handleNovaChamada}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Nova Chamada
          </Button>
        )}
      </div>

      {/* Visualização de chamada específica */}
      {chamadaSelecionada && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhes da Chamada</span>
              <Button variant="outline" onClick={handleFecharVisualizacao}>
                Voltar ao Histórico
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Turma</Label>
                  <p className="font-medium">{chamadaSelecionada.turma_nome}</p>
                </div>
                <div>
                  <Label>Data</Label>
                  <p className="font-medium">
                    {new Date(chamadaSelecionada.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label>Professor</Label>
                  <p className="font-medium">{chamadaSelecionada.professor_nome}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Lista de Presença</h3>
                <div className="space-y-2">
                  {chamadaSelecionada.presencas.map((presenca: any) => (
                    <div
                      key={presenca.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        presenca.presente
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <span className="font-medium">{presenca.aluno?.nome || 'Aluno'}</span>
                      <span className={`text-sm font-semibold ${
                        presenca.presente ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {presenca.presente ? 'PRESENTE' : 'AUSENTE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estatísticas da chamada */}
              <div className="grid gap-4 md:grid-cols-3 border-t pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {chamadaSelecionada.presencas.filter((p: any) => p.presente).length}
                      </p>
                      <p className="text-sm text-gray-600">Presentes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {chamadaSelecionada.presencas.filter((p: any) => !p.presente).length}
                      </p>
                      <p className="text-sm text-gray-600">Ausentes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(
                          (chamadaSelecionada.presencas.filter((p: any) => p.presente).length /
                            chamadaSelecionada.presencas.length) *
                            100
                        )}%
                      </p>
                      <p className="text-sm text-gray-600">Frequência</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Chamadas */}
      {mostrarHistorico && !chamadaSelecionada && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Chamadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filtro por turma */}
              <div className="space-y-2">
                <Label htmlFor="filtroTurma">Filtrar por Turma</Label>
                <select
                  id="filtroTurma"
                  value={turmaId}
                  onChange={(e) => setTurmaId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Todas as Turmas</option>
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lista de chamadas */}
              {chamadasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma chamada registrada ainda</p>
                  <Button onClick={handleNovaChamada} className="mt-4">
                    Criar Primeira Chamada
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chamadasFiltradas.map((chamada) => {
                    const totalPresentes = chamada.presencas.filter((p: any) => p.presente).length;
                    const totalAlunos = chamada.presencas.length;
                    const percentual = totalAlunos > 0 
                      ? Math.round((totalPresentes / totalAlunos) * 100) 
                      : 0;

                    return (
                      <div
                        key={chamada.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {new Date(chamada.data).toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {chamada.turma_nome}
                            </span>
                            <span className="text-green-600 font-medium">
                              {totalPresentes} presentes
                            </span>
                            <span className="text-red-600 font-medium">
                              {totalAlunos - totalPresentes} ausentes
                            </span>
                            <span className="text-blue-600 font-medium">
                              {percentual}% frequência
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVisualizarChamada(chamada)}
                          disabled={visualizando}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!chamadaGerada && !mostrarHistorico ? (
        <Card>
          <CardHeader>
            <CardTitle>Gerar Chamada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <select
                  id="turma"
                  value={turmaId}
                  onChange={(e) => setTurmaId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data da Aula</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGerarChamada}
                disabled={loading || !turmaId || !data}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Chamada...
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Gerar Chamada
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {totalPresentes}
                  </p>
                  <p className="text-sm text-gray-600">Presentes</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {totalAusentes}
                  </p>
                  <p className="text-sm text-gray-600">Ausentes</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {percentualPresenca}%
                  </p>
                  <p className="text-sm text-gray-600">Frequência</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Alunos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lista de Presença</span>
                <span className="text-sm font-normal text-gray-600">
                  {turmas.find(t => t.id === turmaId)?.nome} - {new Date(data).toLocaleDateString('pt-BR')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {presencas.map((aluno) => (
                  <div
                    key={aluno.aluno_id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                      aluno.presente
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={aluno.presente}
                        onCheckedChange={() => handleTogglePresenca(aluno.aluno_id)}
                        className="h-5 w-5"
                      />
                      <span className="font-medium">{aluno.aluno_nome}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {aluno.presente ? (
                        <span className="text-green-700">PRESENTE</span>
                      ) : (
                        <span className="text-red-700">AUSENTE</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {totalAusentes > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Atenção: {totalAusentes} aluno(s) ausente(s)
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Após salvar, os cards desses alunos serão atualizados automaticamente no quadro de acompanhamento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setChamadaGerada(false);
                    setPresencas([]);
                    setChamadaId('');
                    setError('');
                    setMostrarHistorico(true);
                  }}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSalvarChamada}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Chamada
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

