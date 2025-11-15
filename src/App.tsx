import { KanbanBoard } from './components/KanbanBoard';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';
import { useAuth } from './hooks/useAuth';
import { useDeals } from './hooks/useDeals';

function App() {
  const { signOut, user } = useAuth();
  const { deals } = useDeals();

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">CRM Kanban</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                Gestão visual de negociações
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalDeals}</p>
                <p className="text-xs text-muted-foreground">Negociações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(totalValue)}
                </p>
                <p className="text-xs text-muted-foreground">Valor Total</p>
              </div>
              <div className="flex items-center gap-3 border-l pl-6">
                <div className="text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <KanbanBoard />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>
            🔒 Seus dados são salvos com segurança no Supabase e protegidos por autenticação.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

