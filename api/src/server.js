const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Iniciando servidor...');

    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos. Abortando inicio del servidor.');
      process.exit(1);
    } // <-- AGREGADA ESTA LLAVE QUE FALTABA

    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📚 API: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
      console.log(`💚 Health: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}/health`);
      console.log(`=================================================`);
    });

    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} recibido. Cerrando servidor gracefully...`);
      server.close(() => {
        console.log('Servidor cerrado.');
        process.exit(0);
      });

      setTimeout(() => {
        console.log('No se pudo cerrar el servidor gracefully, forzando cierre...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      console.error('Excepción no capturada:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Promesa rechazada no manejada:', { reason, promise });
      process.exit(1);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
