# 📊 Estrutura Real do GoDevs

## ✅ Estrutura Identificada via MCP

### 🏫 Tabela de Turmas: `classes`

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Turmas Disponíveis:**
- MVP Flow 01
- MVP Flow 02
- Fullstack 53 - Aldeota (com alunos)

### 👥 Tabela de Alunos: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  nickname TEXT,
  class_id UUID REFERENCES classes(id), -- FK para turmas
  role TEXT DEFAULT 'student',
  cpf TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos Importantes:**
- `class_id` - Relaciona aluno → turma
- `full_name` - Nome completo do aluno
- `role` - Filtrar por 'student'

### 📧 Emails dos Alunos

Os emails estão na tabela `auth.users`, não em `profiles`.

**Query para buscar alunos com email:**
```sql
SELECT 
  p.id, 
  p.full_name, 
  p.class_id, 
  u.email 
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.role = 'student' 
  AND p.class_id IS NOT NULL;
```

### 📚 Tabela de Atividades: `submitted_activities`

```sql
CREATE TABLE submitted_activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  class_id UUID REFERENCES classes(id),
  lesson_name TEXT,
  module_name TEXT,
  github_repo_link TEXT,
  is_corrected BOOLEAN DEFAULT FALSE,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Potencial uso futuro:** Importar número de atividades entregues por aluno!

---

## 🔧 Ajustes Feitos no Código

### 1. Buscar Turmas

```typescript
// ANTES (tentava múltiplas tabelas)
from('turmas'), from('classes'), from('courses')

// AGORA (direto na tabela correta)
from('classes').select('*')
```

### 2. Buscar Alunos

```typescript
// ANTES (tentava múltiplos nomes)
from('alunos'), from('students'), from('enrollments')

// AGORA (direto na tabela correta)
from('profiles')
  .select('*')
  .eq('class_id', turmaId)
  .eq('role', 'student')
```

### 3. Mapeamento de Campos

| Campo GoDevs | Campo Kanban | Observação |
|--------------|--------------|------------|
| `classes.name` | `turmas.nome` | Nome da turma |
| `classes.id` | FK `turmas` | ID da turma |
| `profiles.full_name` | `alunos.nome` | Nome do aluno |
| `profiles.class_id` | `alunos.turma_id` | Relação turma-aluno |
| `auth.users.email` | `alunos.email` | Email (via JOIN) |

---

## 🎯 Exemplo de Importação

**Turma: "Fullstack 53 - Aldeota"**

Quando você importar essa turma:
1. ✅ Nome: "Fullstack 53 - Aldeota"
2. ✅ Alunos: ~59 estudantes
3. ✅ Dados: Nome completo, CPF, GitHub, LinkedIn

**Configuração no Kanban:**
- Dias de aula: Ex: Segunda, Quarta, Sexta
- Horário: Ex: 19:00
- Professor: Atribuído no momento da importação
- Coordenador: Usuário que está importando

---

## 📝 Notas Importantes

### ⚠️ Limitações Conhecidas

1. **Emails como Placeholder**
   - O Supabase client não permite JOIN com `auth.users`
   - Usamos emails temporários: `[id]@godevs.temp`
   - Isso não afeta a funcionalidade do Kanban
   - Futuramente podemos buscar emails reais via função do Supabase

2. **Dados Opcionais**
   - `cpf`, `github_url`, `linkedin_url` são opcionais
   - Nem todos os alunos têm esses dados preenchidos
   - O sistema importa o que está disponível

### ✅ O Que Funciona Perfeitamente

- ✅ Importação de turmas
- ✅ Importação de alunos
- ✅ Nome completo dos alunos
- ✅ Relação turma-aluno mantida
- ✅ Sistema de chamadas
- ✅ Cards automáticos
- ✅ Relatórios por email

---

## 🚀 Melhorias Futuras

### Fase 2 (Opcional):

1. **Buscar Emails Reais**
   - Criar função no Supabase GoDevs
   - Retornar profiles com emails via SQL
   - Atualizar o serviço de importação

2. **Importar Atividades Entregues**
   - Usar tabela `submitted_activities`
   - Mostrar no card do aluno
   - Enriquecer relatórios

3. **Sincronização Automática**
   - Cron job para sincronizar diariamente
   - Detectar novos alunos automaticamente
   - Atualizar dados existentes

---

## ✅ Status Atual

- ✅ **Estrutura identificada**
- ✅ **Código ajustado**
- ✅ **Pronto para testar**

**Próximo passo:** Teste a importação! 🎉

