# 🔗 Configuração da Integração GoDevs

Este documento descreve como configurar a integração entre o CRM Acadêmico (Kanban) e o sistema GoDevs.

## 📝 Variáveis de Ambiente

Adicione estas variáveis no seu arquivo `.env.local`:

```env
# Supabase Principal (Kanban) - Sistema de Acompanhamento Acadêmico
VITE_SUPABASE_URL=https://mkeqrqzqincrjgguuptv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZXFycXpxaW5jcmpnZ3V1cHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzYzMzYsImV4cCI6MjA3ODgxMjMzNn0.mopRATrQ3KrEJh47gN78B2UCo1JkDL5r0LgF07b3zpQ

# Supabase GoDevs (Apenas Leitura) - Importação de Turmas e Alunos
VITE_GODEVS_SUPABASE_URL=https://yolwftwrqbsamxbrzaii.supabase.co
VITE_GODEVS_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbHdmdHdycWJzYW14YnJ6YWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDgyMTEsImV4cCI6MjA3MzcyNDIxMX0.KhZEswTslb31ijCbNQWi7j4gAs7WNUq7aEey8yVdpf8
```

## 🏗️ Estrutura Esperada no GoDevs

O sistema espera encontrar as seguintes tabelas no banco GoDevs:

### Tabela: `turmas`
```sql
- id (uuid)
- nome (text)
- descricao (text)
- created_at (timestamp)
```

### Tabela: `alunos` ou `students`
```sql
- id (uuid)
- turma_id (uuid) - FK para turmas
- nome_completo ou nome (text)
- email (text)
- telefone (text, opcional)
- atividades_entregues (int, opcional)
- created_at (timestamp)
```

## ⚙️ Funcionalidades

1. **Importação de Turmas**: Importa turmas do GoDevs para o Kanban
2. **Importação Automática de Alunos**: Ao importar uma turma, todos os alunos são importados automaticamente
3. **Sincronização**: Atualiza dados dos alunos (nome, email) do GoDevs
4. **Modo READ-ONLY**: O sistema Kanban NUNCA modifica dados no GoDevs

## 🚀 Como Usar

1. Acesse "Gerenciar Turmas" como coordenador
2. Clique em "Importar do GoDevs"
3. Selecione a turma desejada
4. Configure dias de aula e horário
5. Confirme a importação

Os alunos serão importados automaticamente! 🎉

