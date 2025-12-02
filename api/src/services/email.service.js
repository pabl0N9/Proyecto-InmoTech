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
      const { email, nombre_completo, token, codigo_6d, expira_en, activationLink, rol_asignado, es_administrativo } = data;
      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: es_administrativo ? 'Activa tu acceso administrativo' : 'Activa tu cuenta en Matriz Inmobiliaria',
        html: this.generarTemplateInvitacion(nombre_completo, codigo_6d, expira_en, activationLink, email, rol_asignado, es_administrativo)
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
      const { email, nombre_completo, codigo_6d, expira_en, verificationLink } = data;
      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Confirma tu correo en Matriz Inmobiliaria',
        html: this.generarTemplateVerificacion(nombre_completo, expira_en, verificationLink, codigo_6d)
      };
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email de verificacion enviado a: ${email}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error enviando email de verificacion:', error);
      throw error;
    }
  }

  async enviarEmailCitaSolicitada({ cita, correoAlterno, timezone } = {}) {
    try {
      const ctx = this._buildCitaContexto(cita, { timezone, correoAlterno });

      if (!ctx.correo) {
        logger.warn('[EMAIL][CITA] Se omitio el envio porque la cita no tiene correo asociado');
        return { success: false, skipped: true, reason: 'sin_correo' };
      }

      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: ctx.correo,
        subject: `Solicitud de cita para ${ctx.fechaHumana}`,
        html: this.generarTemplateCitaSolicitada({
          ...ctx,
          estado: ctx.estadoTexto,
          titulo: 'Recibimos tu solicitud de cita',
          intro: `Tu cita esta registrada como ${ctx.estadoTexto.toLowerCase() || 'solicitada'}. Te contactaremos para confirmarla o avisarte si debemos ajustar algo.`,
          note: 'El evento se crea con el estado actual de la cita. Si se confirma o cambia, te enviaremos un nuevo correo.',
          mensajeExtra: '✨ No faltes: estamos listos para ayudarte a encontrar tu inmueble soñado. Prepárate para una experiencia especial.'
        }),
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`[EMAIL][CITA] Correo de cita solicitada enviado a ${ctx.correo}`, {
        messageId: info.messageId,
        response: info.response,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('[EMAIL][CITA] Error enviando correo de cita solicitada:', error);
      throw error;
    }
  }

  async enviarEmailCitaConfirmada({ cita, plazoHoras, timezone } = {}) {
    try {
      const ctx = this._buildCitaContexto(cita, { timezone });
      if (!ctx.correo) {
        logger.warn('[EMAIL][CITA] Confirmacion omitida: cita sin correo');
        return { success: false, skipped: true, reason: 'sin_correo' };
      }

      const limiteHoras = plazoHoras ?? (Number(process.env.CITA_CHANGE_DEADLINE_HOURS) || 24);

      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: ctx.correo,
        subject: `Cita confirmada para ${ctx.fechaHumana}`,
        html: this.generarTemplateCitaSolicitada({
          ...ctx,
          estado: 'Confirmada',
          titulo: 'Tu cita fue confirmada',
          intro: `La cita fue confirmada para ${ctx.fechaHumana}. Tu agente asignado es ${ctx.agenteNombre || 'nuestro equipo'}.`,
          note: `Si necesitas cambiar o cancelar, hazlo hasta ${limiteHoras} horas antes para garantizar disponibilidad.`,
          ctaLabel: 'Agregar en Google Calendar',
          mensajeExtra: '✨ No faltes: estamos listos para acompañarte a conseguir tu lugar ideal.'
        })
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`[EMAIL][CITA] Confirmacion enviada a ${ctx.correo}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('[EMAIL][CITA] Error enviando correo de cita confirmada:', error);
      throw error;
    }
  }

  async enviarEmailCitaCancelada({ cita, motivo, timezone } = {}) {
    try {
      const ctx = this._buildCitaContexto(cita, { timezone });
      if (!ctx.correo) {
        logger.warn('[EMAIL][CITA] Cancelacion omitida: cita sin correo');
        return { success: false, skipped: true, reason: 'sin_correo' };
      }

      const motivoTexto = motivo || cita?.motivo_cancelacion || 'No especificado';

      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: ctx.correo,
        subject: `Tu cita fue cancelada (${ctx.fechaHumana})`,
        html: this.generarTemplateCitaSolicitada({
          ...ctx,
          estado: 'Cancelada',
          titulo: 'Hemos cancelado tu cita',
          intro: 'Queremos que estes al tanto: la cita fue cancelada.',
          calendarLink: '',
          ctaLabel: '',
          note: `Motivo: ${motivoTexto}`
        })
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`[EMAIL][CITA] Cancelacion enviada a ${ctx.correo}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('[EMAIL][CITA] Error enviando correo de cita cancelada:', error);
      throw error;
    }
  }

  async enviarEmailCitaReagendada({ cita, motivo, timezone } = {}) {
    try {
      const ctx = this._buildCitaContexto(cita, { timezone });
      if (!ctx.correo) {
        logger.warn('[EMAIL][CITA] Reagendamiento omitido: cita sin correo');
        return { success: false, skipped: true, reason: 'sin_correo' };
      }

      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: ctx.correo,
        subject: `Reprogramamos tu cita a ${ctx.fechaHumana}`,
        html: this.generarTemplateCitaSolicitada({
          ...ctx,
          estado: 'Reagendada',
          titulo: 'Tu cita fue reprogramada',
          intro: 'Actualizamos la fecha y hora de tu cita. Aqui estan los nuevos detalles.',
          note: motivo ? `Motivo del cambio: ${motivo}` : 'Si necesitas otro horario, responde este correo y te ayudaremos.',
          ctaLabel: 'Actualizar en Google Calendar'
        })
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`[EMAIL][CITA] Reagendamiento enviado a ${ctx.correo}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('[EMAIL][CITA] Error enviando correo de cita reagendada:', error);
      throw error;
    }
  }

  async enviarEmailCitaAsignada({ cita, timezone } = {}) {
    try {
      const ctx = this._buildCitaContexto(cita, { timezone });
      if (!ctx.correo) {
        logger.warn('[EMAIL][CITA] Asignacion omitida: cita sin correo');
        return { success: false, skipped: true, reason: 'sin_correo' };
      }

      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: ctx.correo,
        subject: `Tu cita ahora la atiende ${ctx.agenteNombre || 'nuestro equipo'}`,
        html: this.generarTemplateCitaSolicitada({
          ...ctx,
          estado: ctx.estadoTexto || 'Programada',
          titulo: 'Actualizamos tu agente',
          intro: `Asignamos a ${ctx.agenteNombre || 'nuestro equipo'} para acompanarte en tu cita.`,
          note: 'Si el horario ya no te sirve, responde este correo y coordinamos otro.',
          ctaLabel: 'Ver en Google Calendar'
        })
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`[EMAIL][CITA] Asignacion enviada a ${ctx.correo}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('[EMAIL][CITA] Error enviando correo de asignacion de agente:', error);
      throw error;
    }
  }

  async enviarEmailCitaConfirmadaAgente({ cita, timezone } = {}) {
    try {
      const ctx = this._buildCitaContexto(cita, { timezone });
      const correoAgente = cita?.agente?.correo || null;
      const nombreAgente = cita?.agente
        ? `${cita.agente.nombre_completo || ''} ${cita.agente.apellido_completo || ''}`.trim()
        : 'Agente';

      if (!correoAgente) {
        logger.warn('[EMAIL][CITA] Confirmacion a agente omitida: agente sin correo');
        return { success: false, skipped: true, reason: 'sin_correo' };
      }

      const mailOptions = {
        from: `"Matriz Inmobiliaria" <${process.env.EMAIL_FROM}>`,
        to: correoAgente,
        subject: `Tienes una cita programada el ${ctx.fechaHumana}`,
        html: this.generarTemplateCitaSolicitada({
          ...ctx,
          estado: 'Confirmada',
          titulo: 'Nueva cita asignada',
          intro: `Tienes una cita confirmada con ${ctx.clienteNombreCompleto || 'un cliente'} para ${ctx.fechaHumana}.`,
          note: 'Llega con unos minutos de anticipacion. Si necesitas reagendar, avisa al cliente o al administrador.',
          ctaLabel: 'Agregar en Google Calendar',
          nombre: nombreAgente,
          mensajeExtra: ''
        })
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`[EMAIL][CITA] Confirmacion enviada al agente ${correoAgente}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('[EMAIL][CITA] Error enviando correo de confirmacion para agente:', error);
      throw error;
    }
  }

  _normalizarHora(hora) {
    if (!hora) return '00:00';

    // Si viene como Date, convertir
    if (hora instanceof Date) {
      const hh = hora.getHours().toString().padStart(2, '0');
      const mm = hora.getMinutes().toString().padStart(2, '0');
      return `${hh}:${mm}`;
    }

    // Si viene como numero (hora entera), asumir HH:00
    if (typeof hora === 'number') {
      const hh = Math.floor(hora).toString().padStart(2, '0');
      return `${hh}:00`;
    }

    const raw = String(hora).trim();

    // Si viene en formato ISO
    if (raw.includes('T')) {
      const date = new Date(raw);
      if (!isNaN(date.getTime())) {
        const hh = date.getHours().toString().padStart(2, '0');
        const mm = date.getMinutes().toString().padStart(2, '0');
        return `${hh}:${mm}`;
      }
    }

    const partes = raw.split(':');
    const hh = (partes[0] || '00').padStart(2, '0');
    const mm = (partes[1] || '00').padStart(2, '0');
    return `${hh}:${mm}`;
  }

  _formatearHoraRango(inicio, fin) {
    const horaInicio = this._normalizarHora(inicio);
    const horaFin = this._normalizarHora(fin);
    return `${horaInicio} - ${horaFin}`;
  }

  _formatearFechaHumana(fecha, hora, timezone) {
    if (!fecha) return '';
    const [year, month, day] = (fecha.split('T')[0] || fecha).split('-').map(Number);
    const [hour, minute] = this._normalizarHora(hora).split(':').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute));

    return date.toLocaleString('es-ES', {
      timeZone: timezone || 'America/Bogota',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  _buildCalendarDateTime(fecha, hora) {
    if (!fecha) return '';
    const [year, month, day] = (fecha.split('T')[0] || fecha).split('-');
    const [hour, minute] = this._normalizarHora(hora).split(':');
    const mm = (month || '').padStart(2, '0');
    const dd = (day || '').padStart(2, '0');
    return `${year}${mm}${dd}T${hour}${minute}00`;
  }

  _generarEnlaceGoogleCalendar({ fechaInicio, fechaFin, horaInicio, horaFin, titulo, descripcion, ubicacion, timezone }) {
    const inicio = this._buildCalendarDateTime(fechaInicio, horaInicio);
    const fin = this._buildCalendarDateTime(fechaFin || fechaInicio, horaFin || horaInicio);

    if (!inicio) return '';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: titulo || 'Cita Matriz Inmobiliaria',
      dates: inicio && fin ? `${inicio}/${fin}` : inicio,
      details: descripcion || '',
      location: ubicacion || '',
      ctz: timezone || 'America/Bogota'
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
  }

  _buildCitaContexto(cita, { timezone, correoAlterno } = {}) {
    if (!cita) throw new Error('Datos de la cita son requeridos');

    const zona = timezone || process.env.CALENDAR_TIMEZONE || 'America/Bogota';
    const correo = cita?.cliente?.correo || cita?.correo || cita?.email || correoAlterno;
    const clienteNombreCompleto = cita?.cliente
      ? `${cita.cliente.nombre_completo || ''} ${cita.cliente.apellido_completo || ''}`.trim()
      : (cita?.nombre_completo || 'Cliente');
    const nombreCliente = (clienteNombreCompleto || 'Cliente').split(' ')[0];
    const fecha = cita?.fecha_cita || cita?.fecha;
    const horaInicio = this._normalizarHora(cita?.hora_inicio);
    const horaFin = this._normalizarHora(cita?.hora_fin || cita?.hora_inicio);
    const servicio = cita?.servicio?.nombre_servicio || 'Cita de servicio';
    const estadoTexto = cita?.estado?.nombre_estado || cita?.estado || 'Solicitada';

    const direccion = [
      cita?.inmueble?.direccion,
      cita?.inmueble?.ciudad,
      cita?.inmueble?.departamento,
      cita?.inmueble?.pais
    ].filter(Boolean).join(', ');

    const agenteNombre = cita?.agente
      ? `${cita.agente.nombre_completo || ''} ${cita.agente.apellido_completo || ''}`.trim()
      : null;

    const fechaHumana = this._formatearFechaHumana(fecha, horaInicio, zona);
    const horaRango = this._formatearHoraRango(horaInicio, horaFin);
    const calendarLink = this._generarEnlaceGoogleCalendar({
      fechaInicio: fecha,
      fechaFin: fecha,
      horaInicio,
      horaFin,
      titulo: `Cita - ${servicio}`,
      descripcion: `Estado: ${estadoTexto}`,
      ubicacion: direccion,
      timezone: zona
    });

    return {
      correo,
      nombre: nombreCliente,
      servicio,
      fechaHumana,
      horaRango,
      direccion: direccion || 'Se confirmara la ubicacion contigo',
      estadoTexto,
      observaciones: cita?.observaciones,
      calendarLink,
      timezone: zona,
      agenteNombre,
      clienteNombreCompleto
    };
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

  generarTemplateVerificacion(nombreCompleto = "", expiraEn, verificationLink, codigo6d) {
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
          .code { font-size:28px; font-weight:800; letter-spacing:6px; color:#0f2b46; text-align:center; padding:16px; border:1px dashed #cfd8e3; border-radius:12px; background:#f6f9fc; }
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
              <p>Recibimos tu registro en Matriz Inmobiliaria. Para finalizar ingresa este codigo en la pantalla de verificacion.</p>
              <p style="margin-bottom:6px; color:#0f2b46; font-weight:700;">Tu codigo de verificacion:</p>
              <div class="code">${codigo6d || '******'}</div>
              <p style="margin-top:14px;">Ve a la pagina de verificacion y escribe el codigo anterior. El codigo vence el <strong>${expiraTexto}</strong>.</p>
              <a class="cta" href="${verificationLink}" target="_blank" rel="noopener noreferrer">Ir a verificar mi correo</a>
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

  generarTemplateCitaSolicitada({
    nombre = 'Cliente',
    servicio,
    fechaHumana,
    horaRango,
    direccion,
    estado,
    observaciones,
    calendarLink,
    timezone,
    titulo = 'Recibimos tu solicitud de cita',
    intro = 'Tu cita esta registrada como solicitada. Te contactaremos para confirmarla o informarte si necesitamos ajustar algo.',
    note = 'El evento se crea con el estado actual de la cita. Si se confirma o cambia, te enviaremos un nuevo correo.',
    ctaLabel = 'Agregar en Google Calendar',
    agente,
    mensajeExtra = ''
  }) {
    const logoUrl = process.env.EMAIL_LOGO_URL || "https://matrizinmobiliaria.com/images/logo-matriz-sin-fondo.png";
    const estadoTexto = estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : 'Solicitada';
    const estadoKey = (estadoTexto || '').toLowerCase();
    const statusStyles = {
      solicitada: { bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' }, // Indigo, igual a dashboard
      confirmada: { bg: '#E8F8EF', color: '#1B7B4A', border: '#34D399' },
      cancelada: { bg: '#FEECEC', color: '#B42318', border: '#F97373' },
      reagendada: { bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD' },
      programada: { bg: '#EEF2FF', color: '#4F46E5', border: '#A5B4FC' },
      default: { bg: '#EEF2FF', color: '#1F2937', border: '#CBD5E1' }
    };
    const statusStyle = statusStyles[estadoKey] || statusStyles.default;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud de cita recibida</title>
        <style>
          body { margin:0; padding:0; background:#f3f6fb; font-family:'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif; color:#1f2d3d; }
          .wrapper { width:100%; padding:28px 0; }
          .container { max-width:720px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 18px 46px rgba(15,43,70,0.12); }
          .header { padding:26px 30px 18px; background:linear-gradient(135deg,#0f2b46,#1b5f8c); color:#fff; position:relative; }
          .header-top { display:flex; align-items:center; justify-content:space-between; gap:12px; }
          .logo { width:180px; max-width:70%; }
          .subtitle { margin:6px 0 0; opacity:0.9; font-weight:600; }
          .status-pill { display:inline-flex; align-items:center; gap:8px; padding:10px 14px; border-radius:999px; font-weight:800; font-size:13px; border:1px solid ${statusStyle.border}; background:${statusStyle.bg}; color:${statusStyle.color}; box-shadow:0 8px 20px rgba(0,0,0,0.08); }
          .dot { width:10px; height:10px; border-radius:50%; background:${statusStyle.color}; display:inline-block; }
          .content { padding:30px; }
          h1 { margin:0 0 12px; font-size:24px; color:#0f2b46; letter-spacing:-0.2px; }
          p { margin:0 0 14px; line-height:1.65; color:#4a5566; }
          .card { border:1px solid #e5eaf3; border-radius:16px; padding:20px 22px; background:#f9fbff; margin:22px 0; }
          .card-title { margin:0 0 14px; font-weight:800; color:#0f2b46; letter-spacing:0.2px; font-size:15px; text-transform:uppercase; }
          .info-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px 18px; }
          .label { color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.55px; margin-bottom:4px; }
          .value { color:#0f2b46; font-weight:800; font-size:16px; line-height:1.4; }
          .value-secondary { color:#4b5563; font-weight:600; font-size:14px; }
          .cta { display:inline-block; padding:14px 22px; background:linear-gradient(135deg,#f4b223,#f7c85c); color:#0f2b46; font-weight:800; text-decoration:none; border-radius:12px; box-shadow:0 12px 28px rgba(244,178,35,0.35); margin:18px 0 10px; }
          .note { font-size:13px; color:#6b7280; margin-bottom:10px; }
          .section-title { margin:14px 0 6px; font-weight:800; font-size:13px; letter-spacing:0.3px; color:#0f2b46; text-transform:uppercase; }
          .bullet { display:flex; align-items:flex-start; gap:10px; margin:6px 0; color:#4a5566; line-height:1.5; }
          .bullet-icon { width:10px; height:10px; margin-top:7px; background:#f4b223; border-radius:50%; flex-shrink:0; }
          .footer { background:#0f2034; color:#c9d5e5; text-align:center; padding:20px; font-size:13px; }
          .footer a { color:#c9d5e5; text-decoration:none; }
          @media (max-width:620px) { .header-top { flex-direction:column; align-items:flex-start; } .content { padding:24px; } }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="header-top">
                <img class="logo" src="${logoUrl}" alt="Matriz Inmobiliaria" />
                <span class="status-pill"><span class="dot"></span>${estadoTexto}</span>
              </div>
              <p class="subtitle">${titulo}</p>
            </div>
            <div class="content">
              <h1>Hola ${nombre},</h1>
              <p>${intro}</p>

              <div class="card">
                <div class="card-title">Detalles de la cita</div>
                <div class="info-grid">
                  <div>
                    <div class="label">Fecha y hora</div>
                    <div class="value">${fechaHumana || ''}</div>
                    <div class="value-secondary">${horaRango || ''} (${timezone || 'America/Bogota'})</div>
                  </div>
                  <div>
                    <div class="label">Servicio</div>
                    <div class="value">${servicio || 'Cita de servicio'}</div>
                    ${agente ? `<div class="value-secondary">Agente asignado: ${agente}</div>` : ''}
                  </div>
                  <div>
                    <div class="label">Ubicacion</div>
                    <div class="value">${direccion || 'Pendiente por confirmar'}</div>
                  </div>
                  ${observaciones ? `
                    <div>
                      <div class="label">Notas que compartiste</div>
                      <div class="value-secondary" style="font-weight:600;">${observaciones}</div>
                    </div>
                  ` : ''}
                </div>
              </div>

              ${calendarLink ? `<a class="cta" href="${calendarLink}" target="_blank" rel="noopener noreferrer">${ctaLabel || 'Agregar en Google Calendar'}</a>` : ''}
              ${note ? `<p class="note">${note}</p>` : ''}

              <div class="section-title">Que sigue</div>
              <div class="bullet"><span class="bullet-icon"></span><span>Revisa tu correo: enviamos esta confirmación con los detalles de la cita.</span></div>
              <div class="bullet"><span class="bullet-icon"></span><span>Espera nuestra llamada o correo para confirmar la hora definitiva.</span></div>
              <div class="bullet"><span class="bullet-icon"></span><span>Si necesitas ajustar algo, responde este correo y lo coordinamos.</span></div>

              ${mensajeExtra ? `<div class="note" style="font-weight:700; margin-top:12px;">${mensajeExtra}</div>` : ''}
            </div>
            <div class="footer">
              <div>Si necesitas ayuda, escribenos a <a href="mailto:hola@matrizinmobiliaria.com">hola@matrizinmobiliaria.com</a></div>
              <div style="margin-top:8px;">&copy; 2025 Matriz Inmobiliaria. Todos los derechos reservados.</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generarTemplateInvitacion(nombreCompleto = "", codigo6d, expiraEn, activationLink, correo, rolAsignado = null, esAdministrativo = false) {
    const primerNombre = nombreCompleto.trim().split(" ")[0] || "Hola";
    const logoUrl = process.env.EMAIL_LOGO_URL || "https://matrizinmobiliaria.com/images/logo-matriz-sin-fondo.png";
    const expiraTexto = expiraEn ? new Date(expiraEn).toLocaleString() : '';
    const rolTexto = rolAsignado || (esAdministrativo ? 'Administrativo' : 'Usuario');
    const badge = esAdministrativo ? 'Acceso administrativo' : 'Acceso a la plataforma';

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
          .badge { display:inline-block; padding:8px 12px; background:rgba(27,95,140,0.1); color:#1b5f8c; font-weight:700; border-radius:10px; margin-top:8px; }
          .role { padding:12px 14px; background:#f6f9fc; border:1px solid #e4ebf3; border-radius:12px; margin:12px 0; color:#0f2b46; font-weight:700; }
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
              <p>${esAdministrativo ? 'Fuiste asignado como parte del equipo administrativo. Necesitamos que actives tu acceso y definas tu contraseña.' : 'Hemos creado una cuenta para ti en Matriz Inmobiliaria. Para comenzar, activa tu cuenta y define tu contraseña.'}</p>
              <p><strong>Tu correo de acceso:</strong> ${correo || ''}</p>
              <div class="badge">${badge}</div>
              <div class="role">Rol asignado: ${rolTexto}</div>
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



