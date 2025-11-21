# ⚡ Guia Rápido: DNS Resend + Vercel

## 🚀 Resumo em 3 Passos

### 1️⃣ COPIAR DO RESEND

Acesse: https://resend.com/domains → Add Domain → Digite seu domínio

Você receberá 3 registros:

| # | Tipo | Nome | Valor |
|---|------|------|-------|
| 1 | TXT | `@` | `v=spf1 include:_spf.resend.com ~all` |
| 2 | CNAME | `resend._domainkey` | `resend._domainkey.resend.com` |
| 3 | TXT | `_dmarc` | `v=DMARC1; p=none` |

---

### 2️⃣ ADICIONAR NA VERCEL

**Caminho:** Vercel Dashboard → Seu Projeto → Settings → Domains → Scroll down → DNS Records

Para cada registro acima:

1. Clique em **"+ Add Record"**
2. Selecione o **Type** (TXT ou CNAME)
3. Cole o **Name**
4. Cole o **Value**
5. Clique em **"Add"**

---

### 3️⃣ VERIFICAR

1. Aguarde **30 minutos** (propagação DNS)
2. Volte para: https://resend.com/domains
3. Clique em **"Verify"** no seu domínio
4. Status deve mudar para: ✅ **Verified**

---

## 📸 Exemplo Visual dos Registros na Vercel

```
DNS Records
┌─────────────────────────────────────────────────────┐
│ [+ Add Record]                                      │
├─────────────────────────────────────────────────────┤
│ Type  │ Name                │ Value                 │
├─────────────────────────────────────────────────────┤
│ TXT   │ @                   │ v=spf1 include:...   │
│ CNAME │ resend._domainkey   │ resend._domainkey... │
│ TXT   │ _dmarc              │ v=DMARC1; p=none     │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Valores Prontos para Copy/Paste

```
REGISTRO 1 (SPF):
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

REGISTRO 2 (DKIM):
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com

REGISTRO 3 (DMARC):
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none
```

---

## ⚠️ Atenções

- ❌ **NÃO** adicione ponto final (`.`) nos valores
- ❌ **NÃO** adicione `www.` ou `https://` no domínio
- ✅ **SIM** aguarde pelo menos 30 minutos antes de verificar
- ✅ **SIM** copie exatamente como mostrado no Resend

---

## 🆘 Não Encontro "DNS Records" na Vercel?

Seu domínio pode estar usando **Nameservers Externos**. Verifique:

```bash
nslookup -type=NS seudominio.com
```

Se aparecer algo diferente de `vercel-dns.com`, você precisa adicionar os registros no **provedor original** do domínio (GoDaddy, Registro.br, etc).

---

## ✅ Teste Final

Após verificação, teste no código:

```typescript
from: "noreply@seudominio.com"  // Use seu domínio verificado ✅
```

---

**Ver guia completo:** `GUIA_DNS_RESEND_VERCEL.md`

