# ⚡ TESTE A INTEGRAÇÃO GODEVS AGORA!

## 1️⃣ Configure o `.env.local`

Abra o arquivo `.env.local` e **ADICIONE** estas linhas:

```env
# Supabase GoDevs (Apenas Leitura)
VITE_GODEVS_SUPABASE_URL=https://yolwftwrqbsamxbrzaii.supabase.co
VITE_GODEVS_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbHdmdHdycWJzYW14YnJ6YWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDgyMTEsImV4cCI6MjA3MzcyNDIxMX0.KhZEswTslb31ijCbNQWi7j4gAs7WNUq7aEey8yVdpf8
```

## 2️⃣ Reinicie o Servidor

```bash
# Pare o servidor (Ctrl+C se estiver rodando)

# Reinicie
npm run dev
```

## 3️⃣ Acesse a Aplicação

1. Abra o navegador em `http://localhost:5173`
2. Faça login como **coordenador**: `projetoin100tiva@gmail.com`
3. Clique em **"Turmas"** no menu superior

## 4️⃣ Veja o Indicador

Se tudo estiver correto, você verá:

```
✓ GoDevs Conectado
```

Abaixo do título "Gerenciar Turmas"

## 5️⃣ Teste a Importação

1. Clique no botão **"Importar do GoDevs"**
2. Veja a lista de turmas do GoDevs
3. Clique em uma turma
4. Configure dias e horário
5. Clique em **"Importar Turma"**
6. 🎉 **Alunos importados automaticamente!**

## 6️⃣ Teste a Sincronização

1. Em um card de turma importada
2. Clique em **"Sincronizar com GoDevs"**
3. Veja quantos alunos foram atualizados/adicionados

---

## 🐛 Se Algo Der Errado

### Console do Navegador
Abra o console (F12) e procure por:
- ✅ `GoDevs Supabase conectado` (sucesso)
- ❌ `GoDevs Supabase não configurado` (erro)

### Logs Detalhados
O sistema mostra logs no console para debug:
- `✅ Encontrou alunos em: alunos.turma_id`
- `📥 Importando X alunos...`
- `✅ Y/X alunos importados`

### Erros Comuns
- **"Nenhuma turma encontrada"**: Tabelas têm nomes diferentes
- **"Erro ao conectar"**: Credenciais erradas no .env.local
- **"Botão não aparece"**: Variáveis não foram configuradas

---

## 📞 Próximo Passo

Depois de testar, me avise:

1. ✅ **Se funcionou**: "Importei X turmas com Y alunos!"
2. ❌ **Se deu erro**: Cole a mensagem de erro do console
3. 🔧 **Se precisar ajustar**: Me diga os nomes das tabelas no GoDevs

---

## 🎯 O Que Você Pode Fazer Agora

✅ Importar turmas existentes do GoDevs
✅ Adicionar alunos automaticamente  
✅ Fazer chamadas normalmente
✅ Ver alunos no Kanban por faltas
✅ Sincronizar dados quando quiser
✅ Criar turmas manuais (mantido)
✅ Enviar relatórios por email

**Dois sistemas. Uma solução.** 🚀

