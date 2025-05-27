import { Resend } from "npm:resend@2.0.0";

// Test function to verify Resend configuration
export async function testEmailSending() {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.error("❌ RESEND_API_KEY not found in environment variables");
    return false;
  }
  
  console.log(`✅ RESEND_API_KEY found (first 10 chars): ${resendApiKey.substring(0, 10)}...`);
  
  const resend = new Resend(resendApiKey);
  
  try {
    const testEmail = await resend.emails.send({
      from: "Evolut Test <test@evoluthera.app>",
      to: ["test@exemplo.com"],
      subject: "Teste de configuração do Resend",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #10b981;">Teste de Email - Evolut</h1>
          <p>Se você está recebendo este email, a configuração do Resend está funcionando corretamente!</p>
          <p>Data do teste: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `,
    });
    
    console.log("✅ Email enviado com sucesso:", testEmail.id);
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return false;
  }
}

// Test the configuration when this file is run directly
if (import.meta.main) {
  console.log("🧪 Testando configuração do Resend...");
  await testEmailSending();
} 