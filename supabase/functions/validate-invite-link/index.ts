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
    const { token } = JSON.parse(rawBody);
    if (!token) throw new Error("Token is required");

    // Busca o link
    const { data: invite, error } = await supabaseClient
      .from('invite_links')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !invite) {
      return new Response(JSON.stringify({ valid: false, reason: "Link não encontrado." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Verifica expiração e uso
    const createdAt = new Date(invite.created_at);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    if (invite.is_used || now > expiresAt) {
      return new Response(JSON.stringify({ valid: false, reason: "Este link expirou ou já foi utilizado." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ valid: true, psychologist_id: invite.psychologist_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ valid: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 