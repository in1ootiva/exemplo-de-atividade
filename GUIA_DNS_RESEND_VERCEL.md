# 🎯 Guia Completo: Configurar DNS do Resend na Vercel

## 📋 Visão Geral

Este guia mostra como conectar seu domínio da Vercel com o Resend para enviar emails.

**Tempo estimado:** 15-30 minutos (+ tempo de propagação DNS)

---

## 🔴 PARTE 1: OBTER REGISTROS DNS DO RESEND

### Passo 1.1: Acessar Dashboard do Resend

1. Acesse: **https://resend.com/login**
2. Faça login na sua conta
3. No menu lateral esquerdo, clique em **"Domains"**

```
┌─────────────────────────────────────┐
│  Resend Dashboard                   │
├─────────────────────────────────────┤
│  ≡ Menu                             │
│  📊 Overview                        │
│  📧 Emails                          │
│  🌐 Domains       ← CLIQUE AQUI    │
│  🔑 API Keys                        │
│  ⚙️  Settings                       │
└─────────────────────────────────────┘
```

---

### Passo 1.2: Adicionar Seu Domínio

1. Clique no botão **"+ Add Domain"** (canto superior direito)

```
┌──────────────────────────────────────────────┐
│  Domains                    [+ Add Domain]   │
├──────────────────────────────────────────────┤
│  No domains configured yet                   │
└──────────────────────────────────────────────┘
```

2. Um modal abrirá pedindo o nome do domínio

```
┌─────────────────────────────────────────┐
│  Add Domain                             │
├─────────────────────────────────────────┤
│  Domain Name:                           │
│  ┌─────────────────────────────────┐   │
│  │ exemplo.com                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]              [Add Domain] ← CLIQUE
└─────────────────────────────────────────┘
```

**⚠️ IMPORTANTE:**
- Digite **apenas o domínio** (ex: `godevs.com.br`)
- **NÃO** digite `www.godevs.com.br`
- **NÃO** digite `https://`

**Exemplos corretos:**
- ✅ `godevs.com.br`
- ✅ `meusite.com`
- ✅ `exemplo.com.br`

**Exemplos incorretos:**
- ❌ `www.godevs.com.br`
- ❌ `https://godevs.com.br`
- ❌ `godevs.com.br/`

---

### Passo 1.3: Copiar os Registros DNS

Após adicionar o domínio, o Resend mostrará uma tela com **3 registros DNS** que você precisa configurar:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️  Domain Not Verified                                     │
│                                                               │
│  Add these DNS records to your domain provider:              │
├──────────────────────────────────────────────────────────────┤
│  📝 RECORD 1: SPF                                            │
│  ────────────────────────────────────────────────────────   │
│  Type:    TXT                                                │
│  Name:    @                                                  │
│  Value:   v=spf1 include:_spf.resend.com ~all              │
│           [📋 Copy]                                          │
├──────────────────────────────────────────────────────────────┤
│  📝 RECORD 2: DKIM                                           │
│  ────────────────────────────────────────────────────────   │
│  Type:    CNAME                                              │
│  Name:    resend._domainkey                                  │
│  Value:   resend._domainkey.resend.com                       │
│           [📋 Copy]                                          │
├──────────────────────────────────────────────────────────────┤
│  📝 RECORD 3: DMARC                                          │
│  ────────────────────────────────────────────────────────   │
│  Type:    TXT                                                │
│  Name:    _dmarc                                             │
│  Value:   v=DMARC1; p=none                                   │
│           [📋 Copy]                                          │
└──────────────────────────────────────────────────────────────┘
```

**💡 DICA:** Deixe esta aba do navegador ABERTA! Você vai precisar copiar esses valores.

---

## 🔵 PARTE 2: ADICIONAR REGISTROS DNS NA VERCEL

### Passo 2.1: Acessar Dashboard da Vercel

1. Abra uma **NOVA ABA** do navegador
2. Acesse: **https://vercel.com/dashboard**
3. Faça login na sua conta

```
┌─────────────────────────────────────┐
│  Vercel Dashboard                   │
├─────────────────────────────────────┤
│  🔍 Search...                       │
│                                     │
│  📁 Projects                        │
│  ├─ kanban-mvp                     │
│  ├─ meu-portfolio                  │
│  └─ outro-projeto                  │
│                                     │
│  ⚙️  Settings                       │
│  👥 Team                            │
└─────────────────────────────────────┘
```

---

### Passo 2.2: Acessar Configurações de Domínio

**Opção A: Se o domínio já está conectado ao projeto**

1. Clique no seu **projeto** (ex: `kanban-mvp`)
2. Clique na aba **"Settings"** (no topo)
3. No menu lateral esquerdo, clique em **"Domains"**

```
┌──────────────────────────────────────────────────────┐
│  kanban-mvp                                          │
├──────────────────────────────────────────────────────┤
│  Overview | Analytics | Settings ← CLIQUE            │
├──────────────────────────────────────────────────────┤
│  ≡ Settings Menu                                     │
│  ⚙️  General                                         │
│  🌐 Domains        ← CLIQUE AQUI                    │
│  📦 Git                                              │
│  🔒 Environment Variables                            │
└──────────────────────────────────────────────────────┘
```

**Opção B: Se o domínio está em "Domains" global**

1. No menu lateral principal da Vercel, clique em **"Domains"**
2. Localize seu domínio na lista
3. Clique no domínio

```
┌──────────────────────────────────────────────┐
│  Domains                                     │
├──────────────────────────────────────────────┤
│  🌐 godevs.com.br      [Manage] ← CLIQUE    │
│  🌐 meusite.com        [Manage]             │
└──────────────────────────────────────────────┘
```

---

### Passo 2.3: Acessar Configurações DNS

1. Após selecionar o domínio, role a página até encontrar a seção **"DNS Records"** ou **"Advanced"**

```
┌──────────────────────────────────────────────────────┐
│  Domain: godevs.com.br                               │
├──────────────────────────────────────────────────────┤
│  ✅ Domain is active                                 │
│                                                      │
│  📍 Connected to: kanban-mvp                         │
│                                                      │
│  ⬇️  Scroll down...                                  │
└──────────────────────────────────────────────────────┘
        ↓
        ↓
┌──────────────────────────────────────────────────────┐
│  🔧 DNS Records                                      │
├──────────────────────────────────────────────────────┤
│  Manage DNS records for godevs.com.br                │
│                                                      │
│  [+ Add Record]  ← CLIQUE AQUI                      │
│                                                      │
│  Current Records:                                    │
│  ┌────────────────────────────────────────────┐    │
│  │ Type │ Name │ Value          │ TTL         │    │
│  ├────────────────────────────────────────────┤    │
│  │ A    │ @    │ 76.76.21.21   │ Auto       │    │
│  │ CNAME│ www  │ cname.vercel..│ Auto       │    │
│  └────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

**⚠️ ATENÇÃO:**
- Se você **NÃO** vê a opção "DNS Records" ou "Advanced", significa que o domínio está usando **Nameservers Externos** (ex: GoDaddy, Registro.br)
- Neste caso, você precisará adicionar os registros no **provedor original** do domínio

---

### Passo 2.4: Adicionar Registro 1 - SPF (TXT)

1. Clique em **"+ Add Record"**
2. Um formulário abrirá:

```
┌─────────────────────────────────────────────────┐
│  Add DNS Record                                 │
├─────────────────────────────────────────────────┤
│  Type:                                          │
│  ┌─────────────────────────────────────────┐   │
│  │ A     ▼                                 │   │
│  └─────────────────────────────────────────┘   │
│     ↑ MUDE PARA "TXT"                          │
│                                                 │
│  Name:                                          │
│  ┌─────────────────────────────────────────┐   │
│  │ @                                       │   │
│  └─────────────────────────────────────────┘   │
│     ↑ DIGITE @                                  │
│                                                 │
│  Value:                                         │
│  ┌─────────────────────────────────────────┐   │
│  │ v=spf1 include:_spf.resend.com ~all    │   │
│  └─────────────────────────────────────────┘   │
│     ↑ COPIE DO RESEND (Record 1)               │
│                                                 │
│  TTL: Auto                                      │
│                                                 │
│  [Cancel]                        [Add]  ← CLIQUE
└─────────────────────────────────────────────────┘
```

**Valores a preencher:**
```
Type:  TXT
Name:  @
Value: v=spf1 include:_spf.resend.com ~all
TTL:   Auto (deixe como está)
```

3. Clique em **"Add"** ou **"Save"**

---

### Passo 2.5: Adicionar Registro 2 - DKIM (CNAME)

1. Clique em **"+ Add Record"** novamente
2. Preencha o formulário:

```
┌─────────────────────────────────────────────────┐
│  Add DNS Record                                 │
├─────────────────────────────────────────────────┤
│  Type:                                          │
│  ┌─────────────────────────────────────────┐   │
│  │ CNAME ▼                                 │   │
│  └─────────────────────────────────────────┘   │
│     ↑ MUDE PARA "CNAME"                        │
│                                                 │
│  Name:                                          │
│  ┌─────────────────────────────────────────┐   │
│  │ resend._domainkey                       │   │
│  └─────────────────────────────────────────┘   │
│     ↑ COPIE DO RESEND (Record 2)               │
│                                                 │
│  Value:                                         │
│  ┌─────────────────────────────────────────┐   │
│  │ resend._domainkey.resend.com           │   │
│  └─────────────────────────────────────────┘   │
│     ↑ COPIE DO RESEND (Record 2)               │
│                                                 │
│  TTL: Auto                                      │
│                                                 │
│  [Cancel]                        [Add]  ← CLIQUE
└─────────────────────────────────────────────────┘
```

**Valores a preencher:**
```
Type:  CNAME
Name:  resend._domainkey
Value: resend._domainkey.resend.com
TTL:   Auto (deixe como está)
```

**⚠️ IMPORTANTE:**
- NO campo "Value", **NÃO** adicione um ponto final (`.`)
- Copie exatamente como está no Resend

3. Clique em **"Add"** ou **"Save"**

---

### Passo 2.6: Adicionar Registro 3 - DMARC (TXT)

1. Clique em **"+ Add Record"** mais uma vez
2. Preencha o formulário:

```
┌─────────────────────────────────────────────────┐
│  Add DNS Record                                 │
├─────────────────────────────────────────────────┤
│  Type:                                          │
│  ┌─────────────────────────────────────────┐   │
│  │ TXT   ▼                                 │   │
│  └─────────────────────────────────────────┘   │
│     ↑ MUDE PARA "TXT"                          │
│                                                 │
│  Name:                                          │
│  ┌─────────────────────────────────────────┐   │
│  │ _dmarc                                  │   │
│  └─────────────────────────────────────────┘   │
│     ↑ DIGITE _dmarc                            │
│                                                 │
│  Value:                                         │
│  ┌─────────────────────────────────────────┐   │
│  │ v=DMARC1; p=none                        │   │
│  └─────────────────────────────────────────┘   │
│     ↑ COPIE DO RESEND (Record 3)               │
│                                                 │
│  TTL: Auto                                      │
│                                                 │
│  [Cancel]                        [Add]  ← CLIQUE
└─────────────────────────────────────────────────┘
```

**Valores a preencher:**
```
Type:  TXT
Name:  _dmarc
Value: v=DMARC1; p=none
TTL:   Auto (deixe como está)
```

3. Clique em **"Add"** ou **"Save"**

---

### Passo 2.7: Verificar Registros Adicionados

Após adicionar os 3 registros, você deve ver algo assim na lista de DNS Records:

```
┌────────────────────────────────────────────────────────┐
│  DNS Records                                           │
├────────────────────────────────────────────────────────┤
│  Type  │ Name                │ Value                   │
├────────────────────────────────────────────────────────┤
│  A     │ @                   │ 76.76.21.21            │
│  CNAME │ www                 │ cname.vercel-dns...    │
├────────────────────────────────────────────────────────┤
│  ✨ NOVOS REGISTROS ADICIONADOS:                       │
├────────────────────────────────────────────────────────┤
│  TXT   │ @                   │ v=spf1 include:_spf... │ ← SPF
│  CNAME │ resend._domainkey   │ resend._domainkey....  │ ← DKIM
│  TXT   │ _dmarc              │ v=DMARC1; p=none       │ ← DMARC
└────────────────────────────────────────────────────────┘
```

**✅ Perfeito!** Os 3 registros estão configurados.

---

## 🟢 PARTE 3: VERIFICAR E TESTAR

### Passo 3.1: Aguardar Propagação DNS

⏰ **Tempo de espera:** 15 minutos a 48 horas (geralmente 30 minutos)

Os registros DNS precisam se propagar pela internet. Este processo é automático, mas leva tempo.

**💡 DICA:** Aguarde pelo menos **30 minutos** antes de prosseguir.

---

### Passo 3.2: Verificar no Resend

1. Volte para a aba do **Resend** (https://resend.com/domains)
2. Localize seu domínio na lista
3. Clique em **"Verify"** ou aguarde a verificação automática

```
┌──────────────────────────────────────────────────┐
│  Domains                                         │
├──────────────────────────────────────────────────┤
│  🌐 godevs.com.br                                │
│  Status: ⚠️  Pending Verification               │
│                                                  │
│  [Verify Now]  ← CLIQUE (após 30 minutos)       │
└──────────────────────────────────────────────────┘
```

**Status possíveis:**
- ⚠️  **Pending Verification** - Aguardando propagação DNS
- ✅ **Verified** - Domínio verificado e pronto para uso!
- ❌ **Failed** - Registros DNS não encontrados (verifique se adicionou corretamente)

---

### Passo 3.3: Verificar Propagação DNS (Opcional)

Você pode verificar manualmente se os registros DNS foram propagados:

**Opção A: Usar ferramenta online**

1. Acesse: **https://dnschecker.org/**
2. Digite seu domínio (ex: `godevs.com.br`)
3. Selecione **"TXT"** no dropdown
4. Clique em **"Search"**
5. Verifique se aparece: `v=spf1 include:_spf.resend.com ~all`

**Opção B: Usar terminal (Windows)**

```bash
# Verificar registro SPF
nslookup -type=TXT godevs.com.br

# Verificar registro DKIM
nslookup -type=CNAME resend._domainkey.godevs.com.br

# Verificar registro DMARC
nslookup -type=TXT _dmarc.godevs.com.br
```

---

### Passo 3.4: Testar Envio de Email

Após o domínio ser **verificado** (✅), você pode testar o envio:

1. No código, o email do remetente já está configurado:

```typescript
from: "CRM@in100tiva.com"  // Email padrão configurado ✅
```

2. Tente enviar um email pelo sistema

---

## 🆘 PROBLEMAS COMUNS E SOLUÇÕES

### ❌ Problema 1: Não encontro "DNS Records" na Vercel

**Causa:** Seu domínio usa Nameservers Externos (não está gerenciado pela Vercel)

**Solução:**
1. Verifique onde você registrou o domínio (GoDaddy, Registro.br, etc)
2. Acesse o painel do registrador
3. Adicione os registros DNS lá

**Como saber onde está meu domínio?**
```bash
nslookup -type=NS godevs.com.br
```

Se aparecer algo como `ns1.godaddy.com`, seu domínio está na GoDaddy.

---

### ❌ Problema 2: Erro "CNAME already exists"

**Causa:** Já existe um registro CNAME com o mesmo nome

**Solução:**
1. Verifique se não há duplicatas
2. Remova o registro antigo antes de adicionar o novo
3. Ou edite o registro existente

---

### ❌ Problema 3: Verificação falha após 48h

**Causa:** Registros DNS não foram configurados corretamente

**Solução:**
1. Verifique se **copiou exatamente** os valores do Resend
2. Verifique se não adicionou espaços ou caracteres extras
3. Verifique o tipo de registro (TXT vs CNAME)
4. Tente remover e adicionar novamente

---

### ❌ Problema 4: "SPF record exists"

**Causa:** Você já tem um registro SPF configurado

**Solução:**
Você precisa **mesclar** os registros SPF. Exemplo:

**ERRADO (2 registros SPF):**
```
TXT @ v=spf1 include:_spf.google.com ~all
TXT @ v=spf1 include:_spf.resend.com ~all
```

**CORRETO (1 registro SPF mesclado):**
```
TXT @ v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

---

## 📞 PRECISA DE AJUDA?

Se encontrar dificuldades:

1. 📧 **Suporte Resend:** support@resend.com
2. 💬 **Documentação Vercel:** https://vercel.com/docs/concepts/projects/domains
3. 🤖 **Chame o assistente:** "preciso de ajuda com DNS do Resend"

---

## ✅ CHECKLIST FINAL

Antes de considerar concluído, verifique:

- [ ] Domínio adicionado no Resend
- [ ] 3 registros DNS copiados do Resend
- [ ] Registro SPF (TXT) adicionado na Vercel
- [ ] Registro DKIM (CNAME) adicionado na Vercel
- [ ] Registro DMARC (TXT) adicionado na Vercel
- [ ] Aguardou pelo menos 30 minutos
- [ ] Status no Resend: ✅ Verified
- [ ] Teste de envio bem-sucedido

---

## 🎉 PRONTO!

Seu domínio está configurado para enviar emails com o Resend! 🚀

Agora você pode:
- ✉️ Enviar emails do seu domínio
- 📊 Acompanhar estatísticas de entrega
- 🔄 Usar todos os recursos do Resend

---

**Última atualização:** Novembro 2024
**Versão:** 1.0

