const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - IMPORTANTE PARA EL FRONTEND
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8100').split(',');
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fichamedica';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Crear índices para optimización
    await createIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const Patient = require('./models/Patient');
    
    // Índices para búsquedas rápidas
    await Patient.collection.createIndex({ documento: 1 }, { unique: true });
    await Patient.collection.createIndex({ email: 1 });
    await Patient.collection.createIndex({ nombres: 1, apellidos: 1 });
    await Patient.collection.createIndex({ estado: 1 });
    await Patient.collection.createIndex({ fechaCreacion: -1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.log('⚠️  Indexes already exist or error creating them:', error.message);
  }
};

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API Routes
app.use('/api/patients', require('./routes/patients'));

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/patients',
      'POST /api/patients',
      'GET /api/patients/:id',
      'PUT /api/patients/:id',
      'DELETE /api/patients/:id'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FichaMedica Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global Error:', error);
  
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(e => e.message).join(', ');
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry - this record already exists';
  } else if (error.message) {
    message = error.message;
  }
  
  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Handle 404 for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/health`);
      console.log(`📋 Patients API: http://localhost:${PORT}/api/patients`);
      console.log(`🔄 Environment: ${process.env.NODE_ENV}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔗 Frontend should be running on: ${process.env.FRONTEND_URL}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('📊 MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('📊 MongoDB connection closed');
    process.exit(0);
  });
});

// Start the server
startServer();