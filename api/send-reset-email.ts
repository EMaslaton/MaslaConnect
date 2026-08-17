import { Resend } from 'resend';

type ResetEmailPayload = {
  email?: string;
  resetUrl?: string;
};

const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
const resendFromAddress =
  process.env.RESEND_FROM_EMAIL || process.env.VITE_RESEND_FROM_EMAIL || 'MaslaConnect <onboarding@resend.dev>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!resend) {
    return res.status(500).json({ success: false, error: 'RESEND_API_KEY no está configurada' });
  }

  try {
    const body = (req.body || {}) as ResetEmailPayload;
    const email = body.email?.trim();
    const resetUrl = body.resetUrl?.trim();

    if (!email || !resetUrl) {
      return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
    }

    const htmlContent = `
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
    `;

    const response = await resend.emails.send({
      from: resendFromAddress,
      to: email,
      subject: 'Restablecer tu contraseña en MaslaConnect',
      html: htmlContent,
    });

    if (response.error) {
      return res.status(500).json({
        success: false,
        error:
          typeof response.error === 'string'
            ? response.error
            : 'Resend devolvió un error al enviar el email',
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido enviando email',
    });
  }
}