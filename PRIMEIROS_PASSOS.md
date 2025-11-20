# 🚀 PRIMEIROS PASSOS - INICIAR O CRM ACADÊMICO

## ⚡ CHECKLIST RÁPIDO (15 minutos)

### ✅ Passo 1: Aplicar Schema no Supabase (5 min)

1. Abra [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Clique em **SQL Editor** (ícone de raio ⚡)
4. Clique em **New Query**
5. Abra o arquivo `supabase/schema.sql` deste projeto
6. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
7. Cole no SQL Editor do Supabase
8. Clique em **RUN** (ou F5)
9. ✅ Aguarde aparecer "Success. No rows returned"

**⚠️ IMPORTANTE:** Se der erro, verifique se você tem permissões de admin no projeto.

---

### ✅ Passo 2: Verificar Variáveis de Ambiente (2 min)

1. Crie o arquivo `.env.local` na raiz do projeto (se não existir)
2. Adicione:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Onde encontrar essas informações:**
- No Supabase Dashboard → **Settings** → **API**
- URL: Campo "Project URL"
- Key: Campo "anon public"

---

### ✅ Passo 3: Instalar Dependências (3 min)

```bash
npm install
```

Isso já foi feito durante a implementação, mas confirme que tudo está instalado.

---

### ✅ Passo 4: Iniciar o Projeto (1 min)

```bash
npm run dev
```

Abra: `http://localhost:5173`

---

### ✅ Passo 5: Criar Seu Usuário (2 min)

1. Na tela de login, clique em **Sign Up** (se tiver)
2. OU use o Supabase Dashboard:
   - Vá em **Authentication** → **Users**
   - Clique em **Add user**
   - Adicione email e senha
   - Marque "Auto Confirm User"
   - Clique em **Create user**

---

### ✅ Passo 6: Tornar-se Coordenador (2 min)

**IMPORTANTE:** O primeiro usuário deve ser coordenador para criar turmas!

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute:

```sql
-- Primeiro, veja seu user_id
SELECT id, email FROM auth.users;

-- Copie o ID do seu usuário, depois execute:
UPDATE public.profiles
SET role = 'coordenador', name = 'Seu Nome'
WHERE id = 'cole-seu-user-id-aqui';
```

3. Faça logout e login novamente no sistema

---

## 🎯 TESTE INICIAL (10 minutos)

Agora vamos fazer um teste completo do sistema!

### 1️⃣ Criar uma Turma (2 min)

1. Faça login no sistema
2. Clique em **Turmas** no menu superior
3. Clique em **Nova Turma**
4. Preencha:
   ```
   Nome: Python Iniciante - Turma A
   Horário: 19:00
   Dias: Segunda, Quarta, Sexta
   ```
5. Clique em **Salvar**
6. ✅ Verifique se a turma apareceu na lista

---

### 2️⃣ Adicionar Alunos (3 min)

1. Clique em **Alunos** no menu superior
2. Clique em **Novo Aluno**
3. Adicione 3 alunos de teste:

**Aluno 1:**
```
Nome: João Silva
Email: joao@teste.com
Telefone: (11) 99999-1111
Turma: Python Iniciante - Turma A
```

**Aluno 2:**
```
Nome: Maria Santos
Email: maria@teste.com
Telefone: (11) 99999-2222
Turma: Python Iniciante - Turma A
```

**Aluno 3:**
```
Nome: Pedro Oliveira
Email: pedro@teste.com
Telefone: (11) 99999-3333
Turma: Python Iniciante - Turma A
```

4. ✅ Verifique se os 3 alunos aparecem na lista

---

### 3️⃣ Fazer uma Chamada (2 min)

1. Clique em **Chamada** no menu superior
2. Selecione:
   ```
   Turma: Python Iniciante - Turma A
   Data: [Hoje]
   ```
3. Clique em **Gerar Chamada**
4. ✅ Deve aparecer a lista com os 3 alunos
5. Marque:
   - João Silva: ✅ PRESENTE
   - Maria Santos: ❌ AUSENTE
   - Pedro Oliveira: ✅ PRESENTE
6. Clique em **Salvar Chamada**
7. ✅ Deve aparecer mensagem de sucesso

---

### 4️⃣ Verificar no Kanban (1 min)

1. Clique em **Acompanhamento** no menu superior
2. ✅ Você deve ver:
   - Maria Santos apareceu na coluna "Faltou Última Aula"
   - Card deve mostrar: 1 falta total, 1 falta consecutiva
   - João e Pedro não aparecem (pois estão com frequência OK)

---

### 5️⃣ Testar Movimento de Card (2 min)

1. No Kanban, arraste o card de Maria Santos para a coluna **Contato Realizado**
2. ✅ Um modal deve abrir automaticamente
3. Tente clicar em "Salvar" sem escrever nada
   - ✅ Deve dar erro: "A observação é obrigatória"
4. Escreva uma observação:
   ```
   Conversei com a aluna. Estava doente. 
   Prometeu recuperar o conteúdo na próxima aula.
   ```
5. Clique em **Salvar e Mover Card**
6. ✅ O card deve mover para "Contato Realizado" e mostrar a observação

---

### 6️⃣ Verificar Dashboard de Email (1 min)

1. Olhe para a barra lateral esquerda
2. ✅ Deve aparecer:
   - Quota de Emails
   - Barra de progresso (0/100)
   - Status: verde
   - "100 emails disponíveis hoje"

---

## 🎉 TESTE COMPLETO!

Se todos os passos funcionaram, **PARABÉNS!** 🎊

Seu CRM Acadêmico está:
- ✅ Conectado ao Supabase
- ✅ Gerenciando turmas e alunos
- ✅ Fazendo chamadas
- ✅ Criando cards automaticamente
- ✅ Permitindo movimentação e observações
- ✅ Monitorando quota de emails

---

## 🔄 PRÓXIMO TESTE: Faltas Consecutivas

Para ver o sistema funcionando completamente:

### Dia 1 (Hoje):
✅ Você já fez - Maria faltou (1 falta)

### Dia 2 (Amanhã ou simule):
1. Vá em **Chamada**
2. Altere a data para amanhã
3. Gere nova chamada
4. Marque Maria como AUSENTE novamente
5. Salve
6. ✅ No Kanban, Maria deve mover para "Faltou 2 Seguidas" (laranja)

### Dia 3 (Depois ou simule):
1. Repita o processo
2. Marque Maria como AUSENTE pela 3ª vez
3. ✅ No Kanban, Maria deve mover para "Faltou 3+ Seguidas" (vermelho, CRÍTICO)

---

## 📧 TESTAR ENVIO DE EMAIL (Opcional)

**ATENÇÃO:** Só funciona após configurar o Resend!

1. Configure o MCP do Resend (ver `MCP_RESEND_CONFIG.md`)
2. Verifique seu domínio no Resend
3. No sistema, clique em **Enviar Relatório**
4. Configure:
   ```
   De: seu-email@dominio-verificado.com
   Para: seu-email@teste.com
   ```
5. Clique em **Enviar Relatório**
6. ✅ Verifique sua caixa de entrada

---

## ⚠️ PROBLEMAS COMUNS

### ❌ "Missing Supabase environment variables"
**Solução:** Verifique o arquivo `.env.local`

### ❌ "relation 'public.profiles' does not exist"
**Solução:** Execute o schema.sql novamente no Supabase

### ❌ "Apenas coordenadores podem criar turmas"
**Solução:** Execute o SQL para tornar-se coordenador (Passo 6 acima)

### ❌ Cards não aparecem no Kanban
**Solução:** 
1. Abra o console do navegador (F12)
2. Vá em **Console**
3. Veja se há erros
4. Verifique se a chamada foi realmente salva

### ❌ Modal de observação não abre
**Solução:**
1. Verifique se está arrastando para "Contato Realizado"
2. Verifique o console por erros
3. Recarregue a página

---

## 📚 PRÓXIMOS PASSOS

Após confirmar que tudo funciona:

1. ✅ Leia o `GUIA_COMPLETO_IMPLEMENTACAO.md` para funcionalidades avançadas
2. ✅ Configure o Resend para envio de emails
3. ✅ Crie suas turmas e alunos reais
4. ✅ Comece a usar diariamente!

---

## 🆘 PRECISA DE AJUDA?

1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase (SQL Editor → Logs)
3. Revise este guia passo a passo
4. Consulte o `GUIA_COMPLETO_IMPLEMENTACAO.md`

---

**BOA SORTE! 🚀**

Qualquer dúvida, siga este guia passo a passo novamente.

