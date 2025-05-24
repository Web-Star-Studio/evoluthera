
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

const logStep = (step: string, details?: any) => {
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

    // Verificar se o email já existe
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(email);
    if (existingUser.user) {
      throw new Error("Um usuário com este email já existe no sistema");
    }

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
        from: "Evolut <noreply@yourdomain.com>",
        to: [email],
        subject: "Bem-vindo à plataforma Evolut - Suas credenciais de acesso",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #1893f8; text-align: center;">Bem-vindo à Evolut!</h1>
            <p>Olá <strong>${name}</strong>,</p>
            <p>Você foi adicionado à plataforma Evolut pelo seu psicólogo. Aqui estão suas credenciais de acesso:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Senha:</strong> A senha foi definida pelo seu psicólogo</p>
            </div>
            
            <p>Para acessar a plataforma, clique no link abaixo:</p>
            <p style="text-align: center;">
              <a href="${req.headers.get("origin") || 'https://your-domain.com'}/login" 
                 style="background-color: #1893f8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Acessar Plataforma
              </a>
            </p>
            
            <p>Se você tiver alguma dúvida, entre em contato com seu psicólogo.</p>
            <p>Atenciosamente,<br>Equipe Evolut</p>
          </div>
        `,
      });

      logStep("Email sent successfully", { emailId: emailResponse.id });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Não falhar a operação por causa do email
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
