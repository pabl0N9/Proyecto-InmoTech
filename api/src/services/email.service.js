const nodemailer = require('nodemailer');
const path = require('path');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async enviarEmailBienvenida(userData) {
    try {
      const { email, nombre_completo } = userData;

      // Configuración del email
      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: '¡Bienvenido a Matriz Inmobiliaria! 🎉',
        html: this.generarTemplateBienvenida(nombre_completo),
      };

      // Enviar el email
      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Email de bienvenida enviado exitosamente a: ${email}`, {
        messageId: info.messageId,
        response: info.response
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error enviando email de bienvenida:', error);
      throw error;
    }
  }

  generarTemplateBienvenida(nombreCompleto) {
    const primerNombre = nombreCompleto.split(' ')[0];

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Matriz Inmobiliaria</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #00457B, #0056A3);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .header img {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
          }
          .content {
            padding: 40px 30px;
            color: #333;
          }
          .welcome-message {
            text-align: center;
            margin-bottom: 30px;
          }
          .welcome-message h1 {
            font-size: 28px;
            margin-bottom: 10px;
            color: #00457B;
          }
          .welcome-message p {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .features {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            margin: 30px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          }
          .feature-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #00457B, #0056A3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            color: white;
            font-size: 20px;
          }
          .feature-content h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #00457B;
          }
          .feature-content p {
            margin: 0;
            color: #666;
          }
          .cta-button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #00457B, #0056A3);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background: #00457B;
            padding: 20px;
            text-align: center;
            color: white;
          }
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
          }
          .contact-item {
            display: flex;
            align-items: center;
            margin: 5px 0;
          }
          .contact-item i {
            margin-right: 8px;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .header {
              padding: 30px 20px;
            }
            .content {
              padding: 30px 20px;
            }
            .contact-info {
              flex-direction: column;
              gap: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <img src="http://localhost:5173/images/logo-matriz-sin-fondo.png" alt="Matriz Inmobiliaria" style="width: 180px;">
            <h1>¡Bienvenido a bordo!</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="welcome-message">
              <h1>¡Hola ${primerNombre}! 👋</h1>
              <p>Gracias por registrarte en <strong>Matriz Inmobiliaria</strong>. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
              <p>Ahora puedes acceder a todas nuestras herramientas y servicios para hacer realidad tus sueños inmobiliarios.</p>
            </div>

            <div class="features">
              <h2 style="text-align: center; color: #00457B; margin-bottom: 25px;">¿Qué puedes hacer ahora?</h2>

              <div class="feature-item">
                <div class="feature-icon">🏠</div>
                <div class="feature-content">
                  <h3>Explorar Propiedades</h3>
                  <p>Descubre miles de propiedades disponibles en nuestro sistema. Busca por ubicación, precio, tipo y más.</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon">📅</div>
                <div class="feature-content">
                  <h3>Agendar Visitas</h3>
                  <p>Programa visitas a las propiedades que te interesen con nuestros agentes especializados.</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon">💬</div>
                <div class="feature-content">
                  <h3>Atención Personalizada</h3>
                  <p>Recibe soporte y asesoramiento de nuestro equipo de profesionales calificados.</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon">⭐</div>
                <div class="feature-content">
                  <h3>Gestión Completa</h3>
                  <p>Administra tus intereses inmobiliarios, guarda favoritos y recibe notificaciones personalizadas.</p>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/" class="cta-button">
                ¡Comenzar Ahora! 🚀
              </a>
            </div>

            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #00457B; margin-top: 0;">💡 Consejos para empezar:</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li><strong>Completa tu perfil:</strong> Agrega más información para obtener recomendaciones personalizadas.</li>
                <li><strong>Busca tus preferencias:</strong> Utiliza nuestros filtros avanzados para encontrar exactamente lo que buscas.</li>
                <li><strong>Contacta a un agente:</strong> Nuestros profesionales están listos para ayudarte en cada paso.</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin-bottom: 20px;"><strong>¿Tienes preguntas?</strong> Estamos aquí para ayudarte.</p>

            <div class="contact-info">
              <div class="contact-item">
                <span style="margin-right: 5px;">📧</span>
                <span>hola@matrizinmobiliaria.com</span>
              </div>
              <div class="contact-item">
                <span style="margin-right: 5px;">📱</span>
                <span>+57 300 123 4567</span>
              </div>
              <div class="contact-item">
                <span style="margin-right: 5px;">🌐</span>
                <span>www.matrizinmobiliaria.com</span>
              </div>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #e0e0e0;">
              © 2025 Matriz Inmobiliaria. Todos los derechos reservados.<br>
              Dirección: Carrera 123 #45-67, Bogotá, Colombia
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
