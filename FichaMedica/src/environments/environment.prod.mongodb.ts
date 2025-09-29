// Configuración de entorno para producción con MongoDB
export const environment = {
  production: true,
  
  // Configuración de MongoDB para producción
  mongodb: {
    // MongoDB Atlas (producción)
    atlas: {
      uri: 'mongodb+srv://username:password@cluster.mongodb.net/fichamedica', // Configurar en CI/CD
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        ssl: true,
        authSource: 'admin'
      }
    },
    
    // Configuración activa para producción
    active: 'atlas'
  },
  
  // Configuración de autenticación para producción
  auth: {
    jwtSecret: '', // DEBE ser configurado en tiempo de build
    jwtExpiresIn: '24h',
    bcryptRounds: 15, // Mayor seguridad en producción
    sessionTimeout: 4 * 60 * 60 * 1000 // 4 horas en milisegundos
  },
  
  // Configuración de la aplicación
  app: {
    name: 'FichaMedica',
    version: '1.0.0',
    defaultLanguage: 'es',
    timezone: 'America/Santiago',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm'
  },
  
  // Configuración de logs para producción
  logging: {
    level: 'info', // Solo logs importantes en producción
    enableConsole: false,
    enableFile: true,
    maxFileSize: '50MB',
    maxFiles: 10
  },
  
  // Configuración de cache
  cache: {
    ttl: 10 * 60 * 1000, // 10 minutos
    maxItems: 5000,
    enabled: true
  },
  
  // APIs externas
  externalApis: {
    // API de medicamentos
    medicamentos: {
      baseUrl: 'https://api.medicamentos.gob.cl', // Configurar en CI/CD
      timeout: 15000,
      retries: 3,
      apiKey: '' // Configurar en CI/CD
    },
    
    // API de códigos CIE-10
    cie10: {
      baseUrl: 'https://api.cie10.cl', // Configurar en CI/CD
      timeout: 10000,
      retries: 2,
      apiKey: '' // Configurar en CI/CD
    }
  },
  
  // Configuración de seguridad adicional
  security: {
    enableRateLimit: true,
    maxRequestsPerMinute: 100,
    enableCors: true,
    corsOrigins: [], // Configurar en CI/CD
    enableHelmet: true,
    enableCompression: true
  },
  
  // Configuración de monitoreo
  monitoring: {
    enableHealthCheck: true,
    healthCheckInterval: 30000, // 30 segundos
    enableMetrics: true,
    metricsEndpoint: '/metrics'
  }
};