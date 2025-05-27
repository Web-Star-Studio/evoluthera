# Configuração do Envio de Emails - Add Patient Function

Esta função é responsável por criar novos pacientes e enviar emails com as credenciais de acesso.

## 🚨 Problema Identificado

Os pacientes não estão recebendo emails com as credenciais porque:

1. **Variável RESEND_API_KEY não configurada** no Supabase
2. **Domínio de email não verificado** no Resend

## 📋 Passos para Configurar

### 1. Obter a Chave da API do Resend

1. Acesse [https://resend.com](https://resend.com)
2. Faça login na sua conta
3. Vá em **API Keys** no menu lateral
4. Crie uma nova API key (ou use uma existente)
5. Copie a chave (formato: `re_xxxxxxxxxx`)

### 2. Verificar o Domínio no Resend

1. No painel do Resend, vá em **Domains**
2. Adicione o domínio `evoluthera.app` (ou seu domínio personalizado)
3. Configure os registros DNS conforme instruído
4. Aguarde a verificação

### 3. Configurar a Variável no Supabase

**Opção A: Via Dashboard do Supabase**
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Edge Functions** > **Manage secrets**
4. Adicione:
   - **Key**: `RESEND_API_KEY`
   - **Value**: sua chave do Resend (ex: `re_xxxxxxxxxx`)
5. Clique em **Save**

**Opção B: Via CLI do Supabase**
```bash
# Definir a variável individualmente
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx

# Ou criar um arquivo .env e definir múltiplas variáveis
echo "RESEND_API_KEY=re_xxxxxxxxxx" > supabase/.env
supabase secrets set --env-file supabase/.env
```

### 4. Testar a Configuração

```bash
# Executar o teste de email (local)
deno run --allow-env --allow-net supabase/functions/add-patient/test-email.ts

# Verificar os logs da função no Supabase
# Vá em Edge Functions > add-patient > Logs
```

## 🔍 Como Verificar se Está Funcionando

### 1. Verificar Variáveis de Ambiente
```bash
supabase secrets list
```

### 2. Testar Criação de Paciente

Use o formulário no dashboard do psicólogo ou teste via API:

```bash
curl -X POST https://phjpyojetgxfsmqhhjfa.supabase.co/functions/v1/add-patient \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Teste Email",
    "email": "teste@seudominio.com",
    "password": "senha123"
  }'
```

### 3. Verificar Logs

1. Acesse o Dashboard do Supabase
2. Vá em **Edge Functions** > **add-patient**
3. Clique em **Logs**
4. Procure por mensagens como:
   - ✅ `Email sent successfully`
   - ❌ `Error sending email`

## 🐛 Troubleshooting

### Email não está sendo enviado

1. **Verificar API Key**: Confirme se a `RESEND_API_KEY` está configurada
2. **Verificar domínio**: Certifique-se que o domínio está verificado no Resend
3. **Verificar logs**: Cheque os logs da função para erros específicos
4. **Verificar spam**: O email pode estar indo para a pasta de spam

### Mensagens de erro comuns

- `"Invalid API key"` → API key incorreta ou não configurada
- `"Domain not verified"` → Domínio não verificado no Resend
- `"Email address not allowed"` → Email de destino em lista negra

## 📝 Notas Importantes

- A função **não falha** se o email não for enviado (para evitar interromper a criação do paciente)
- Os erros de email são logados para debug
- O paciente é criado mesmo se o email falhar
- Use emails de teste inicialmente para verificar a configuração

## 🔄 Próximos Passos

1. Configurar a API key do Resend
2. Verificar o domínio
3. Testar com um email real
4. Monitorar os logs para confirmar funcionamento
5. Implementar notificações para psicólogos quando emails falharem (opcional) 