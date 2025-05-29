# 📧 Exemplos de Configuração - Sistema de Emails

## 🎯 **Variáveis de Ambiente Necessárias**

### **OPÇÃO 1: SMTP/Nodemailer** ⭐ (Recomendado)

#### **Gmail (Gratuito)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-app-password  # Gerar em: https://myaccount.google.com/apppasswords
SMTP_FROM_EMAIL=noreply@evoluthera.app
```

#### **SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=sua-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@seudominio.com
```

#### **Mailgun**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@seudominio.mailgun.org
SMTP_PASSWORD=sua-mailgun-api-key
SMTP_FROM_EMAIL=noreply@seudominio.com
```

#### **Amazon SES**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=sua-access-key-id
SMTP_PASSWORD=sua-secret-access-key
SMTP_FROM_EMAIL=noreply@seudominio.com
```

### **OPÇÃO 2: EmailJS** (Frontend)

#### **Configuração no arquivo `.env`**
```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx  
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

#### **Passos para configurar EmailJS:**
1. Criar conta em [https://www.emailjs.com/](https://www.emailjs.com/)
2. Configurar um serviço de email (Gmail, Outlook, etc.)
3. Criar um template de email
4. Obter as chaves e IDs necessários

### **OPÇÃO 3: Resend** (Sistema atual)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxx
```

## 🚀 **Como Configurar no Supabase**

### **Via Dashboard**
1. Acesse: **Project Settings → Edge Functions → Environment Variables**
2. Adicione cada variável individualmente

### **Via CLI**
```bash
# SMTP/Nodemailer
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USERNAME=seu-email@gmail.com
supabase secrets set SMTP_PASSWORD=sua-app-password
supabase secrets set SMTP_FROM_EMAIL=noreply@evoluthera.app

# EmailJS (no arquivo .env local)
echo "VITE_EMAILJS_SERVICE_ID=service_xxxxxxx" >> .env
echo "VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx" >> .env
echo "VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx" >> .env
```

## 📊 **Comparação das Opções**

| Característica | SMTP/Nodemailer | EmailJS | Resend |
|----------------|-----------------|---------|--------|
| **Custo** | Gratuito (Gmail) / Pago | Gratuito (200/mês) | Pago |
| **Configuração** | Média | Fácil | Fácil |
| **Flexibilidade** | Alta | Média | Baixa |
| **Segurança** | Alta | Média | Alta |
| **Onde executa** | Backend | Frontend | Backend |
| **Dependência** | Qualquer SMTP | EmailJS | Resend |

## 🎯 **Recomendações**

### **Para Desenvolvimento**
- **EmailJS**: Rápido de configurar, bom para testes

### **Para Produção**
- **SMTP/Nodemailer**: Mais flexível e econômico
- **Gmail**: Para baixo volume (até 500 emails/dia)
- **SendGrid/Mailgun**: Para alto volume

### **Para Migração Gradual**
1. Manter Resend funcionando
2. Implementar nova opção em paralelo
3. Testar completamente
4. Migrar gradualmente
5. Desativar Resend 