import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface AddPatientRequest {
  name: string;
  email: string;
  password: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[ADD-PATIENT] ${step}`, details ? JSON.stringify(details) : '');
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
    logStep("Psychologist authenticated", { id: psychologist.id, email: psychologist.email });

    // Verificar se é psicólogo
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('id', psychologist.id)
      .single();

    if (profile?.user_type !== 'psychologist') {
      throw new Error("Only psychologists can add patients");
    }

    const { name, email, password }: AddPatientRequest = await req.json();
    logStep("Request data received", { name, email });

    // Verificar se o email já existe na tabela profiles
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      throw new Error("Um usuário com este email já existe no sistema");
    }

    logStep("Email check passed - no existing user found");

    // Criar usuário no auth com a senha definida pelo psicólogo
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        user_type: 'patient'
      }
    });

    if (createError) throw new Error(`Error creating user: ${createError.message}`);
    logStep("User created in auth", { userId: newUser.user?.id });

    // Criar perfil do paciente
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: newUser.user!.id,
        name,
        email,
        user_type: 'patient'
      });

    if (profileError) throw new Error(`Error creating profile: ${profileError.message}`);
    logStep("Patient profile created");

    // Criar relacionamento paciente-psicólogo
    const { error: relationError } = await supabaseClient
      .from('patients')
      .insert({
        psychologist_id: psychologist.id,
        patient_id: newUser.user!.id,
        status: 'active'
      });

    if (relationError) throw new Error(`Error creating patient relationship: ${relationError.message}`);
    logStep("Patient-psychologist relationship created");

    // Criar registro de ativação
    const { data: activation, error: activationError } = await supabaseClient
      .from('patient_activations')
      .insert({
        psychologist_id: psychologist.id,
        patient_id: newUser.user!.id,
        status: 'pending'
      })
      .select()
      .single();

    if (activationError) throw new Error(`Error creating activation: ${activationError.message}`);
    logStep("Patient activation record created", { activationId: activation.id });

    // Enviar email com credenciais
    try {
      const emailResponse = await resend.emails.send({
        from: "Evolut <noreply@evoluthera.app>",
        to: [email],
        subject: "Bem-vindo à plataforma Evolut - Suas credenciais de acesso",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0; font-size: 28px;">Bem-vindo à Evolut!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Olá <strong>${name}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Você foi adicionado à plataforma Evolut pelo seu psicólogo. Esta é uma plataforma segura para acompanhamento psicológico onde você poderá registrar seu humor, realizar tarefas terapêuticas e se comunicar com seu psicólogo.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Suas credenciais de acesso:</h3>
              <p style="margin: 8px 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0; font-size: 16px;"><strong>Senha:</strong> ${password}</p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">
                <em>Por motivos de segurança, recomendamos que você altere sua senha após o primeiro acesso.</em>
              </p>
            </div>
            
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
        `,
      });

      logStep("Email sent successfully", { emailId: emailResponse.id });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      logStep("Email sending failed", { error: emailError.message });
      // Não falhar a operação por causa do email - mas logar o erro
    }

    return new Response(JSON.stringify({
      success: true,
      patient: {
        id: newUser.user!.id,
        name,
        email,
        activationId: activation.id
      },
      message: "Paciente adicionado com sucesso. Email enviado com credenciais."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
