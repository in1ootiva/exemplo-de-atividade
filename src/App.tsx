import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { KanbanBoard } from './components/KanbanBoard';
import { GerenciarTurmas } from './pages/GerenciarTurmas';
import { GerenciarAlunos } from './pages/GerenciarAlunos';
import { Chamada } from './pages/Chamada';
import { EmailQuotaDashboard } from './components/EmailQuotaDashboard';
import { EmailConfigModal } from './components/EmailConfigModal';
import { RelatorioModal } from './components/RelatorioModal';
import { 
  LayoutDashboard, 
  LogOut, 
  Users, 
  GraduationCap, 
  ClipboardList, 
  Mail,
  Settings
} from 'lucide-react';
import { Button } from './components/ui/button';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useAlunoCards } from './hooks/useAlunoCards';
import { useState } from 'react';
import { enviarRelatorioTurma, enviarRelatorioConsolidado } from './services/reportService';
import { enviarEmailComQuota } from './services/emailService';

function AppContent() {
  const { signOut, user } = useAuth();
  const { profile, isCoordenador } = useProfile();
  const { cards, getEstatisticas } = useAlunoCards();
  const location = useLocation();
  const [emailConfigOpen, setEmailConfigOpen] = useState(false);
  const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);

  const stats = getEstatisticas();

  const navItems = [
    { path: '/', label: 'Acompanhamento', icon: LayoutDashboard },
    { path: '/chamada', label: 'Chamada', icon: ClipboardList },
    { path: '/alunos', label: 'Alunos', icon: GraduationCap },
    ...(isCoordenador() ? [{ path: '/turmas', label: 'Turmas', icon: Users }] : []),
  ];

  const handleEnviarRelatorio = async (destinatarios: string[], from: string) => {
    try {
      const relatorio = await enviarRelatorioConsolidado(destinatarios, user!.id, from);
      
      // Enviar para cada destinatário
      for (const destinatario of destinatarios) {
        await enviarEmailComQuota(
          {
            to: destinatario,
            from: relatorio.from,
            subject: relatorio.assunto,
            html: relatorio.html,
            text: relatorio.text,
          },
          'manual',
          'relatorio_consolidado',
          user!.id,
          'alta'
        );
      }
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 overflow-hidden">
        <div className="container mx-auto px-4 py-4 max-w-[1920px]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">CRM Acadêmico</h1>
              </div>
              
              {/* Navegação */}
              <nav className="flex gap-2">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      size="sm"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Estatísticas */}
              <div className="flex gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-red-600">{stats.criticos}</p>
                  <p className="text-xs text-muted-foreground">Críticos</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600">{stats.faltou_2_seguidas}</p>
                  <p className="text-xs text-muted-foreground">Atenção</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 border-l pl-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRelatorioModalOpen(true)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Relatório
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmailConfigOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right">
                  <div className="text-sm font-medium">{profile?.name || user?.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {profile?.role || 'professor'}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-[1920px]">
        <div className="flex gap-6">
          {/* Sidebar com Email Dashboard */}
          <aside className="w-72 flex-shrink-0 space-y-4">
            <EmailQuotaDashboard />
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0 overflow-hidden">
            <Routes>
              <Route path="/" element={<KanbanBoard />} />
              <Route path="/chamada" element={<Chamada />} />
              <Route path="/alunos" element={<GerenciarAlunos />} />
              <Route path="/turmas" element={<GerenciarTurmas />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>
            🎓 Sistema de Acompanhamento Acadêmico - Reduzindo cancelamento através de monitoramento proativo
          </p>
        </div>
      </footer>

      {/* Modals */}
      <EmailConfigModal
        open={emailConfigOpen}
        onOpenChange={setEmailConfigOpen}
      />
      <RelatorioModal
        open={relatorioModalOpen}
        onOpenChange={setRelatorioModalOpen}
        tipo="consolidado"
        onEnviar={handleEnviarRelatorio}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

