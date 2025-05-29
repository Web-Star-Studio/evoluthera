import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuração do cliente SMTP usando variáveis de ambiente
const createSMTPClient = () => {
  return new SMTPClient({
    connection: {
      hostname: Deno.env.get("SMTP_HOST") || "smtp.gmail.com",
      port: Number.parseInt(Deno.env.get("SMTP_PORT") || "587"),
      tls: true,
      auth: {
        username: Deno.env.get("SMTP_USERNAME") || "",
        password: Deno.env.get("SMTP_PASSWORD") || "",
      },
    },
  });
};

interface ResendCredentialsRequest {
  patientId: string;
  tempPassword?: string; // Optional temporary password to send
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[RESEND-CREDENTIALS] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const psychologist = userData.user;
    if (!psychologist?.email) throw new Error("Psychologist not authenticated");
    logStep("Psychologist authenticated", { id: psychologist.id });

    // Verificar se é psicólogo
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('id', psychologist.id)
      .single();

    if (profile?.user_type !== 'psychologist') {
      throw new Error("Only psychologists can resend credentials");
    }

    const { patientId, tempPassword }: ResendCredentialsRequest = await req.json();
    logStep("Request data received", { patientId, hasTempPassword: !!tempPassword });

    // Buscar dados do paciente
    const { data: patient, error: patientError } = await supabaseClient
      .from('profiles')
      .select('name, email')
      .eq('id', patientId)
      .eq('user_type', 'patient')
      .single();

    if (patientError || !patient) {
      throw new Error("Patient not found");
    }

    // Verificar se o paciente é do psicólogo logado
    const { data: relationship } = await supabaseClient
      .from('patients')
      .select('id')
      .eq('patient_id', patientId)
      .eq('psychologist_id', psychologist.id)
      .single();

    if (!relationship) {
      throw new Error("Patient does not belong to this psychologist");
    }

    logStep("Patient found and verified", { patientEmail: patient.email, patientName: patient.name });

    // Se foi fornecida uma senha temporária, resetar a senha do usuário
    if (tempPassword) {
      const { error: resetError } = await supabaseClient.auth.admin.updateUserById(
        patientId,
        { password: tempPassword }
      );

      if (resetError) {
        logStep("Password reset failed", { error: resetError.message });
        throw new Error(`Error resetting password: ${resetError.message}`);
      }

      logStep("Password reset successful");
    }

    // Enviar email com credenciais usando SMTP
    try {
      const emailContent = tempPassword ? {
        subject: "Nova senha de acesso - Plataforma Evolut",
        passwordInfo: `<strong>Nova senha:</strong> ${tempPassword}`,
        additionalInfo: `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Importante:</strong> Esta é uma nova senha temporária. Por motivos de segurança, 
              recomendamos que você altere sua senha após fazer login.
            </p>
          </div>
        `
      } : {
        subject: "Reenvio de credenciais - Plataforma Evolut",
        passwordInfo: `<strong>Senha:</strong> Use a senha que foi fornecida anteriormente pelo seu psicólogo`,
        additionalInfo: `
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              Se você esqueceu sua senha, entre em contato com seu psicólogo para gerar uma nova.
            </p>
          </div>
        `
      };

      const htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Evolut</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Olá <strong>${patient.name}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            ${tempPassword 
              ? 'Sua senha foi redefinida conforme solicitado pelo seu psicólogo.' 
              : 'Aqui estão suas credenciais de acesso à plataforma Evolut.'
            }
          </p>
          
          <div style="background-color: #f3f4f6; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Suas credenciais de acesso:</h3>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Email:</strong> ${patient.email}</p>
            <p style="margin: 8px 0; font-size: 16px;">${emailContent.passwordInfo}</p>
          </div>
          
          ${emailContent.additionalInfo}
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${req.headers.get("origin") || 'https://evoluthera.app'}/login" 
               style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600;">
              Acessar Plataforma
            </a>
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280;">
              Se você tiver alguma dúvida sobre como usar a plataforma, entre em contato com seu psicólogo. 
              Em caso de problemas técnicos, nossa equipe de suporte está disponível.
            </p>
            
            <p style="font-size: 14px; margin-top: 20px; color: #374151;">
              Atenciosamente,<br>
              <strong>Equipe Evolut</strong>
            </p>
          </div>
        </div>
      `;

      const smtpClient = createSMTPClient();
      await smtpClient.send({
        from: Deno.env.get("SMTP_FROM_EMAIL") || "noreply@evoluthera.app",
        to: patient.email,
        subject: emailContent.subject,
        html: htmlContent,
      });

      logStep("Email sent successfully via SMTP");

      return new Response(JSON.stringify({
        success: true,
        message: `Credenciais ${tempPassword ? 'com nova senha' : ''} enviadas para ${patient.email}`,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (emailError) {
      console.error("Error sending email:", emailError);
      logStep("Email sending failed", { error: (emailError as Error).message });
      
      return new Response(JSON.stringify({
        success: false,
        message: "Erro ao enviar email. Verifique a configuração do SMTP."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 