# 🏗️ Estrutura do Projeto

Este documento explica a organização do código e a função de cada arquivo.

## 📁 Visão Geral da Estrutura

```
crm-kanban-mvp/
├── public/               # Arquivos estáticos
│   └── vite.svg         # Ícone do projeto
├── src/                 # Código-fonte principal
│   ├── components/      # Componentes React
│   │   ├── ui/         # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── textarea.tsx
│   │   ├── ColumnHeader.tsx    # Cabeçalho das colunas
│   │   ├── DealCard.tsx        # Card de negociação
│   │   ├── DealDialog.tsx      # Modal para criar/editar
│   │   └── KanbanBoard.tsx     # Quadro Kanban principal
│   ├── hooks/          # React Hooks customizados
│   │   └── useLocalStorage.ts  # Persistência no localStorage
│   ├── lib/            # Utilitários
│   │   └── utils.ts    # Helpers (cn, etc.)
│   ├── types/          # Definições TypeScript
│   │   └── index.ts    # Tipos do domínio
│   ├── App.tsx         # Componente raiz
│   ├── index.css       # Estilos globais + Tailwind
│   └── main.tsx        # Entry point da aplicação
├── index.html          # HTML principal
├── package.json        # Dependências e scripts
├── tsconfig.json       # Configuração TypeScript
├── vite.config.ts      # Configuração Vite
├── tailwind.config.js  # Configuração Tailwind CSS
├── postcss.config.js   # Configuração PostCSS
├── .eslintrc.cjs       # Configuração ESLint
├── .gitignore          # Arquivos ignorados pelo Git
├── README.md           # Documentação principal
├── INSTALACAO.md       # Guia de instalação
├── COMO_USAR.md        # Guia de uso
└── DEPLOY_E_MELHORIAS.md  # Deploy e roadmap
```

## 🎯 Componentes Principais

### `App.tsx`
**Responsabilidade:** Componente raiz da aplicação

**O que faz:**
- Gerencia o estado global do board
- Usa o hook `useLocalStorage` para persistência
- Renderiza header com estatísticas
- Renderiza o KanbanBoard
- Renderiza footer

**Estado:**
- `boardState`: Estado completo (colunas + cards)

### `KanbanBoard.tsx`
**Responsabilidade:** Lógica principal do Kanban

**O que faz:**
- Implementa drag-and-drop com @dnd-kit
- Gerencia eventos de arrastar cards
- Renderiza todas as colunas
- Controla abertura/fechamento de dialogs
- Implementa CRUD de cards e colunas

**Props:**
- `boardState`: Estado atual do board
- `onUpdateBoard`: Callback para atualizar estado

**Estado interno:**
- `activeCard`: Card sendo arrastado
- `dialogOpen`: Dialog aberto/fechado
- `selectedColumnId`: Coluna selecionada
- `editingCard`: Card sendo editado

### `DealCard.tsx`
**Responsabilidade:** Renderizar um card individual

**O que faz:**
- Mostra informações da negociação
- Implementa arrastar (via useSortable)
- Formata valor monetário
- Mostra ícones para cada campo

**Props:**
- `deal`: Dados da negociação
- `onClick`: Callback ao clicar

### `DealDialog.tsx`
**Responsabilidade:** Modal de criar/editar negociação

**O que faz:**
- Formulário com validação
- Campos: título, valor, contato, etc.
- Modo criação vs edição
- Validação básica (título obrigatório)

**Props:**
- `open`: Dialog aberto/fechado
- `onOpenChange`: Callback para abrir/fechar
- `onSave`: Callback ao salvar
- `columnId`: Coluna destino (para novos cards)
- `existingDeal`: Card existente (para edição)

### `ColumnHeader.tsx`
**Responsabilidade:** Cabeçalho da coluna

**O que faz:**
- Mostra título e contador de cards
- Menu dropdown com ações (renomear, excluir)
- Modo de edição inline para renomear
- Confirmação antes de excluir

**Props:**
- `column`: Dados da coluna
- `cardCount`: Número de cards
- `onRename`: Callback para renomear
- `onDelete`: Callback para excluir

## 🔧 Hooks e Utilitários

### `useLocalStorage.ts`
**Responsabilidade:** Persistência no navegador

**O que faz:**
- Salva/carrega do localStorage
- API similar ao useState
- Serializa/deserializa JSON
- Tratamento de erros

**Uso:**
```typescript
const [state, setState] = useLocalStorage(initialValue);
```

### `utils.ts`
**Responsabilidade:** Funções auxiliares

**Função `cn()`:**
- Combina classes CSS
- Usa clsx + tailwind-merge
- Resolve conflitos do Tailwind

**Uso:**
```typescript
cn("base-class", condition && "conditional-class")
```

## 📊 Tipos e Interfaces

### `types/index.ts`

**`DealCard`**
```typescript
{
  id: string;              // ID único
  title: string;           // Nome da negociação
  value?: number;          // Valor em reais
  contactName?: string;    // Nome do contato
  contactEmail?: string;   // Email
  contactPhone?: string;   // Telefone
  notes?: string;          // Observações
  columnId: string;        // Coluna atual
  order: number;           // Ordem na coluna
  createdAt: string;       // Data de criação
  updatedAt: string;       // Última atualização
}
```

**`Column`**
```typescript
{
  id: string;        // ID único
  title: string;     // Nome da coluna
  order: number;     // Ordem no board
  color?: string;    // Cor da coluna (hex)
}
```

**`BoardState`**
```typescript
{
  columns: Column[];      // Array de colunas
  cards: DealCard[];      // Array de cards
}
```

## 🎨 Componentes UI (shadcn/ui)

Todos em `src/components/ui/`:

- **Button**: Botões estilizados
- **Card**: Container para cards
- **Dialog**: Modais/overlays
- **Input**: Campos de texto
- **Label**: Labels de formulário
- **Textarea**: Campo de texto multilinha
- **DropdownMenu**: Menu suspenso

**Padrão de uso:**
```typescript
import { Button } from "@/components/ui/button";

<Button variant="default" size="md">
  Clique aqui
</Button>
```

## 🔄 Fluxo de Dados

### Criação de Card

```
1. Usuário clica "Adicionar Negociação"
   ↓
2. KanbanBoard abre DealDialog
   ↓
3. Usuário preenche formulário
   ↓
4. DealDialog.onSave() chamado
   ↓
5. KanbanBoard.handleSaveCard()
   ↓
6. Novo card adicionado ao boardState
   ↓
7. onUpdateBoard() chamado
   ↓
8. App.tsx atualiza estado
   ↓
9. useLocalStorage salva automaticamente
   ↓
10. Re-render com novo card
```

### Drag & Drop

```
1. Usuário arrasta card
   ↓
2. onDragStart() - marca card ativo
   ↓
3. onDragOver() - atualiza coluna se mudou
   ↓
4. onDragEnd() - finaliza e reordena
   ↓
5. boardState atualizado
   ↓
6. Salvo no localStorage
```

## 🗄️ Persistência de Dados

**Chave do localStorage:**
```
"crm-kanban-board-state"
```

**Formato salvo:**
```json
{
  "columns": [
    {
      "id": "novo-lead",
      "title": "Novo Lead",
      "order": 0,
      "color": "#3b82f6"
    }
  ],
  "cards": [
    {
      "id": "card-1234567890",
      "title": "Website Empresa ABC",
      "value": 5000,
      "columnId": "novo-lead",
      "order": 0,
      "createdAt": "2025-11-15T10:30:00.000Z",
      "updatedAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

## 🎨 Estilos e Temas

### Variáveis CSS (index.css)

Todas as cores usam variáveis CSS customizadas:

```css
--primary: 221.2 83.2% 53.3%;
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
/* etc... */
```

**Modo escuro:**
```css
.dark {
  --primary: 217.2 91.2% 59.8%;
  /* cores invertidas */
}
```

### Classes Tailwind Customizadas

Todas as classes do shadcn/ui são compatíveis com:
- `bg-primary`
- `text-foreground`
- `border-border`
- etc.

## 🚀 Build e Deploy

### Desenvolvimento
```bash
npm run dev  # Vite dev server (porta 5173)
```

### Produção
```bash
npm run build    # Gera pasta dist/
npm run preview  # Testa build local
```

### Estrutura do Build

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js   # JS otimizado
│   └── index-[hash].css  # CSS otimizado
└── vite.svg
```

## 📝 Convenções de Código

### Nomenclatura

- **Componentes:** PascalCase (`DealCard.tsx`)
- **Hooks:** camelCase com prefixo use (`useLocalStorage`)
- **Tipos:** PascalCase (`DealCard`, `Column`)
- **Funções:** camelCase (`handleSaveCard`)
- **Constantes:** UPPER_SNAKE_CASE (`DEFAULT_COLUMNS`)

### Organização de Imports

```typescript
// 1. React
import { useState } from 'react';

// 2. Bibliotecas externas
import { DndContext } from '@dnd-kit/core';

// 3. Componentes
import { Button } from '@/components/ui/button';

// 4. Hooks
import { useLocalStorage } from '@/hooks/useLocalStorage';

// 5. Tipos
import { DealCard } from '@/types';

// 6. Utilitários
import { cn } from '@/lib/utils';
```

### TypeScript

- ✅ Sempre tipar props de componentes
- ✅ Usar interfaces para objetos complexos
- ✅ Evitar `any`
- ✅ Usar `?` para props opcionais

## 🔍 Debugging

### Dicas

1. **React DevTools:** Ver hierarquia de componentes
2. **Console do navegador:** Verificar localStorage
3. **Vite HMR:** Hot reload automático
4. **TypeScript:** Erros em tempo de desenvolvimento

### Logs Úteis

```typescript
// Ver estado do board
console.log('Board State:', boardState);

// Ver localStorage
console.log(localStorage.getItem('crm-kanban-board-state'));

// Ver evento de drag
console.log('Drag event:', event);
```

## 🧪 Testes (Futuro)

Para adicionar testes:

```bash
npm install --save-dev vitest @testing-library/react
```

Estrutura sugerida:
```
src/
├── __tests__/
│   ├── App.test.tsx
│   ├── KanbanBoard.test.tsx
│   └── useLocalStorage.test.ts
```

## 📚 Recursos de Aprendizado

- **React:** [react.dev](https://react.dev)
- **TypeScript:** [typescriptlang.org](https://www.typescriptlang.org)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)
- **dnd-kit:** [dndkit.com](https://dndkit.com)
- **Vite:** [vitejs.dev](https://vitejs.dev)

## 🤝 Contribuindo

Ao modificar o código:

1. Mantenha a consistência de estilo
2. Comente código complexo
3. Atualize esta documentação se necessário
4. Teste antes de commitar
5. Use commits descritivos

**Exemplo de commit:**
```
feat: adicionar filtro por valor na busca
fix: corrigir bug ao arrastar cards
docs: atualizar guia de instalação
```

---

**Dúvidas?** Consulte os outros arquivos de documentação ou o README.md principal.

