# Guia de Instalação - CRM Kanban MVP

Este guia irá ajudá-lo a configurar e executar o projeto em seu computador.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** (normalmente vem com o Node.js)

Para verificar se você tem o Node.js instalado, execute no terminal:

```bash
node --version
npm --version
```

## 🚀 Instalação

### Passo 1: Instalar as dependências

No diretório do projeto, execute:

```bash
npm install
```

Este comando irá instalar todas as dependências necessárias listadas no `package.json`.

### Passo 2: Iniciar o servidor de desenvolvimento

Após a instalação, execute:

```bash
npm run dev
```

### Passo 3: Acessar a aplicação

O Vite irá iniciar um servidor local. Você verá uma mensagem similar a:

```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abra seu navegador e acesse: **http://localhost:5173/**

## 🎯 Primeiros Passos

1. **Adicione sua primeira negociação**: Clique no botão "Adicionar Negociação" em qualquer coluna
2. **Preencha os dados**: Nome da negociação, valor, contato, etc.
3. **Arraste e solte**: Mova os cards entre as colunas para atualizar o status
4. **Personalize suas colunas**: Use o menu (três pontos) para renomear ou excluir colunas
5. **Adicione novas colunas**: Clique no botão "Adicionar Coluna" à direita do quadro

## 📦 Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

Para visualizar a versão de produção localmente:

```bash
npm run preview
```

## 🔍 Comandos Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter para verificar o código

## 💾 Armazenamento de Dados

- Todos os dados são salvos **automaticamente** no localStorage do seu navegador
- **Importante**: Os dados são específicos do navegador e dispositivo
- Não há sincronização entre diferentes navegadores ou dispositivos
- Para fazer backup, você pode exportar os dados do localStorage (funcionalidade futura)

## ⚠️ Troubleshooting

### Erro: "Cannot find module"
Execute `npm install` novamente para garantir que todas as dependências foram instaladas.

### Porta 5173 já está em uso
O Vite automaticamente tentará usar outra porta. Ou você pode especificar uma porta diferente:
```bash
npm run dev -- --port 3000
```

### Dados não estão sendo salvos
Verifique se o localStorage está habilitado no seu navegador (não use modo privado/anônimo).

## 🌐 Navegadores Suportados

- Chrome (recomendado)
- Firefox
- Safari
- Edge

## 📞 Suporte

Se encontrar problemas, verifique:
1. Se todas as dependências foram instaladas corretamente
2. Se está usando uma versão compatível do Node.js
3. Se não há erros no console do navegador

## 🎉 Pronto!

Agora você está pronto para gerenciar suas negociações de forma visual e eficiente!

