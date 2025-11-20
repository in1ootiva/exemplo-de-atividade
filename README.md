# 🎓 CRM Acadêmico - Sistema de Acompanhamento de Alunos

Sistema inteligente de acompanhamento acadêmico focado em **reduzir evasão** através do monitoramento proativo de faltas e comunicação automatizada.

## ✨ Características Principais

- 🎯 **Quadro Kanban de Acompanhamento** - Visualização intuitiva de alunos em risco
- 📋 **Sistema de Chamada com 1 Clique** - Gere chamadas instantaneamente
- 🤖 **Recálculo Automático de Cards** - Alunos são categorizados automaticamente baseado em faltas
- 🔗 **Integração GoDevs** - Importação automática de turmas e alunos (READ-ONLY)
- 🔄 **Sincronização de Dados** - Mantenha alunos atualizados com o sistema GoDevs
- 📧 **Relatórios HTML por Email** - Envio profissional via Resend MCP
- 📊 **Dashboard de Quota de Emails** - Monitore uso em tempo real (100 emails/dia)
- 🔐 **Permissões por Role** - Professores e Coordenadores com acessos diferentes
- 💾 **Dual Supabase** - Dois bancos independentes trabalhando juntos
- 📈 **Importação Inteligente** - Busca alunos de `submitted_activities` (100% precisão)

## 🚀 INÍCIO RÁPIDO

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase
```bash
# Crie .env.local com:
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_ANON_KEY=sua-chave
```

### 3. Aplicar Schema
Abra `supabase/schema.sql` e execute no SQL Editor do Supabase

### 4. Iniciar
```bash
npm run dev
```

**📖 Leia `PRIMEIROS_PASSOS.md` para tutorial completo!**

## 🎯 Como Funciona

### Fluxo de Uso:

1. **Coordenador cria turmas** (dias de aula, horário)
2. **Professor/Coordenador adiciona alunos** às turmas
3. **Professor faz chamada** (1 clique para gerar)
4. **Sistema recalcula automaticamente** baseado em faltas:
   - 1 falta → Card em "Faltou Última Aula"
   - 2 faltas seguidas → "Faltou 2 Seguidas" (amarelo)
   - 3+ faltas seguidas → "Faltou 3+ Seguidas" (vermelho, CRÍTICO)
   - 3+ faltas intercaladas → "Faltas Intercaladas"
5. **Professor arrasta card** para "Contato Realizado"
6. **Sistema exige observação** do contato feito
7. **Relatórios HTML** são enviados por email

## 📊 Colunas do Kanban

| Coluna | Cor | Descrição | Ação |
|--------|-----|-----------|------|
| **Faltou Última Aula** | 🔵 Azul | 1 falta | Acompanhar |
| **Faltou 2 Seguidas** | 🟡 Amarelo | 2 faltas consecutivas | Monitorar de perto |
| **Faltou 3+ Seguidas** | 🔴 Vermelho | 3+ faltas consecutivas | **URGENTE: Contato imediato** |
| **Faltas Intercaladas** | 🟣 Rosa | 3+ faltas não consecutivas | Investigar padrão |
| **Contato Realizado** | 🟢 Verde | Aluno contatado | Observação registrada |

## 🔗 Integração com GoDevs

### 💡 Importação Automática

O sistema pode se conectar a outro projeto Supabase (GoDevs) para:

✅ **Importar turmas existentes** com todos os alunos
✅ **Sincronizar dados** (nome, email, etc.)
✅ **Modo READ-ONLY** - Nunca modifica o banco original
✅ **Detecção automática** de estrutura de tabelas
✅ **Criação manual mantida** - Use ambos os métodos

### 📖 Documentação GoDevs

- **`CONFIGURACAO_GODEVS.md`** - Como configurar
- **`INTEGRACAO_GODEVS_COMPLETA.md`** - Guia completo
- **`TESTE_AGORA.md`** - Teste rápido
- **`RESUMO_IMPLEMENTACAO.md`** - Visão técnica

### 🚀 Como Usar

1. Adicione credenciais GoDevs no `.env.local`
2. Vá em "Gerenciar Turmas"
3. Clique em "Importar do GoDevs"
4. Selecione turma → Alunos importados automaticamente! 🎉

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui
- **@dnd-kit** (Drag and Drop)
- **React Router** (Navegação)
- **Vite** (Build)

### Backend
- **Supabase** (PostgreSQL + Auth + RLS)
- **Row Level Security** (Permissões por role)
- **Real-time subscriptions**

### Email
- **Resend MCP** (Envio de emails)
- **Templates HTML** profissionais
- **Sistema de quota** (100/dia)

## 📁 Estrutura do Projeto

```
kanban/
├── supabase/
│   └── schema.sql              # Schema completo do banco
├── src/
│   ├── pages/
│   │   ├── GerenciarTurmas.tsx    # CRUD turmas
│   │   ├── GerenciarAlunos.tsx    # CRUD alunos
│   │   └── Chamada.tsx            # Sistema de chamada
│   ├── components/
│   │   ├── KanbanBoard.tsx        # Quadro principal
│   │   ├── StudentCard.tsx        # Card de aluno
│   │   ├── ObservacaoModal.tsx    # Modal obrigatório
│   │   └── EmailQuotaDashboard.tsx # Dashboard de emails
│   ├── hooks/
│   │   ├── useTurmas.ts           # Gestão de turmas
│   │   ├── useAlunos.ts           # Gestão de alunos
│   │   ├── useChamadas.ts         # Gestão de chamadas
│   │   ├── useAlunoCards.ts       # Gestão de cards
│   │   └── useEmailQuota.ts       # Gestão de quota
│   ├── services/
│   │   ├── cardCalculator.ts      # Lógica de recálculo
│   │   ├── emailService.ts        # Envio de emails
│   │   └── reportService.ts       # Geração de relatórios
│   └── types/
│       └── index.ts               # Tipos TypeScript
├── PRIMEIROS_PASSOS.md         # Tutorial de 15 minutos
├── GUIA_COMPLETO_IMPLEMENTACAO.md  # Documentação completa
└── MCP_RESEND_CONFIG.md        # Config do Resend
```

## 🔐 Permissões

### Professor
- ✅ Ver apenas suas turmas
- ✅ Gerenciar alunos de suas turmas
- ✅ Fazer chamadas
- ✅ Ver cards de suas turmas
- ✅ Enviar relatórios individuais

### Coordenador
- ✅ **TUDO que o professor pode**
- ✅ Criar/Editar/Deletar turmas
- ✅ Ver TODAS as turmas e alunos
- ✅ Ver TODOS os cards
- ✅ Enviar relatórios consolidados
- ✅ Ver logs de email de todos

## 📧 Sistema de Emails

### Quota Inteligente
- 📊 Dashboard visual de uso
- ⚠️ Alertas em 80%, 90%, 95%
- 🔄 Reset automático diário
- 📋 Fila de prioridade (emails manuais primeiro)
- 📝 Logs completos de envios

### Relatórios
- **Individual por Turma**: Estatísticas + lista de alunos em risco
- **Consolidado**: Visão geral de todas as turmas
- **Templates HTML** profissionais e responsivos

## 🎯 Casos de Uso

### Para Escolas de Programação/Marketing/Design
- 🎓 Acompanhe turmas de diferentes cursos
- 📉 Reduza evasão identificando alunos em risco
- 📧 Profissionalize comunicação com relatórios
- ⏱️ Economize tempo com automações

### Métricas de Impacto
- ✅ Identifica alunos em risco **antes** de desistirem
- ✅ Reduz trabalho manual de acompanhamento
- ✅ Aumenta taxa de retenção
- ✅ Melhora experiência do aluno

## 📚 Documentação

- 📖 **PRIMEIROS_PASSOS.md** - Tutorial de 15 minutos
- 📖 **GUIA_COMPLETO_IMPLEMENTACAO.md** - Documentação técnica completa
- 📖 **MCP_RESEND_CONFIG.md** - Configuração do Resend
- 📖 **supabase/README.md** - Instruções do banco de dados

## 🧪 Testado e Funcional

✅ **17/17 tarefas completadas**
- ✅ Schema do Supabase
- ✅ Tipos TypeScript
- ✅ Todos os Hooks
- ✅ Serviços (Calculator, Email, Report)
- ✅ Páginas (Turmas, Alunos, Chamada)
- ✅ Kanban refatorado
- ✅ Sistema de navegação
- ✅ Componentes de email
- ✅ Sistema de quota

## 🚀 Próximas Melhorias

- [ ] Dashboard de métricas com gráficos
- [ ] Exportação para Excel/PDF
- [ ] Notificações push em tempo real
- [ ] Integração WhatsApp
- [ ] App mobile (React Native/PWA)

## 📄 Licença

MIT

---

**Desenvolvido para escolas que querem reduzir evasão através de acompanhamento proativo! 🎓**

