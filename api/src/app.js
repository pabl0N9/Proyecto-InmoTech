require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const corsOptions = require('./config/cors');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');
const { generalLimiter, sanitizeInput } = require('./middlewares/security.middleware');
const logger = require('./utils/logger');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));

app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

app.use(sanitizeInput);

app.use(generalLimiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Inmotech - Módulo de Citas',
    version: process.env.API_VERSION || 'v1',
    documentation: '/api/v1/health'
  });
});

app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
