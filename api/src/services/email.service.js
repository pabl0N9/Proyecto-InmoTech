const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

// Fallback a EMAIL_PASS/EMAIL_FROM si no se definieron explícitos
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || process.env.EMAIL_PASS || '';
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || '';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

// Inicializar SendGrid solo si la clave parece válida y hay remitente
let sendgridReady = false;
if (SENDGRID_API_KEY && SENDGRID_FROM_EMAIL) {
  try {
    sgMail.setApiKey(SENDGRID_API_KEY);
    sendgridReady = true;
    logger.info('SendGrid inicializado correctamente');
  } catch (err) {
    logger.warn(`No se pudo inicializar SendGrid: ${err.message}`);
  }
} else {
  logger.warn('SENDGRID_API_KEY o SENDGRID_FROM_EMAIL no configurados correctamente. Correos no se enviarán en este entorno.');
}

const sendPasswordResetEmail = async ({ to, token }) => {
  if (!sendgridReady) {
    logger.warn(`Correo de recuperación omitido: SendGrid no configurado. Clave presente: ${!!SENDGRID_API_KEY}, remitente presente: ${!!SENDGRID_FROM_EMAIL}`);
    return { skipped: true };
  }

  const resetUrl = `${APP_BASE_URL.replace(/\/$/, '')}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
  const msg = {
    to,
    from: SENDGRID_FROM_EMAIL,
    subject: 'Recupera tu contraseña en Inmotech',
    html: `
      <p>Hola,</p>
      <p>Hemos recibido una solicitud para restablecer tu contraseña. Puedes hacerlo haciendo clic en el siguiente enlace:</p>
      <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">${resetUrl}</a></p>
      <p>Si no solicitaste este cambio puedes ignorar este correo.</p>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Equipo Inmotech</p>
    `
  };

  try {
    await sgMail.send(msg);
    logger.info(`Correo de recuperación enviado a ${to}`);
    return { sent: true };
  } catch (err) {
    // No bloquear el flujo si SendGrid falla: registrar y continuar
    const code = err?.code || err?.response?.statusCode;
    logger.warn(`Fallo al enviar correo de recuperación a ${to}: ${err.message || err}`, {
      code,
      body: err?.response?.body
    });
    return { sent: false, error: err?.message || 'sendgrid_error', code };
  }
};

module.exports = {
  sendPasswordResetEmail
};
