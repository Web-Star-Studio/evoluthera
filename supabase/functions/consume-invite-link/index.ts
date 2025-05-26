import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    // LOG O BODY RECEBIDO
    const rawBody = await req.text();
    console.log("BODY RECEBIDO:", rawBody);
    const { token, name, email, password } = JSON.parse(rawBody);
    if (!token || !name || !email || !password) throw new Error("Dados obrigatórios ausentes");

    // Busca o link
    const { data: invite, error } = await supabaseClient
      .from('invite_links')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !invite) {
      return new Response(JSON.stringify({ success: false, reason: "Link não encontrado." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Verifica expiração e uso
    const createdAt = new Date(invite.created_at);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    if (invite.is_used || now > expiresAt) {
      return new Response(JSON.stringify({ success: false, reason: "Este link expirou ou já foi utilizado." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Cria usuário no Auth
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        user_type: 'patient'
      }
    });
    if (createError) throw new Error(`Erro ao criar usuário: ${createError.message}`);

    // Cria perfil
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: newUser.user!.id,
        name,
        email,
        user_type: 'patient'
      });
    if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`);

    // Marca invite como usado
    const { error: updateError } = await supabaseClient
      .from('invite_links')
      .update({ is_used: true })
      .eq('id', invite.id);
    if (updateError) throw new Error(`Erro ao atualizar invite: ${updateError.message}`);

    // Faz login automático
    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw new Error(`Erro ao autenticar: ${signInError.message}`);

    return new Response(JSON.stringify({
      success: true,
      patient: {
        id: newUser.user!.id,
        name,
        email,
      },
      session: sessionData.session,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 