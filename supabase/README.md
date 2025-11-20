# Schema do Supabase - CRM Acadêmico

## Como Aplicar o Schema

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor** no menu lateral
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `schema.sql`
5. Cole no editor e clique em **Run**

### Opção 2: Via Supabase CLI

```bash
# Se ainda não tiver o CLI instalado
npm install -g supabase

# Login
supabase login

# Link com seu projeto
supabase link --project-ref seu-project-ref

# Executar o schema
supabase db push
```

## Estrutura das Tabelas

### Tabelas Principais

1. **profiles** - Perfis de usuários (coordenador/professor)
2. **turmas** - Turmas da escola
3. **alunos** - Alunos matriculados
4. **chamadas** - Registro de chamadas realizadas
5. **chamadas_alunos** - Presenças/faltas individuais
6. **aluno_cards** - Cards do Kanban de acompanhamento
7. **email_logs** - Histórico de emails enviados
8. **email_quota** - Controle de quota diária de emails
9. **email_config** - Configurações de email por usuário

### Relacionamentos

```
profiles (auth.users)
    ↓
turmas (professor_id, coordenador_id)
    ↓
alunos (turma_id)
    ↓
chamadas (turma_id, professor_id)
    ↓
chamadas_alunos (chamada_id, aluno_id)
    ↓
aluno_cards (aluno_id, turma_id)
```

## Segurança (RLS)

### Professores
- Veem apenas suas turmas
- Podem criar e gerenciar chamadas de suas turmas
- Podem gerenciar alunos de suas turmas
- Veem cards de suas turmas

### Coordenadores
- Veem todas as turmas
- Podem criar/editar/deletar turmas
- Podem gerenciar todos os alunos
- Veem todos os cards
- Veem todos os logs de email

## Functions Úteis

### `handle_new_user()`
Cria automaticamente um profile quando um novo usuário se cadastra.

### `reset_email_quota_if_needed()`
Reseta a quota de emails quando um novo dia começa.

### `get_aluno_faltas_historico(aluno_id, dias_limite)`
Retorna o histórico de faltas de um aluno nos últimos X dias.

## Próximos Passos

Após aplicar o schema:

1. Configure as variáveis de ambiente no arquivo `.env.local`:
```env
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

2. Crie o primeiro usuário coordenador:
```sql
-- No SQL Editor do Supabase
UPDATE public.profiles
SET role = 'coordenador'
WHERE id = 'seu-user-id';
```

3. Teste a conexão no frontend

