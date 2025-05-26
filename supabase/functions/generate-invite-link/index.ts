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
    // Autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const psychologist = userData.user;
    if (!psychologist?.id) throw new Error("Psychologist not authenticated");

    // Verifica se é psicólogo
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('id', psychologist.id)
      .single();

    if (profile?.user_type !== 'psychologist') {
      throw new Error("Only psychologists can generate invite links");
    }

    // Gera token
    const inviteToken = crypto.randomUUID();

    // Salva no banco
    const { data: invite, error: inviteError } = await supabaseClient
      .from('invite_links')
      .insert({
        token: inviteToken,
        psychologist_id: psychologist.id,
      })
      .select()
      .single();

    if (inviteError) throw new Error(`Error creating invite link: ${inviteError.message}`);

    // Monta URL
    const origin = req.headers.get("origin") || "https://your-domain.com";
    const inviteUrl = `${origin}/invite/${inviteToken}`;

    return new Response(JSON.stringify({
      success: true,
      url: inviteUrl,
      token: inviteToken,
      invite_id: invite.id,
      created_at: invite.created_at,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 