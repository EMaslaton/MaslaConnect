import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { Resend } from "resend";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const resendApiKey = env.RESEND_API_KEY || env.VITE_RESEND_API_KEY;
  const resendFromAddress =
    env.RESEND_FROM_EMAIL || env.VITE_RESEND_FROM_EMAIL || 'MaslaConnect <onboarding@resend.dev>';
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && {
        name: 'local-reset-email-api',
        configureServer(server: any) {
          server.middlewares.use('/api/send-reset-email', async (req: any, res: any, next: any) => {
            if (req.method !== 'POST') {
              return next();
            }

            if (!resend) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'RESEND_API_KEY no está configurada' }));
              return;
            }

            const body = await new Promise<string>((resolve) => {
              const chunks: Buffer[] = [];
              req.on('data', (chunk: Buffer) => chunks.push(chunk));
              req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            });

            try {
              const payload = JSON.parse(body || '{}');
              const email = String(payload.email || '').trim();
              const resetUrl = String(payload.resetUrl || '').trim();

              if (!email || !resetUrl) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Faltan datos obligatorios' }));
                return;
              }

              const response = await resend.emails.send({
                from: resendFromAddress,
                to: email,
                subject: 'Restablecer tu contraseña en MaslaConnect',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #111827; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); padding: 28px; text-align: center; color: #fff;">
                      <h1 style="margin: 0; font-size: 24px;">Restablecé tu contraseña</h1>
                      <p style="margin: 10px 0 0; opacity: 0.9;">MaslaConnect</p>
                    </div>
                    <div style="padding: 28px;">
                      <p style="margin: 0 0 16px; font-size: 16px;">Hola,</p>
                      <p style="margin: 0 0 20px; line-height: 1.6; color: #374151;">
                        Recibimos una solicitud para crear una nueva contraseña para tu cuenta. Tocá el botón para continuar.
                      </p>
                      <p style="text-align: center; margin: 28px 0;">
                        <a href="${resetUrl}" style="background: #1d4ed8; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 9999px; display: inline-block; font-weight: 600;">
                          Crear nueva contraseña
                        </a>
                      </p>
                      <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Si no pediste este cambio, podés ignorar este correo.
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 12px; word-break: break-all;">
                        ${resetUrl}
                      </p>
                    </div>
                  </div>
                `,
              });

              if (response.error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error:
                    typeof response.error === 'string'
                      ? response.error
                      : 'Resend devolvió un error al enviar el email',
                }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido enviando email',
              }));
            }
          });
        },
      },
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  };
});
