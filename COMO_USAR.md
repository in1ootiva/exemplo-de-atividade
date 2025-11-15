# 📚 Como Usar o CRM Kanban

Guia prático de uso do sistema de gestão visual de negociações.

## 🎯 Conceitos Básicos

### O que é o Quadro Kanban?

O quadro Kanban é dividido em **colunas**, onde cada coluna representa uma etapa do seu processo de vendas. Dentro de cada coluna, você tem **cards** que representam suas negociações.

**Exemplo de fluxo:**
```
Novo Lead → Contato Feito → Proposta Enviada → Negociação → Ganho/Perdido
```

## 🃏 Trabalhando com Negociações (Cards)

### Adicionar uma Nova Negociação

1. Clique no botão **"Adicionar Negociação"** na coluna desejada
2. Preencha o formulário:
   - **Nome da Negociação*** (obrigatório): Ex: "Website para Empresa ABC"
   - **Valor Estimado**: Ex: 5000.00
   - **Nome do Contato**: Ex: "Maria Silva"
   - **Email do Contato**: Ex: "maria@empresa.com"
   - **Telefone**: Ex: "(11) 98765-4321"
   - **Notas**: Adicione observações importantes
3. Clique em **"Adicionar Negociação"**

### Editar uma Negociação

1. Clique no card da negociação que deseja editar
2. O formulário será aberto com os dados atuais
3. Faça as alterações necessárias
4. Clique em **"Salvar Alterações"**

### Mover uma Negociação (Drag & Drop)

**Método 1: Arrastar e Soltar**
- Clique e segure o card
- Arraste para a coluna desejada
- Solte o card

**Método 2: Reordenar dentro da mesma coluna**
- Arraste o card para cima ou para baixo
- A ordem será mantida automaticamente

### Exemplo Prático

**Cenário**: Cliente pediu orçamento ontem

1. Criar card em "Novo Lead"
2. Preencher dados do cliente
3. Após enviar proposta, arrastar para "Proposta Enviada"
4. Cliente aceitou? Arrastar para "Ganho" ✅
5. Cliente recusou? Arrastar para "Perdido" ❌

## 📊 Gerenciando Colunas

### Renomear uma Coluna

1. Clique no ícone **⋮** (três pontos) no cabeçalho da coluna
2. Selecione **"Renomear"**
3. Digite o novo nome
4. Pressione **Enter** ou clique no ✓

### Adicionar Nova Coluna

1. Role o quadro até o final (à direita)
2. Clique em **"Adicionar Coluna"**
3. Digite o nome da nova coluna
4. Clique em "OK"

**Exemplo de colunas personalizadas:**
- Para designers: "Briefing → Rascunho → Revisão → Aprovado → Entregue"
- Para desenvolvedores: "Análise → Desenvolvimento → Testes → Deploy"
- Para consultores: "Primeiro Contato → Diagnóstico → Proposta → Fechamento"

### Excluir uma Coluna

1. Clique no ícone **⋮** no cabeçalho da coluna
2. Selecione **"Excluir Coluna"**
3. **⚠️ ATENÇÃO**: Todas as negociações dessa coluna serão excluídas!
4. Confirme a ação

## 💡 Dicas de Uso

### Organização Eficiente

1. **Mantenha os cards atualizados**: Arraste-os assim que o status mudar
2. **Use as notas**: Registre datas importantes, próximos passos, etc.
3. **Valor estimado**: Ajuda a priorizar e visualizar o potencial do pipeline
4. **Informações de contato**: Sempre tenha à mão quando precisar

### Nomenclatura de Negociações

**Boas práticas:**
- ✅ "Website - Empresa ABC"
- ✅ "Logo + Identidade Visual - Cliente XYZ"
- ✅ "Consultoria SEO - Loja Online"

**Evite:**
- ❌ "Projeto 1"
- ❌ "Cliente novo"
- ❌ "Website" (muito genérico)

### Fluxo de Trabalho Recomendado

**Manhã:**
1. Abra o quadro
2. Revise cards em "Negociação" - há algo para fazer hoje?
3. Verifique "Proposta Enviada" - alguém precisa de follow-up?

**Durante o dia:**
4. Cliente ligou? Atualize o card para a próxima etapa
5. Novo lead? Adicione imediatamente em "Novo Lead"

**Fim do dia:**
6. Revise todo o quadro
7. Atualize notas com informações importantes

## 📈 Entendendo as Estatísticas

No topo da tela, você vê:

- **Negociações**: Total de cards em todas as colunas
- **Valor Total**: Soma de todos os valores estimados

**Use isso para:**
- Monitorar o tamanho do seu pipeline
- Avaliar potencial de receita
- Identificar se precisa prospectar mais leads

## 💾 Sobre os Dados

### Salvamento Automático

- ✅ Qualquer alteração é salva **instantaneamente**
- ✅ Pode fechar o navegador sem preocupação
- ✅ Seus dados estarão lá quando voltar

### Limitações Importantes

- ⚠️ Dados salvos apenas no **navegador atual**
- ⚠️ **Não sincroniza** entre dispositivos
- ⚠️ Usar o **mesmo navegador e perfil**
- ⚠️ **Não usar modo anônimo**
- ⚠️ Limpar dados do navegador apaga tudo

### Backup Manual

Para fazer backup dos seus dados:
1. Abra o Console do navegador (F12)
2. Vá para "Application" → "Local Storage"
3. Procure por "crm-kanban-board-state"
4. Copie o conteúdo e salve em um arquivo .txt

## 🎓 Casos de Uso

### Freelancer Designer

**Colunas:**
1. Novo Contato
2. Orçamento Enviado
3. Aguardando Pagamento
4. Em Produção
5. Entregue
6. Cancelado

**Uso diário:** 5-10 projetos ativos

### Agência Pequena

**Colunas:**
1. Lead Recebido
2. Reunião Agendada
3. Proposta Elaborada
4. Negociação
5. Ganho
6. Perdido

**Uso diário:** Toda a equipe visualiza o pipeline

### Consultor

**Colunas:**
1. Prospecção
2. Primeiro Contato
3. Diagnóstico
4. Proposta
5. Fechado
6. Não Avançou

**Uso diário:** Follow-ups e novas oportunidades

## ❓ Perguntas Frequentes

**P: Posso usar em vários computadores?**
R: Não nesta versão. Os dados são locais ao navegador.

**P: E se eu limpar o cache do navegador?**
R: Os dados serão perdidos. Faça backup manual se necessário.

**P: Posso compartilhar com minha equipe?**
R: Não nesta versão MVP. Cada pessoa terá seu próprio quadro.

**P: Há limite de cards ou colunas?**
R: Tecnicamente não, mas recomendamos até 50 cards para melhor performance.

**P: Posso usar no celular?**
R: Sim! A interface é responsiva, mas a experiência é melhor no desktop.

## 🚀 Próximos Passos

Agora que você sabe usar o CRM Kanban:

1. ✅ Configure suas colunas de acordo com seu processo
2. ✅ Adicione suas negociações atuais
3. ✅ Use diariamente para não perder oportunidades
4. ✅ Desenvolva o hábito de atualizar sempre que houver mudanças

**Boa gestão de vendas! 🎯**

