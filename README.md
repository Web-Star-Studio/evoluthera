# Documentação do Sistema Evoluthera

## Histórico de Versões

| Versão | Data       | Autor  | Mudanças                     |
| ------ | ---------- | ------ | ---------------------------- |
| 1.0    | 2024-05-26 | Gemini | Criação inicial do documento |

## 1. Introdução

Evoluthera é uma plataforma digital inovadora projetada para conectar psicólogos e pacientes, facilitando o acompanhamento terapêutico e o gerenciamento da saúde mental. A plataforma visa oferecer ferramentas intuitivas e eficazes para otimizar a jornada terapêutica, tanto para o profissional quanto para o paciente, incorporando recursos modernos como inteligência artificial e gamificação.

Este documento detalha a visão, arquitetura, funcionalidades e o estado atual de desenvolvimento do sistema Evoluthera.

## 2. Visão Geral do Sistema

O Evoluthera busca ser uma solução completa para a gestão da terapia psicológica, oferecendo um ambiente seguro e colaborativo.

### Objetivos Principais

**Para Psicólogos:**

* Gerenciamento de pacientes
* Criação e acompanhamento de anamneses
* Atribuição de tarefas
* Monitoramento de humor
* Geração de relatórios e insights baseados em IA

**Para Pacientes:**

* Interface amigável para registrar o humor
* Realizar tarefas terapêuticas
* Acompanhar o progresso
* Acessar o histórico de sessões
* Comunicação com o psicólogo

**Para Administradores:**

* Gerenciamento da plataforma
* Configurações do sistema, logs, faturamento e suporte

### Público-Alvo

* Psicólogos e Terapeutas
* Pacientes em acompanhamento psicológico
* Clínicas de psicologia (potencialmente no futuro)
* Administradores da plataforma

## 3. Arquitetura do Sistema

Evoluthera é construído sobre uma arquitetura moderna, separando o frontend do backend para maior escalabilidade e manutenibilidade.

### 3.1. Frontend

* **Framework Principal:** React com TypeScript
* **Build Tool:** Vite
* **Estilização:** Tailwind CSS e componentes Shadcn/UI
* **Estado da Aplicação:** Context API do React, hooks customizados
* **Roteamento:** React Router

### 3.2. Backend

* **Plataforma:** Supabase
* **Banco de Dados:** PostgreSQL
* **Autenticação:** Supabase Auth
* **Funções Serverless:** Funções específicas (ex: `add-patient`, `crisis-prediction`, `generate-invite-link`)
* **Armazenamento:** Supabase Storage

### 3.3. Principais Tecnologias e Bibliotecas

* React, TypeScript, Vite, Tailwind CSS, Shadcn/UI
* Supabase (Auth, DB, Functions, Storage)
* Recharts, ESLint, Prettier

## 4. Funcionalidades Principais

Sistema dividido por tipo de usuário:

### 4.1. Módulos Comuns

* Autenticação, recuperação de senha
* Landing Page
* Chat

### 4.2. Funcionalidades do Paciente

* Dashboard, registro e histórico de humor
* Gerenciamento de tarefas e diário
* Anamnese, gamificação, testes psicológicos
* Acompanhamento de progresso, configurações

### 4.3. Funcionalidades do Psicólogo

* Dashboard, gerenciamento de pacientes
* Anamnese e tarefas
* Monitoramento de humor, insights com IA
* Relatórios, notificações, gamificação
* Configurações

### 4.4. Funcionalidades do Administrador

* Dashboard, gerenciamento de usuários
* Faturamento, logs do sistema
* Documentos legais, comunicações, suporte
* Configurações do sistema

## 5. Backlog do Produto

### 5.1. Tarefas Concluídas

* Estrutura da aplicação, roteamento, autenticação
* Layouts, UI, Supabase functions, páginas básicas

### 5.2. Backlog para o MVP

**Alta Prioridade:**

* Paciente: Login, dashboard, humor, tarefas, chat
* Psicólogo: Login, dashboard, pacientes, tarefas, humor, chat
* Admin: Login, dashboard, usuários
* Geral: Termos de uso, testes E2E, deploy inicial

**Média Prioridade:**

* Histórico de humor, diário, notificações, relatórios, IA inicial

### 5.3. Sugestões Pós-MVP

* Sessões online, comunidade, metas
* Agendamento, prontuário, análise de dados
* Multiplataforma, IA avançada, gamificação, app móvel
* Integrações com wearables e sistemas externos

## 6. Pontos Críticos do Sistema

### Segurança e Privacidade

* Criptografia, controle de acesso, LGPD/HIPAA
* RLS e segurança Supabase

### Escalabilidade

* Design de banco, otimização de queries, funções eficientes

### Integração com IA

* Custos, ética, qualidade, explicabilidade

### Usabilidade

* Intuitivo, acessível, engajamento

### Conformidade Regulatória

* Regras específicas da área de saúde

### Manutenção de Supabase Functions

* Versionamento e complexidade

### Dependência do Supabase

* Limitações e custos

### Testes

* Estratégia completa: unitários, integração, E2E, segurança

## 7. Avaliação de Produção para um MVP

### 7.1. Infraestrutura Mínima

* Plano Supabase, backups, monitoramento

### 7.2. Deploy

* Frontend: Vercel, Netlify, Amplify
* Backend: Supabase CLI, ambientes separados
* Domínio e SSL

### 7.3. Monitoramento e Manutenção

* Monitoramento de erros e performance
* Logs, alertas, plano de backup
* Atualizações de segurança, suporte ao usuário

## 8. Estrutura do Repositório

```
public/
src/
  components/
  contexts/
  hooks/
  integrations/
  lib/
  pages/
  styles/ ou assets/
  types/
App.tsx
main.tsx
supabase/functions/
tailwind.config.ts
postcss.config.js
vite.config.ts
tsconfig*.json
package.json
README.md
```

## 9. Guia de Contribuição (Sugestão)

Para garantir a qualidade e consistência do código, sugere-se o uso de:

* Modelo de branching
* Pull Requests com revisão obrigatória
* Padrão de commits
* Testes automatizados
* Linting e formatação automatizada
