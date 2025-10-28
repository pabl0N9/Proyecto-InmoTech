const app = require('./app');
const { testConnection } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    logger.info('Iniciando servidor...');

    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('No se pudo conectar a la base de datos. Abortando inicio del servidor.');
      process.exit(1);
    } // <-- AGREGADA ESTA LLAVE QUE FALTABA

    const server = app.listen(PORT, () => {
      logger.info(`=================================================`);
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`📚 API: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
      logger.info(`💚 Health: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}/health`);
      logger.info(`=================================================`);
    });

    const gracefulShutdown = (signal) => {
      logger.info(`\n${signal} recibido. Cerrando servidor gracefully...`);
      server.close(() => {
        logger.info('Servidor cerrado.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('No se pudo cerrar el servidor gracefully, forzando cierre...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('Excepción no capturada:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Promesa rechazada no manejada:', { reason, promise });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
