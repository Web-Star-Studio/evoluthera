#!/bin/bash

# 📧 Script de Migração: Resend → Nodemailer
# Automatiza a migração do sistema de emails

set -e  # Parar execução em caso de erro

echo "🚀 Iniciando migração do sistema de emails..."
echo "📧 Resend → Nodemailer (Denomailer)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para printar com cor
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "supabase/config.toml" ]; then
    print_error "Execute este script na raiz do projeto (onde está o arquivo supabase/config.toml)"
    exit 1
fi

print_status "Diretório do projeto verificado"

# Etapa 1: Backup dos arquivos atuais
print_info "Etapa 1: Criando backup dos arquivos atuais..."

if [ -f "supabase/functions/add-patient/index.ts" ]; then
    cp supabase/functions/add-patient/index.ts supabase/functions/add-patient/index-resend-backup.ts
    print_status "Backup criado: add-patient/index-resend-backup.ts"
fi

if [ -f "supabase/functions/resend-credentials/index.ts" ]; then
    cp supabase/functions/resend-credentials/index.ts supabase/functions/resend-credentials/index-resend-backup.ts
    print_status "Backup criado: resend-credentials/index-resend-backup.ts"
fi

# Etapa 2: Substituir implementações
print_info "Etapa 2: Substituindo implementações..."

if [ -f "supabase/functions/add-patient/nodemailer-implementation.ts" ]; then
    cp supabase/functions/add-patient/nodemailer-implementation.ts supabase/functions/add-patient/index.ts
    print_status "add-patient/index.ts atualizado com Nodemailer"
else
    print_warning "Arquivo nodemailer-implementation.ts não encontrado para add-patient"
fi

if [ -f "supabase/functions/resend-credentials/nodemailer-implementation.ts" ]; then
    cp supabase/functions/resend-credentials/nodemailer-implementation.ts supabase/functions/resend-credentials/index.ts
    print_status "resend-credentials/index.ts atualizado com Nodemailer"
else
    print_warning "Arquivo nodemailer-implementation.ts não encontrado para resend-credentials"
fi

# Etapa 3: Configurar variáveis de ambiente
print_info "Etapa 3: Configuração das variáveis de ambiente..."
echo ""
print_warning "ATENÇÃO: Você precisa configurar as seguintes variáveis no Supabase:"
echo ""
echo "  1. No Dashboard: Project Settings → Edge Functions → Environment Variables"
echo "  2. Ou via CLI:"
echo ""
echo "     # Remover configuração antiga"
echo "     supabase secrets unset RESEND_API_KEY"
echo ""
echo "     # Configurar SMTP (exemplo Gmail):"
echo "     supabase secrets set SMTP_HOST=smtp.gmail.com"
echo "     supabase secrets set SMTP_PORT=587"
echo "     supabase secrets set SMTP_USERNAME=seu-email@gmail.com"
echo "     supabase secrets set SMTP_PASSWORD=sua-app-password"
echo "     supabase secrets set SMTP_FROM_EMAIL=noreply@evoluthera.app"
echo ""

read -p "Pressione Enter após configurar as variáveis de ambiente..."

# Etapa 4: Deploy das funções
print_info "Etapa 4: Deploy das Edge Functions..."

echo "Você deseja fazer o deploy das funções agora? (y/n)"
read -r deploy_choice

if [ "$deploy_choice" = "y" ] || [ "$deploy_choice" = "Y" ]; then
    print_info "Fazendo deploy da função add-patient..."
    if supabase functions deploy add-patient; then
        print_status "add-patient deployed com sucesso"
    else
        print_error "Erro no deploy da função add-patient"
    fi

    print_info "Fazendo deploy da função resend-credentials..."
    if supabase functions deploy resend-credentials; then
        print_status "resend-credentials deployed com sucesso"
    else
        print_error "Erro no deploy da função resend-credentials"
    fi
else
    print_info "Deploy pulado. Execute manualmente quando estiver pronto:"
    echo "  supabase functions deploy add-patient"
    echo "  supabase functions deploy resend-credentials"
fi

# Etapa 5: Teste
print_info "Etapa 5: Instruções de teste..."
echo ""
print_info "Para testar o sistema:"
echo ""
echo "1. Teste local:"
echo "   supabase functions serve add-patient --env-file .env"
echo ""
echo "2. Teste de produção (substitua os valores):"
echo "   curl -X POST https://SEU-PROJETO.supabase.co/functions/v1/add-patient \\"
echo "     -H \"Authorization: Bearer SEU-TOKEN\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"name\":\"Teste\",\"email\":\"teste@exemplo.com\",\"password\":\"123456\"}'"
echo ""

# Limpeza (opcional)
print_info "Limpeza (opcional):"
echo ""
echo "Deseja remover os arquivos de implementação temporários? (y/n)"
read -r cleanup_choice

if [ "$cleanup_choice" = "y" ] || [ "$cleanup_choice" = "Y" ]; then
    if [ -f "supabase/functions/add-patient/nodemailer-implementation.ts" ]; then
        rm supabase/functions/add-patient/nodemailer-implementation.ts
        print_status "Arquivo temporário removido: add-patient/nodemailer-implementation.ts"
    fi
    
    if [ -f "supabase/functions/resend-credentials/nodemailer-implementation.ts" ]; then
        rm supabase/functions/resend-credentials/nodemailer-implementation.ts
        print_status "Arquivo temporário removido: resend-credentials/nodemailer-implementation.ts"
    fi
fi

echo ""
print_status "Migração concluída!"
echo ""
print_info "Próximos passos:"
echo "1. ✅ Configurar variáveis SMTP no Supabase"
echo "2. ✅ Fazer deploy das funções (se não foi feito)"
echo "3. ✅ Testar envio de emails"
echo "4. ✅ Monitorar logs das Edge Functions"
echo ""
print_info "Documentação completa em: MIGRATION_RESEND_TO_NODEMAILER.md"
echo "" 