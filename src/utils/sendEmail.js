import axios from "axios";

/**
 * Sends a transactional email through the Resend API.
 * Requires RESEND_API_KEY in the environment; EMAIL_FROM is optional and
 * falls back to Resend's shared test sender, which needs no domain setup.
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("sendEmail: RESEND_API_KEY is not set, skipping send to", to);
    throw new Error("Email service is not configured");
  }

  const from = process.env.EMAIL_FROM || "MIKI Trading <onboarding@resend.dev>";

  await axios.post(
    "https://api.resend.com/emails",
    { from, to, subject, html, text },
    { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } },
  );
}

/** Six-digit numeric code, as a string so leading zeros are preserved. */
export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendVerificationCodeEmail(to, code) {
  await sendEmail({
    to,
    subject: "Tu código de verificación — MIKI Trading",
    text: `Tu código de verificación es ${code}. Vence en 15 minutos.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 12px;color:#111827;">Confirmá tu email</h2>
        <p style="color:#4b5563;font-size:14px;">Usá este código para activar tu cuenta de MIKI Trading Journal:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:6px;background:#f4f4f6;border-radius:10px;padding:16px;text-align:center;margin:16px 0;color:#111827;">${code}</div>
        <p style="color:#9ca3af;font-size:12px;">Vence en 15 minutos. Si no creaste esta cuenta, podés ignorar este email.</p>
      </div>
    `,
  });
}
