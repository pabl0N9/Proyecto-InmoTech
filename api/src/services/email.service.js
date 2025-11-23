const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    const port = Number(process.env.EMAIL_PORT) || 587;

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async enviarEmailBienvenida(userData) {
    try {
      const { email, nombre_completo } = userData;

      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Bienvenido a Matriz Inmobiliaria",
        html: this.generarTemplateBienvenida(nombre_completo),
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Email de bienvenida enviado exitosamente a: ${email}`, {
        messageId: info.messageId,
        response: info.response,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error("Error enviando email de bienvenida:", error);
      throw error;
    }
  }

  async enviarEmailInvitacion(data) {
    try {
      const { email, nombre_completo, token, codigo_6d, expira_en, activationLink } = data;
      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Activa tu cuenta en Matriz Inmobiliaria',
        html: this.generarTemplateInvitacion(nombre_completo, codigo_6d, expira_en, activationLink, email)
      };
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Invitacion enviada a: ${email}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId, token };
    } catch (error) {
      logger.error('Error enviando invitacion:', error);
      throw error;
    }
  }

  async enviarEmailVerificacion(data) {
    try {
      const { email, nombre_completo, expira_en, verificationLink } = data;
      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Confirma tu correo en Matriz Inmobiliaria',
        html: this.generarTemplateVerificacion(nombre_completo, expira_en, verificationLink)
      };
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email de verificacion enviado a: ${email}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error enviando email de verificacion:', error);
      throw error;
    }
  }

  generarTemplateBienvenida(nombreCompleto = "") {
    const primerNombre = nombreCompleto.trim().split(" ")[0] || "Hola";
    const logoUrl = process.env.EMAIL_LOGO_URL || "https://matrizinmobiliaria.com/images/logo-matriz-sin-fondo.png";

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Matriz Inmobiliaria</title>
        <style>
          body { margin:0; padding:0; background:#f3f7fb; font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif; color:#1f2d3d; }
          .preheader { display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; height:0; width:0; }
          .wrapper { width:100%; table-layout:fixed; background:#f3f7fb; padding:28px 0; }
          .container { max-width:720px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 24px 60px rgba(15,43,70,0.16); }
          .hero { background:linear-gradient(135deg,#0f2b46,#1b5f8c); padding:36px 42px 26px; color:#e9f2fb; }
          .hero h1 { margin:12px 0 6px; font-size:26px; letter-spacing:0.3px; }
          .hero p { margin:6px 0 0; color:#d9e6f3; font-size:15px; line-height:1.5; }
          .logo { width:200px; max-width:60%; }
          .content { padding:36px 42px 42px; }
          h2 { margin:0 0 12px; font-size:22px; color:#0f2b46; }
          p { margin:0 0 14px; line-height:1.6; color:#4a5566; }
          .card { border:1px solid #e6edf5; border-radius:14px; padding:18px; background:linear-gradient(135deg,rgba(27,95,140,0.06),rgba(15,43,70,0.02)); margin:26px 0; }
          .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; }
          .feature { background:#ffffff; border:1px solid #e6edf5; border-radius:12px; padding:16px 14px; box-shadow:0 10px 24px rgba(15,43,70,0.05); }
          .feature-number { display:inline-block; background:#f4b223; color:#0f2b46; font-weight:800; padding:6px 10px; border-radius:10px; font-size:12px; letter-spacing:0.4px; }
          .feature-title { margin:10px 0 6px; font-weight:700; color:#0f2b46; font-size:16px; }
          .feature-desc { margin:0; color:#556273; line-height:1.5; font-size:14px; }
          .cta-wrap { text-align:center; margin:30px 0 8px; }
          .cta { display:inline-block; padding:14px 32px; background:linear-gradient(135deg,#f4b223,#f7c85c); color:#0f2b46; font-weight:800; text-decoration:none; border-radius:12px; box-shadow:0 14px 32px rgba(244,178,35,0.35); letter-spacing:0.4px; }
          .tips { background:#f6f9fc; border:1px solid #e6edf5; border-radius:12px; padding:16px 18px; margin:24px 0 12px; color:#4a5566; }
          .tips ul { padding-left:18px; margin:10px 0 0; }
          .footer { background:#0f2034; color:#c9d5e5; text-align:center; padding:22px 18px; font-size:13px; }
          .footer a { color:#c9d5e5; text-decoration:none; }
          .footer .contact { margin:8px 0 4px; }
          @media (max-width:640px) { .content { padding:28px 22px 32px; } .hero { padding:28px 24px 22px; } }
        </style>
      </head>
      <body>
        <span class="preheader">Tu nueva cuenta ya esta lista. Explora propiedades, agenda visitas y recibe acompanamiento.</span>
        <table class="wrapper" role="presentation" cellspacing="0" cellpadding="0" width="100%">
          <tr>
            <td align="center">
              <table class="container" role="presentation" cellspacing="0" cellpadding="0" width="100%">
                <tr>
                  <td class="hero">
                    <img class="logo" src="${logoUrl}" alt="Matriz Inmobiliaria" />
                    <h1>Bienvenido a bordo</h1>
                    <p>Tu nuevo espacio para explorar, gestionar y hacer realidad cada proyecto inmobiliario con acompanamiento experto.</p>
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <h2>Hola ${primerNombre}, nos alegra tenerte aqui.</h2>
                    <p>Creamos este espacio para que puedas encontrar propiedades, agendar visitas y avanzar tus planes sin friccion. Desde hoy cuentas con las herramientas y el acompanamiento de nuestro equipo.</p>
                    <p>Aqui un vistazo rapido a lo que puedes hacer desde ya:</p>

                    <div class="card">
                      <div class="grid">
                        <div class="feature">
                          <span class="feature-number">01</span>
                          <div class="feature-title">Explora el catalogo</div>
                          <p class="feature-desc">Filtra por ubicacion, precio y tipo. Guarda tus favoritas y comparalas cuando quieras.</p>
                        </div>
                        <div class="feature">
                          <span class="feature-number">02</span>
                          <div class="feature-title">Agenda visitas en linea</div>
                          <p class="feature-desc">Elige horarios en tiempo real y recibe confirmaciones inmediatas sin llamadas ni esperas.</p>
                        </div>
                        <div class="feature">
                          <span class="feature-number">03</span>
                          <div class="feature-title">Acompanamiento experto</div>
                          <p class="feature-desc">Un asesor te guiara paso a paso: documentacion, negociacion y estado de cada proceso.</p>
                        </div>
                        <div class="feature">
                          <span class="feature-number">04</span>
                          <div class="feature-title">Gestiona en un solo lugar</div>
                          <p class="feature-desc">Historial, notificaciones y recordatorios centralizados para avanzar sin perder detalle.</p>
                        </div>
                      </div>
                    </div>

                    <div class="cta-wrap">
                      <a class="cta" href="http://localhost:3000/" target="_blank" rel="noopener noreferrer">Empezar ahora</a>
                    </div>

                    <div class="tips">
                      <strong>Para aprovechar al maximo:</strong>
                      <ul>
                        <li>Completa tu perfil para recibir recomendaciones personalizadas.</li>
                        <li>Activa notificaciones para enterarte de nuevas propiedades en tu zona.</li>
                        <li>Comparte tus favoritos con tu asesor para avanzar mas rapido.</li>
                      </ul>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    <div class="contact">Si tienes preguntas, estamos listos para ayudarte.</div>
                    <div class="contact"><a href="mailto:hola@matrizinmobiliaria.com">hola@matrizinmobiliaria.com</a> | +57 300 123 4567 | <a href="https://matrizinmobiliaria.com" target="_blank" rel="noreferrer">matrizinmobiliaria.com</a></div>
                    <div style="margin-top:8px;">&copy; 2025 Matriz Inmobiliaria. Todos los derechos reservados.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  generarTemplateVerificacion(nombreCompleto = "", expiraEn, verificationLink) {
    const primerNombre = nombreCompleto.trim().split(" ")[0] || "Hola";
    const logoUrl = process.env.EMAIL_LOGO_URL || "https://matrizinmobiliaria.com/images/logo-matriz-sin-fondo.png";
    const expiraTexto = expiraEn ? new Date(expiraEn).toLocaleString() : '';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirma tu correo</title>
        <style>
          body { margin:0; padding:0; background:#f5f7fb; font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif; color:#1f2d3d; }
          .wrapper { width:100%; padding:24px 0; }
          .container { max-width:640px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 18px 46px rgba(15,43,70,0.12); }
          .header { padding:28px; background:linear-gradient(135deg,#0f2b46,#1b5f8c); color:#fff; }
          .logo { width:180px; max-width:70%; }
          .content { padding:32px 28px 36px; }
          h1 { margin:0 0 14px; font-size:24px; color:#0f2b46; }
          p { margin:0 0 14px; line-height:1.6; color:#4a5566; }
          .cta { display:inline-block; padding:14px 28px; background:linear-gradient(135deg,#f4b223,#f7c85c); color:#0f2b46; font-weight:800; text-decoration:none; border-radius:12px; box-shadow:0 12px 28px rgba(244,178,35,0.35); margin:18px 0; }
          .footer { background:#0f2034; color:#c9d5e5; text-align:center; padding:18px; font-size:13px; }
          .footer a { color:#c9d5e5; text-decoration:none; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <img class="logo" src="${logoUrl}" alt="Matriz Inmobiliaria" />
              <p style="margin:12px 0 0; opacity:0.9;">Confirma que este correo es tuyo y habilita tu cuenta</p>
            </div>
            <div class="content">
              <h1>Hola ${primerNombre},</h1>
              <p>Recibimos tu registro en Matriz Inmobiliaria. Para finalizar solo confirma que este correo es tuyo.</p>
              <p>El enlace vence el <strong>${expiraTexto}</strong>. Después de ese tiempo la cuenta se deshabilitará automáticamente.</p>
              <a class="cta" href="${verificationLink}" target="_blank" rel="noopener noreferrer">Confirmar correo</a>
              <p style="margin-top:18px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break:break-all; color:#0f2b46;">${verificationLink}</p>
              <p style="font-size:13px; color:#6b7280;">Si no solicitaste este registro, ignora este mensaje.</p>
            </div>
            <div class="footer">
              <div>¿Necesitas ayuda? Escríbenos a <a href="mailto:hola@matrizinmobiliaria.com">hola@matrizinmobiliaria.com</a></div>
              <div style="margin-top:8px;">&copy; 2025 Matriz Inmobiliaria. Todos los derechos reservados.</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generarTemplateInvitacion(nombreCompleto = "", codigo6d, expiraEn, activationLink, correo) {
    const primerNombre = nombreCompleto.trim().split(" ")[0] || "Hola";
    const logoUrl = process.env.EMAIL_LOGO_URL || "https://matrizinmobiliaria.com/images/logo-matriz-sin-fondo.png";
    const expiraTexto = expiraEn ? new Date(expiraEn).toLocaleString() : '';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activa tu cuenta</title>
        <style>
          body { margin:0; padding:0; background:#f5f7fb; font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif; color:#1f2d3d; }
          .wrapper { width:100%; padding:24px 0; }
          .container { max-width:640px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 18px 46px rgba(15,43,70,0.12); }
          .header { padding:28px; background:linear-gradient(135deg,#0f2b46,#1b5f8c); color:#fff; }
          .logo { width:180px; max-width:70%; }
          .content { padding:32px 28px 36px; }
          h1 { margin:0 0 14px; font-size:24px; color:#0f2b46; }
          p { margin:0 0 14px; line-height:1.6; color:#4a5566; }
          .code { font-size:28px; font-weight:800; letter-spacing:6px; color:#0f2b46; text-align:center; padding:16px; border:1px dashed #cfd8e3; border-radius:12px; background:#f6f9fc; }
          .cta { display:inline-block; padding:14px 28px; background:linear-gradient(135deg,#f4b223,#f7c85c); color:#0f2b46; font-weight:800; text-decoration:none; border-radius:12px; box-shadow:0 12px 28px rgba(244,178,35,0.35); margin:18px 0; }
          .footer { background:#0f2034; color:#c9d5e5; text-align:center; padding:18px; font-size:13px; }
          .footer a { color:#c9d5e5; text-decoration:none; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <img class="logo" src="${logoUrl}" alt="Matriz Inmobiliaria" />
              <p style="margin:12px 0 0; opacity:0.95; color:#f7f9ff; font-weight:700;">Activa tu cuenta y establece tu contrasena</p>
            </div>
            <div class="content">
              <h1>Hola ${primerNombre},</h1>
              <p>Hemos creado una cuenta para ti en Matriz Inmobiliaria. Para comenzar, activa tu cuenta y define tu contraseña.</p>
              <p><strong>Tu correo de acceso:</strong> ${correo || ''}</p>
              <p>Usa este código para validar que tienes acceso a esta bandeja:</p>
              <div class="code">${codigo6d}</div>
              <p>Pulsa el botón y completa tu contraseña. El enlace vence el <strong>${expiraTexto}</strong>.</p>
              <a class="cta" href="${activationLink}" target="_blank" rel="noopener noreferrer">Activar mi cuenta</a>
              <p style="margin-top:18px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break:break-all; color:#0f2b46;">${activationLink}</p>
              <p style="font-size:13px; color:#6b7280;">Si no solicitaste esta invitación, puedes ignorar este correo.</p>
            </div>
            <div class="footer">
              <div>¿Necesitas ayuda? Escríbenos a <a href="mailto:hola@matrizinmobiliaria.com">hola@matrizinmobiliaria.com</a></div>
              <div style="margin-top:8px;">&copy; 2025 Matriz Inmobiliaria. Todos los derechos reservados.</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();



