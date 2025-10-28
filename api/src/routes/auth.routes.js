const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validarNoEsAdmin } = require('../middlewares/admin.middleware');
const {
  registroSchema,
  loginSchema,
  cambiarContrasenaSchema,
  actualizarPerfilSchema,
  refreshTokenSchema
} = require('../validators/auth.validator');

// Rutas públicas
router.post('/register', validate(registroSchema), authController.registrarUsuario);
router.post('/login', validate(loginSchema), authController.iniciarSesion);
router.post('/refresh', validate(refreshTokenSchema), authController.refrescarToken);

// Rutas protegidas
router.use(authenticateToken); // Todas las rutas siguientes requieren autenticación

router.get('/me', authController.obtenerPerfil);
router.patch('/me', validate(actualizarPerfilSchema), authController.actualizarPerfil);
router.patch('/change-password', validate(cambiarContrasenaSchema), authController.cambiarContrasena);
router.post('/logout', authController.cerrarSesion);

module.exports = router;
