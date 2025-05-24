
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[PROCESS-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
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

    const { activationId } = await req.json();
    logStep("Request data received", { activationId });

    // Buscar dados da ativação
    const { data: activation, error: activationError } = await supabaseClient
      .from('patient_activations')
      .select(`
        *,
        patient:profiles!patient_activations_patient_id_fkey(name, email)
      `)
      .eq('id', activationId)
      .eq('psychologist_id', psychologist.id)
      .single();

    if (activationError || !activation) {
      throw new Error("Activation not found or access denied");
    }

    if (activation.status !== 'pending') {
      throw new Error("This activation has already been processed");
    }

    logStep("Activation found", { activationId, patientEmail: activation.patient.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verificar se já existe customer do psicólogo
    const customers = await stripe.customers.list({ 
      email: psychologist.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: psychologist.email,
        metadata: {
          psychologist_id: psychologist.id
        }
      });
      customerId = customer.id;
    }

    logStep("Stripe customer ready", { customerId });

    // Criar sessão de pagamento para taxa de ativação
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Ativação de Paciente: ${activation.patient.name}`,
              description: `Taxa de ativação para o paciente ${activation.patient.email}`,
            },
            unit_amount: Math.round(activation.activation_fee * 100), // Converter para centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/psychologist-dashboard?payment=success&activation=${activationId}`,
      cancel_url: `${req.headers.get("origin")}/psychologist-dashboard?payment=cancelled`,
      metadata: {
        activation_id: activationId,
        psychologist_id: psychologist.id,
        patient_id: activation.patient_id
      }
    });

    logStep("Stripe session created", { sessionId: session.id, sessionUrl: session.url });

    // Atualizar ativação com payment intent
    const { error: updateError } = await supabaseClient
      .from('patient_activations')
      .update({ 
        stripe_payment_intent_id: session.payment_intent as string
      })
      .eq('id', activationId);

    if (updateError) {
      logStep("Error updating activation", { error: updateError });
    }

    return new Response(JSON.stringify({ 
      sessionUrl: session.url,
      sessionId: session.id 
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
