// Configuración de entorno para AWS DynamoDB
export const environment = {
  production: false,
  
  // Configuración AWS
  aws: {
    region: 'us-east-1', // Cambia por tu región AWS
    
    // Para desarrollo local con DynamoDB Local
    local: {
      endpoint: 'http://localhost:8000',
      credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy'
      }
    },
    
    // Para producción - configurar con variables de entorno
    production: {
      // No colocar credenciales aquí en código fuente
      // Usar AWS IAM roles o variables de entorno
      endpoint: undefined // Usar endpoint por defecto de AWS
    }
  },
  
  // Configuración de tablas DynamoDB
  dynamodb: {
    tableName: 'MedicalRecords',
    
    // Configuración de índices
    indexes: {
      doctorDate: 'GSI1-DoctorDate',
      patientType: 'GSI2-PatientType'
    }
  }
};