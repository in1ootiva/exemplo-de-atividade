# Configuração do MCP do Resend

## ✅ Instalação Completa

O servidor MCP do Resend foi instalado com sucesso em:
```
C:\Users\in100\OneDrive\Documentos\projetos\MVP-Flow\mcp-send-email
```

## 📝 Próximos Passos

### 1. Obter sua API Key do Resend

Você precisa:
1. Criar uma API Key em: https://resend.com/api-keys
2. Verificar seu próprio domínio em: https://resend.com/domains (para enviar emails para endereços além do seu próprio)

### 2. Configurar o MCP no Cursor

**Passo 1:** Abra as configurações do Cursor
- Pressione `Ctrl + Shift + P` no Windows
- Digite "Cursor Settings" e selecione

**Passo 2:** Adicione o servidor MCP
- Clique em **MCP** na barra lateral esquerda
- Clique em **Add new global MCP server**
- Adicione a seguinte configuração:

```json
{
  "mcpServers": {
    "resend": {
      "type": "command",
      "command": "node C:\\Users\\in100\\OneDrive\\Documentos\\projetos\\MVP-Flow\\mcp-send-email\\build\\index.js --key=SUA_API_KEY_AQUI"
    }
  }
}
```

**⚠️ IMPORTANTE:** Substitua `SUA_API_KEY_AQUI` pela sua API Key do Resend.

### 3. Argumentos Opcionais

Você pode adicionar argumentos opcionais ao comando:

```json
{
  "mcpServers": {
    "resend": {
      "type": "command",
      "command": "node C:\\Users\\in100\\OneDrive\\Documentos\\projetos\\MVP-Flow\\mcp-send-email\\build\\index.js --key=SUA_API_KEY_AQUI --sender=seu-email@seudominio.com --reply-to=seu-email@seudominio.com"
    }
  }
}
```

**Argumentos disponíveis:**
- `--key`: Sua API key do Resend (obrigatório)
- `--sender`: Seu endereço de email remetente de um domínio verificado (opcional)
- `--reply-to`: Seu endereço de email para resposta (opcional)

> 💡 **Dica:** Se você não fornecer um endereço de email remetente, o servidor MCP pedirá um toda vez que você chamar a ferramenta.

### 4. Testar o Envio

Há um arquivo de teste em `mcp-send-email/email.md` que você pode usar para testar:

1. Abra o arquivo `C:\Users\in100\OneDrive\Documentos\projetos\MVP-Flow\mcp-send-email\email.md`
2. Substitua o endereço "to:" pelo seu próprio email
3. Selecione todo o texto e pressione `Ctrl + L`
4. No chat do Cursor (no modo **Agent** - selecione no dropdown inferior esquerdo), digite: "envie isso como um email"

## 🎯 Funcionalidades Disponíveis

O servidor MCP do Resend permite:
- ✉️ Enviar emails em texto simples e HTML
- ⏰ Agendar emails para entrega futura
- 📧 Adicionar destinatários em CC e BCC
- 🔄 Configurar endereços de resposta
- ✅ Email do remetente personalizável (requer verificação)

## 📚 Referências

- Documentação: https://resend.com/docs/knowledge-base/mcp-server
- Repositório: https://github.com/resend/mcp-send-email

