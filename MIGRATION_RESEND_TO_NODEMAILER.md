# 📧 Migração: Resend → Nodemailer (Denomailer)

## 🎯 **Objetivo**
Substituir o **Resend** por **Nodemailer** (via Denomailer para Deno) como sistema de envio de emails nas Edge Functions do Supabase.

## 🔄 **Principais Mudanças**

### **Antes (Resend)**
```typescript
import { Resend } from "npm:resend@2.0.0";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

await resend.emails.send({
  from: "Evolut <noreply@evoluthera.app>",
  to: [email],
  subject: "...",
  html: "..."
});
```

### **Depois (Nodemailer/Denomailer)**
```typescript
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const smtpClient = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST") || "smtp.gmail.com",
    port: Number.parseInt(Deno.env.get("SMTP_PORT") || "587"),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USERNAME"),
      password: Deno.env.get("SMTP_PASSWORD"),
    },
  },
});

await smtpClient.send({
  from: Deno.env.get("SMTP_FROM_EMAIL") || "noreply@evoluthera.app",
  to: email,
  subject: "...",
  html: "..."
});
```

## ⚙️ **Configuração das Variáveis de Ambiente**

### **1. No Supabase Dashboard**
Acesse: **Project Settings → Edge Functions → Environment Variables**

**Remover:**
- `RESEND_API_KEY`

**Adicionar:**
- `SMTP_HOST` - Servidor SMTP (ex: smtp.gmail.com)
- `SMTP_PORT` - Porta SMTP (ex: 587)
- `SMTP_USERNAME` - Usuário/email SMTP
- `SMTP_PASSWORD` - Senha/app password
- `SMTP_FROM_EMAIL` - Email remetente (ex: noreply@evoluthera.app)

### **2. Via CLI do Supabase**
```bash
# Remover configuração antiga
supabase secrets unset RESEND_API_KEY

# Configurar novo provedor SMTP
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USERNAME=seu-email@gmail.com
supabase secrets set SMTP_PASSWORD=sua-app-password
supabase secrets set SMTP_FROM_EMAIL=noreply@evoluthera.app
```

## 🌐 **Provedores SMTP Populares**

### **1. Gmail (Gratuito)** ⭐
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-app-password  # Gerar em: https://myaccount.google.com/apppasswords
SMTP_FROM_EMAIL=seu-email@gmail.com
```

### **2. SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=sua-api-key-sendgrid
SMTP_FROM_EMAIL=noreply@seudominio.com
```

### **3. Mailgun**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@seudominio.mailgun.org
SMTP_PASSWORD=sua-api-key-mailgun
SMTP_FROM_EMAIL=noreply@seudominio.com
```

### **4. Amazon SES**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=sua-access-key-id
SMTP_PASSWORD=sua-secret-access-key
SMTP_FROM_EMAIL=noreply@seudominio.com
```

## 🚀 **Passo a Passo da Migração**

### **Etapa 1: Backup dos Arquivos Atuais**
```bash
cp supabase/functions/add-patient/index.ts supabase/functions/add-patient/index-resend-backup.ts
cp supabase/functions/resend-credentials/index.ts supabase/functions/resend-credentials/index-resend-backup.ts
```

### **Etapa 2: Substituir Implementações**
```bash
# Copiar novas implementações
cp supabase/functions/add-patient/nodemailer-implementation.ts supabase/functions/add-patient/index.ts
cp supabase/functions/resend-credentials/nodemailer-implementation.ts supabase/functions/resend-credentials/index.ts
```

### **Etapa 3: Configurar Variáveis**
Configure as variáveis de ambiente conforme o provedor escolhido (seção acima).

### **Etapa 4: Deploy das Funções**
```bash
supabase functions deploy add-patient
supabase functions deploy resend-credentials
```

### **Etapa 5: Testar**
```bash
# Teste a função add-patient
curl -X POST https://seu-projeto.supabase.co/functions/v1/add-patient \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@exemplo.com","password":"123456"}'
```

## ✅ **Vantagens da Migração**

### **Custo**
- **Resend:** Pago (após limite gratuito)
- **SMTP/Gmail:** Gratuito para volumes baixos

### **Flexibilidade**
- **Resend:** Limitado ao serviço
- **SMTP:** Qualquer provedor SMTP

### **Controle**
- **Resend:** Dependente do serviço externo
- **SMTP:** Controle total sobre configuração

### **Compatibilidade**
- **Resend:** API específica
- **SMTP:** Padrão universal

## 🔧 **Troubleshooting**

### **Gmail App Passwords**
1. Ativar autenticação de 2 fatores
2. Gerar App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Usar a senha gerada em `SMTP_PASSWORD`

### **Erro de Conexão SMTP**
```bash
# Verificar variáveis
supabase secrets list

# Testar conexão SMTP localmente
telnet smtp.gmail.com 587
```

### **Emails na Pasta Spam**
- Verificar SPF/DKIM do domínio
- Usar domínio verificado
- Evitar palavras spam no assunto

## 📝 **Notas Importantes**

1. **Rate Limits**: Gmail tem limite de 500 emails/dia para contas gratuitas
2. **Domínio**: Para produção, usar domínio próprio verificado
3. **Monitoramento**: Implementar logs para acompanhar entregas
4. **Fallback**: Considerar múltiplos provedores para redundância

## 🧪 **Testando Localmente**

### **Arquivo `.env` Local**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-app-password
SMTP_FROM_EMAIL=seu-email@gmail.com
```

### **Comando de Teste**
```bash
supabase functions serve add-patient --env-file .env
```

## 📚 **Recursos Adicionais**

- [Denomailer Documentation](https://deno.land/x/denomailer)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api) 