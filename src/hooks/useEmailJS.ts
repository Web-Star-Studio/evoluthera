import { useState } from 'react';
import emailjs from '@emailjs/browser';

// Configurações do EmailJS (devem estar nas variáveis de ambiente)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

interface EmailData {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  from_name?: string;
  reply_to?: string;
}

interface UseEmailJSReturn {
  sendEmail: (data: EmailData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export const useEmailJS = (): UseEmailJSReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendEmail = async (data: EmailData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Verificar se as configurações estão definidas
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error('Configurações do EmailJS não encontradas. Verifique as variáveis de ambiente.');
      }

      // Preparar dados para o template
      const templateParams = {
        to_email: data.to_email,
        to_name: data.to_name,
        subject: data.subject,
        message: data.message,
        from_name: data.from_name || 'Equipe Evolut',
        reply_to: data.reply_to || 'noreply@evoluthera.app',
        // Dados adicionais que podem ser úteis no template
        company_name: 'Evolut',
        website_url: window.location.origin,
        current_year: new Date().getFullYear(),
      };

      // Enviar email usando EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (response.status === 200) {
        setSuccess(true);
        console.log('✅ Email enviado com sucesso:', response);
      } else {
        throw new Error(`Erro no envio: ${response.text}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao enviar email';
      setError(errorMessage);
      console.error('❌ Erro ao enviar email:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    isLoading,
    error,
    success,
  };
};

// Hook específico para envio de credenciais de pacientes
export const usePatientCredentialsEmail = () => {
  const { sendEmail, isLoading, error, success } = useEmailJS();

  const sendPatientCredentials = async (patient: {
    name: string;
    email: string;
    password: string;
    psychologistName?: string;
  }) => {
    const message = `
      Olá ${patient.name},

      Você foi adicionado à plataforma Evolut pelo seu psicólogo${patient.psychologistName ? ` ${patient.psychologistName}` : ''}. 

      Esta é uma plataforma segura para acompanhamento psicológico onde você poderá registrar seu humor, realizar tarefas terapêuticas e se comunicar com seu psicólogo.

      📧 SUAS CREDENCIAIS DE ACESSO:
      • Email: ${patient.email}
      • Senha: ${patient.password}

      🔒 IMPORTANTE: Por motivos de segurança, recomendamos que você altere sua senha após o primeiro acesso.

      Para acessar a plataforma, clique no link: ${window.location.origin}/login

      Se você tiver alguma dúvida sobre como usar a plataforma, entre em contato com seu psicólogo.

      Atenciosamente,
      Equipe Evolut
    `;

    await sendEmail({
      to_email: patient.email,
      to_name: patient.name,
      subject: 'Bem-vindo à plataforma Evolut - Suas credenciais de acesso',
      message,
      from_name: 'Equipe Evolut',
      reply_to: 'noreply@evoluthera.app',
    });
  };

  return {
    sendPatientCredentials,
    isLoading,
    error,
    success,
  };
};

// Hook para reenvio de credenciais
export const useResendCredentialsEmail = () => {
  const { sendEmail, isLoading, error, success } = useEmailJS();

  const resendCredentials = async (patient: {
    name: string;
    email: string;
    hasNewPassword?: boolean;
    newPassword?: string;
    psychologistName?: string;
  }) => {
    const message = patient.hasNewPassword ? `
      Olá ${patient.name},

      Sua senha foi redefinida conforme solicitado pelo seu psicólogo${patient.psychologistName ? ` ${patient.psychologistName}` : ''}.

      📧 SUAS CREDENCIAIS DE ACESSO:
      • Email: ${patient.email}
      • Nova senha: ${patient.newPassword}

      ⚠️ IMPORTANTE: Esta é uma nova senha temporária. Por motivos de segurança, recomendamos que você altere sua senha após fazer login.

      Para acessar a plataforma, clique no link: ${window.location.origin}/login

      Atenciosamente,
      Equipe Evolut
    ` : `
      Olá ${patient.name},

      Aqui estão suas credenciais de acesso à plataforma Evolut:

      📧 SUAS CREDENCIAIS DE ACESSO:
      • Email: ${patient.email}
      • Senha: Use a senha que foi fornecida anteriormente pelo seu psicólogo

      💡 NOTA: Se você esqueceu sua senha, entre em contato com seu psicólogo para gerar uma nova.

      Para acessar a plataforma, clique no link: ${window.location.origin}/login

      Atenciosamente,
      Equipe Evolut
    `;

    await sendEmail({
      to_email: patient.email,
      to_name: patient.name,
      subject: patient.hasNewPassword 
        ? 'Nova senha de acesso - Plataforma Evolut'
        : 'Reenvio de credenciais - Plataforma Evolut',
      message,
      from_name: 'Equipe Evolut',
      reply_to: 'noreply@evoluthera.app',
    });
  };

  return {
    resendCredentials,
    isLoading,
    error,
    success,
  };
}; 