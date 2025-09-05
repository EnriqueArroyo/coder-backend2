// src/utils/mailer.js
import nodemailer from "nodemailer";

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return cachedTransporter;
  }

  
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log("📧 [DEV] Ethereal user:", testAccount.user);
  return cachedTransporter;
}

export async function sendPasswordResetMail(to, link) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || "Ecommerce <no-reply@example.com>",
    to,
    subject: "Restablecer contraseña",
    html: `
      <p>Hola,</p>
      <p>Tenés <b>1 hora</b> para restablecer tu contraseña:</p>
      <p><a href="${link}" target="_blank" rel="noopener">Restablecer contraseña</a></p>
      <p>Si no fuiste vos, ignorá este correo.</p>
    `,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log("Email preview URL:", preview);
  return info;
}
