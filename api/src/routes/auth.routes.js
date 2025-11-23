const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validarNoEsAdmin } = require('../middlewares/admin.middleware');
const { loginLimiter } = require('../middlewares/security.middleware');
const {
  registroSchema,
  loginSchema,
  cambiarContrasenaSchema,
  actualizarPerfilSchema,
  refreshTokenSchema,
  verifyEmailSchema
} = require('../validators/auth.validator');

// Rutas públicas
router.post('/register', validate(registroSchema), authController.registrarUsuario);
router.post('/login', loginLimiter, validate(loginSchema), authController.iniciarSesion);
router.post('/refresh', validate(refreshTokenSchema), authController.refrescarToken);
router.get('/verify-email', loginLimiter, validateQuery(verifyEmailSchema), authController.verificarCorreo);

// Rutas protegidas
router.use(authenticateToken); // Todas las rutas siguientes requieren autenticación

router.get('/me', authController.obtenerPerfil);
router.patch('/me', validate(actualizarPerfilSchema), authController.actualizarPerfil);
router.patch('/change-password', validate(cambiarContrasenaSchema), authController.cambiarContrasena);
router.get('/password-last-changed', authController.obtenerUltimoCambioPassword);
router.post('/logout', authController.cerrarSesion);

module.exports = router;
