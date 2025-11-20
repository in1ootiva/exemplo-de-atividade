# 🔍 DEBUG: Importação de Turmas GoDevs

## ✅ Logs de Debug Ativados

Adicionei logs detalhados em toda a cadeia de importação. Agora você vai ver exatamente onde está o problema!

---

## 📋 TESTE NOVAMENTE

### 1. Abra o Console do Navegador

**Pressione F12** e vá na aba **Console**

### 2. Limpe o Console

Clique no ícone 🚫 para limpar mensagens antigas

### 3. Clique em "Importar do GoDevs"

### 4. Observe os Logs

Você deve ver esta sequência de logs:

```
✅ SUCESSO (esperado):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Modal useEffect: {open: true, step: "list", loading: false}
📂 Modal: Condições atendidas, chamando loadTurmas...
🔍 Modal: Iniciando busca de turmas do GoDevs...
🎯 Hook: Iniciando busca de turmas...
🎯 Hook: Chamando buscarTurmasGoDevs...
🔧 Service: Verificando disponibilidade do GoDevs...
🔧 Service: GoDevs está disponível ✅
🔧 Service: Executando query na tabela "classes"...
🔧 Service: Query executada. Data: [Array(3)] Error: null
🔧 Service: ✅ 3 turma(s) encontrada(s) no GoDevs
🔧 Service: Turmas mapeadas: [{id: "...", nome: "MVP Flow 01"}, ...]
🎯 Hook: Turmas recebidas: [{id: "...", nome: "MVP Flow 01"}, ...]
📊 Modal: Turmas recebidas: [{...}, {...}, {...}]
📊 Modal: Total de turmas: 3
✅ Modal: Turmas carregadas com sucesso!
🏁 Modal: Busca finalizada
```

---

## ❌ POSSÍVEIS ERROS

### Erro 1: GoDevs não disponível

```
🔧 Service: GoDevs NÃO está disponível
```

**Causa:** Variáveis do `.env.local` não carregadas

**Solução:**
1. Verifique se as variáveis estão no `.env.local`
2. Reinicie o servidor (`Ctrl+C` e `npm run dev`)
3. Limpe o cache do navegador (`Ctrl+Shift+Delete`)

### Erro 2: Query com erro

```
🔧 Service: ❌ Erro na query: {message: "...", ...}
```

**Causa:** Problema de permissão ou conexão com GoDevs

**Solução:**
1. Verifique a ANON_KEY do GoDevs
2. Verifique se RLS está configurado corretamente
3. Teste a conexão via MCP

### Erro 3: Data vazia

```
🔧 Service: ⚠️ Nenhuma turma encontrada no GoDevs
```

**Causa:** Tabela `classes` está vazia ou query não retorna dados

**Solução:**
1. Verifique se há turmas no GoDevs (via MCP ou dashboard)
2. Verifique políticas RLS da tabela `classes`

### Erro 4: Modal não chama loadTurmas

```
📂 Modal: Condições NÃO atendidas: {open: true, step: "config"}
```

**Causa:** Modal está abrindo em step errado

**Solução:**
1. Verifique o estado inicial do modal
2. Pode ser um bug de navegação

---

## 🎯 TESTE A CONEXÃO DIRETAMENTE

Se não aparecer nenhum log, teste a conexão manualmente no console:

```javascript
// Cole isso no console do navegador (F12):
const { supabaseGoDevs } = await import('./src/lib/supabaseGoDevs.ts');

console.log('Cliente GoDevs:', supabaseGoDevs);

// Testar query:
const { data, error } = await supabaseGoDevs
  .from('classes')
  .select('*');

console.log('Data:', data);
console.log('Error:', error);
```

---

## 📸 ME ENVIE

Depois de clicar em "Importar do GoDevs", copie e me envie:

1. **Todos os logs do console** (da primeira linha até a última)
2. **Screenshot do modal** (mostrando se está vazio/carregando/erro)
3. **Resultado do teste manual** (se fizer)

---

## 🔧 CHECKLIST PRÉ-DEBUG

Antes de testar, confirme:

- [ ] Servidor reiniciado após adicionar variáveis
- [ ] Console do navegador aberto (F12)
- [ ] Console limpo (clicou no 🚫)
- [ ] Badge "✓ GoDevs Conectado" aparece
- [ ] Login como coordenador (`projetoin100tiva@gmail.com`)

---

## 💡 DICA

Se ver muitos logs e ficar confuso, procure por:

- ✅ (checkmark verde) = sucesso
- ❌ (x vermelho) = erro
- ⚠️ (warning) = aviso
- 🔧 (wrench) = service layer
- 🎯 (alvo) = hook layer
- 📂 (folder) = modal layer

---

**Teste agora e me envie os logs! Vamos descobrir onde está o problema! 🕵️**

