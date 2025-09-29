// Configuración de entorno para MongoDB
export const environment = {
  production: false,
  
  // URL de la API del backend
  apiUrl: 'http://localhost:3000/api',
  
  // Configuración de MongoDB
  mongodb: {
    // Para desarrollo local
    local: {
      uri: 'mongodb://localhost:27017/fichamedica',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4 // Use IPv4, skip trying IPv6
      }
    },
    
    // Para MongoDB Atlas (producción)
    atlas: {
      uri: 'mongodb+srv://username:password@cluster.mongodb.net/fichamedica', // Para development usar local
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000
      }
    },
    
    // Configuración activa
    active: 'local' // 'local' | 'atlas'
  },
  
  // Configuración de autenticación
  auth: {
    jwtSecret: 'fichamedica-dev-secret-key-2025', // Solo para development
    jwtExpiresIn: '7d',
    bcryptRounds: 12,
    sessionTimeout: 8 * 60 * 60 * 1000 // 8 horas en milisegundos
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
  
  // Configuración de logs
  logging: {
    level: 'debug', // 'error' | 'warn' | 'info' | 'debug'
    enableConsole: true,
    enableFile: false,
    maxFileSize: '10MB',
    maxFiles: 5
  },
  
  // Configuración de cache
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutos
    maxItems: 1000,
    enabled: true
  },
  
  // APIs externas
  externalApis: {
    // API de medicamentos (ejemplo)
    medicamentos: {
      baseUrl: 'https://api.medicamentos.gob.cl',
      timeout: 10000,
      retries: 3
    },
    
    // API de códigos CIE-10
    cie10: {
      baseUrl: 'https://api.cie10.cl',
      timeout: 5000,
      retries: 2
    }
  }
};

// Configuración específica para desarrollo
export const developmentConfig = {
  ...environment,
  production: false,
  apiUrl: 'http://localhost:3000/api',
  logging: {
    ...environment.logging,
    level: 'debug',
    enableConsole: true
  }
};

// Configuración específica para testing
export const testConfig = {
  ...environment,
  mongodb: {
    ...environment.mongodb,
    local: {
      ...environment.mongodb.local,
      uri: 'mongodb://localhost:27017/fichamedica_test'
    }
  },
  logging: {
    ...environment.logging,
    level: 'error',
    enableConsole: false
  }
};