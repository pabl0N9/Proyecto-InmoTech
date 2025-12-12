const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { loginLimiter, invitationLimiter } = require('../middlewares/security.middleware');
const {
  registroSchema,
  loginSchema,
  cambiarContrasenaSchema,
  actualizarPerfilSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  verifyCodeSchema,
  resendCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordTokenSchema
} = require('../validators/auth.validator');

// Rutas públicas
router.post('/register', validate(registroSchema), authController.registrarUsuario);
// Se desactiva el rate limiter para evitar bloqueos por 429 en entorno actual
router.post('/login', validate(loginSchema), authController.iniciarSesion);
router.post('/refresh', validate(refreshTokenSchema), authController.refrescarToken);
router.get('/verify-email', loginLimiter, validateQuery(verifyEmailSchema), authController.verificarCorreo);
router.post('/verify-code', invitationLimiter, validate(verifyCodeSchema), authController.verificarCodigo);
router.post('/resend-code', invitationLimiter, validate(resendCodeSchema), authController.reenviarCodigo);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.solicitarRecuperacionContrasena);
router.get('/reset-password', validateQuery(resetPasswordTokenSchema), authController.validarTokenRecuperacion);
router.post('/reset-password', validate(resetPasswordSchema), authController.restablecerContrasena);

// Rutas protegidas
router.use(authenticateToken); // Todas las rutas siguientes requieren autenticación

router.get('/me', authController.obtenerPerfil);
router.patch('/me', validate(actualizarPerfilSchema), authController.actualizarPerfil);
router.patch('/change-password', validate(cambiarContrasenaSchema), authController.cambiarContrasena);
router.get('/password-last-changed', authController.obtenerUltimoCambioPassword);
router.post('/logout', authController.cerrarSesion);

module.exports = router;
