import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  login: string;
  password: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, login, password, loginUrl }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Sistema de Gestão <onboarding@resend.dev>",
      to: [email],
      subject: "Bem-vindo ao Sistema de Gestão da Clínica!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Bem-vindo!</h1>
              </div>
              <div class="content">
                <h2>Olá, ${name}!</h2>
                <p>Sua conta foi criada com sucesso! Estamos muito felizes em ter você conosco.</p>
                
                <div class="credentials">
                  <h3>📋 Suas Credenciais de Acesso:</h3>
                  <p><strong>Usuário:</strong> ${login}</p>
                  <p><strong>Senha:</strong> ${password}</p>
                  <p><strong>URL de Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
                </div>

                <p>⚠️ <strong>Importante:</strong> Por segurança, recomendamos que você altere sua senha após o primeiro login.</p>

                <div style="text-align: center;">
                  <a href="${loginUrl}" class="button">Acessar Sistema</a>
                </div>

                <p>Se você tiver qualquer dúvida, estamos à disposição para ajudar!</p>
              </div>
              <div class="footer">
                <p>Este é um email automático, por favor não responda.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
