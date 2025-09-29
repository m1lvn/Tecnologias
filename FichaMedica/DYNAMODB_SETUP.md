# Guía de Configuración DynamoDB

## Paso a Paso para Configurar DynamoDB

### 1. Instalación de DynamoDB Local (para desarrollo)

```bash
# Descargar DynamoDB Local
curl -O https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.zip
unzip dynamodb_local_latest.zip

# O usar Docker
docker run -p 8000:8000 amazon/dynamodb-local
```

### 2. Ejecutar DynamoDB Local

```bash
# Navegar al directorio de DynamoDB Local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

# O con Docker
docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -inMemory -sharedDb
```

### 3. Configurar el proyecto

```bash
# Instalar dependencias (ya hecho)
npm install aws-sdk @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb uuid @types/uuid

# Compilar TypeScript a JavaScript para el script
npx tsc scripts/setup-dynamodb.ts --target es2020 --module commonjs --moduleResolution node --esModuleInterop true --outDir scripts/dist
```

### 4. Crear las tablas DynamoDB

```bash
# Crear tabla principal
node scripts/dist/setup-dynamodb.js create

# Crear tabla e insertar datos de prueba
node scripts/dist/setup-dynamodb.js setup

# Ver información de la tabla
node scripts/dist/setup-dynamodb.js describe
```

### 5. Configurar credenciales AWS (para producción)

#### Opción A: AWS CLI
```bash
aws configure
```

#### Opción B: Variables de entorno
```bash
export AWS_ACCESS_KEY_ID=tu_access_key
export AWS_SECRET_ACCESS_KEY=tu_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

#### Opción C: IAM Roles (recomendado para producción)
- Crear rol IAM con permisos DynamoDB
- Asignar rol a instancia EC2 o función Lambda

### 6. Actualizar configuración del servicio

Editar `src/app/services/dynamodb.service.ts`:

```typescript
// Para desarrollo local
configureCredentials('dummy', 'dummy', 'us-east-1');

// Para producción (sin credenciales hardcodeadas)
const dynamoClient = new DynamoDBClient({
  region: 'us-east-1'
  // Las credenciales se obtienen automáticamente del entorno
});
```

## Estructura de Datos DynamoDB

### Tabla Principal: MedicalRecords

| PK | SK | Tipo | Descripción |
|----|----|------|-------------|
| PATIENT#123 | PROFILE | Paciente | Datos básicos del paciente |
| PATIENT#123 | CONSULTATION#001 | Consulta | Consulta médica específica |
| PATIENT#123 | EXAM#001 | Examen | Examen médico específico |
| PATIENT#123 | PRESCRIPTION#001 | Receta | Receta médica específica |
| DOCTOR#456 | PROFILE | Médico | Datos básicos del médico |
| MEDICATION#789 | INFO | Medicamento | Información del medicamento |

### Índices Secundarios Globales (GSI)

#### GSI1-DoctorDate
- **GSI1PK**: DOCTOR#doctorId
- **GSI1SK**: CONSULTATION#fecha
- **Uso**: Consultar citas por médico y fecha

#### GSI2-PatientType
- **GSI2PK**: PATIENT#patientId
- **GSI2SK**: {TIPO}#fecha
- **Uso**: Consultar historial por paciente y tipo

## Comandos Útiles

### DynamoDB Local
```bash
# Listar tablas
aws dynamodb list-tables --endpoint-url http://localhost:8000

# Escanear tabla
aws dynamodb scan --table-name MedicalRecords --endpoint-url http://localhost:8000

# Insertar item
aws dynamodb put-item --table-name MedicalRecords --item file://sample-data.json --endpoint-url http://localhost:8000
```

### AWS CLI (producción)
```bash
# Listar tablas
aws dynamodb list-tables

# Describir tabla
aws dynamodb describe-table --table-name MedicalRecords

# Crear backup
aws dynamodb create-backup --table-name MedicalRecords --backup-name medical-records-backup
```

## Patrones de Acceso Optimizados

### 1. Obtener perfil de paciente
```typescript
const patient = await dynamoService.getPatient('patient-123');
```

### 2. Obtener todas las consultas de un paciente
```typescript
const consultations = await dynamoService.getPatientConsultations('patient-123');
```

### 3. Obtener consultas de un médico por fecha
```typescript
// Implementar con GSI1
const consultations = await dynamoService.queryItems(
  'DOCTOR#doctor-456',
  'CONSULTATION#2024'
);
```

### 4. Buscar pacientes por nombre
```typescript
const patients = await dynamoService.searchPatientsByName('Juan');
```

## Migración de Datos

Si tienes datos existentes en una base de datos relacional:

1. **Exportar datos** de la BD relacional
2. **Transformar estructura** para DynamoDB
3. **Usar AWS Data Pipeline** o **Amazon DMS** para migración masiva
4. **Validar datos** migrados

## Monitoreo y Métricas

- **AWS CloudWatch**: Métricas de rendimiento
- **AWS X-Ray**: Trazabilidad de requests
- **DynamoDB Insights**: Análisis de patrones de acceso

## Seguridad

- **Encriptación**: Activar encryption at rest
- **IAM Policies**: Permisos granulares
- **VPC Endpoints**: Tráfico privado
- **Audit Logging**: AWS CloudTrail

## Backup y Recuperación

- **Point-in-time Recovery**: Activado automáticamente
- **On-demand Backups**: Para momentos específicos
- **Cross-region Replication**: Para alta disponibilidad