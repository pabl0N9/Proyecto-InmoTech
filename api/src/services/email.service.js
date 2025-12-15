const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || '';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  logger.info('SendGrid inicializado correctamente');
} else {
  logger.warn('SENDGRID_API_KEY no está configurado. No se enviarán correos reales.');
}

const ensureSendgridReady = () => {
  if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
    const error = new Error('El servicio de correo no está configurado correctamente.');
    error.status = 500;
    throw error;
  }
};

const sendPasswordResetEmail = async ({ to, token }) => {
  ensureSendgridReady();

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
      <p>— Equipo Inmotech</p>
    `
  };

  await sgMail.send(msg);
  logger.info(`Correo de recuperación enviado a ${to}`);
};

module.exports = {
  sendPasswordResetEmail
};
