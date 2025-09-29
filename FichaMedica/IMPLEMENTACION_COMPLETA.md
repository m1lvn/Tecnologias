# DynamoDB - Guía de Instalación y Configuración Completa

## ✅ Resumen de lo que ya hemos completado:

1. ✅ **Análisis del modelo de datos relacional**
2. ✅ **Diseño de esquemas DynamoDB optimizados**
3. ✅ **Instalación de AWS SDK en el proyecto**
4. ✅ **Implementación de servicios Angular para CRUD**
5. ✅ **Scripts de creación de tablas DynamoDB**
6. ✅ **Modelos TypeScript para DynamoDB**

## 📋 Archivos creados:

- `src/app/models/dynamodb-schema.ts` - Interfaces y esquemas
- `src/app/services/dynamodb.service.ts` - Servicio principal de DynamoDB
- `src/environments/environment.aws.ts` - Configuración de AWS
- `scripts/setup-dynamodb.ts` - Script de configuración de tablas
- `src/app/components/patient-management.component.ts` - Ejemplo de uso
- `DYNAMODB_SETUP.md` - Documentación completa

## 🚀 Próximos pasos para completar la implementación:

### 1. Instalar DynamoDB Local (para desarrollo)

#### Opción A: Usando Docker (Recomendado)
```powershell
# Descargar e iniciar DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -inMemory -sharedDb
```

#### Opción B: Instalación Manual
```powershell
# Descargar DynamoDB Local
Invoke-WebRequest -Uri "https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.zip" -OutFile "dynamodb_local.zip"
Expand-Archive -Path "dynamodb_local.zip" -DestinationPath "dynamodb_local"

# Ejecutar (requiere Java)
cd dynamodb_local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

### 2. Crear las tablas DynamoDB

Con DynamoDB Local ejecutándose, ejecutar:

```powershell
# Crear tabla e insertar datos de prueba
npm run dynamodb:setup

# Solo crear tabla
npm run dynamodb:create

# Ver información de la tabla
npm run dynamodb:describe
```

### 3. Configurar el componente en tu aplicación

Agregar el componente a tu módulo principal:

```typescript
// app.module.ts
import { PatientManagementComponent } from './components/patient-management.component';

@NgModule({
  declarations: [
    // ... otros componentes
    PatientManagementComponent
  ],
  // ...
})
```

### 4. Configurar FormsModule para ngModel

```typescript
// app.module.ts
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    // ... otros imports
    FormsModule
  ],
  // ...
})
```

### 5. Usar el componente en tus páginas

```html
<!-- En cualquier página/tab -->
<app-patient-management></app-patient-management>
```

## 🔧 Configuración para Producción

### 1. Crear cuenta AWS y configurar DynamoDB

1. **Crear cuenta AWS**: https://aws.amazon.com/
2. **Crear usuario IAM** con permisos DynamoDB
3. **Configurar credenciales** (AWS CLI o variables de entorno)

### 2. Actualizar configuración

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  aws: {
    region: 'us-east-1', // Tu región AWS
    production: {
      endpoint: undefined // Usar endpoint por defecto de AWS
    }
  },
  dynamodb: {
    tableName: 'MedicalRecords-Production'
  }
};
```

### 3. Crear tabla en AWS

```bash
# Usando AWS CLI
aws dynamodb create-table --cli-input-json file://table-config.json
```

## 🎯 Estructura Final de la Base de Datos

### Tabla Principal: `MedicalRecords`

| PK | SK | Datos |
|----|----|-------|
| `PATIENT#123` | `PROFILE` | Información básica del paciente |
| `PATIENT#123` | `CONSULTATION#001` | Consulta médica |
| `PATIENT#123` | `EXAM#001` | Examen médico |
| `PATIENT#123` | `PRESCRIPTION#001` | Receta médica |
| `DOCTOR#456` | `PROFILE` | Información básica del médico |
| `MEDICATION#789` | `INFO` | Información del medicamento |

### Patrones de Consulta Optimizados

1. **Obtener paciente**: `PK = PATIENT#123, SK = PROFILE`
2. **Historial de paciente**: `PK = PATIENT#123, SK begins_with CONSULTATION`
3. **Exámenes de paciente**: `PK = PATIENT#123, SK begins_with EXAM`
4. **Buscar por nombre**: Scan con filtro en nombre/apellido

## 🧪 Datos de Prueba Incluidos

El script crea automáticamente:
- 1 Paciente de ejemplo (Juan Pérez)
- 1 Médico de ejemplo (Dra. María González)
- 1 Medicamento de ejemplo (Paracetamol)

## 🔍 Comandos Útiles

```powershell
# Ver todas las tablas
aws dynamodb list-tables --endpoint-url http://localhost:8000

# Escanear contenido de la tabla
aws dynamodb scan --table-name MedicalRecords --endpoint-url http://localhost:8000

# Eliminar tabla (cuidado!)
npm run dynamodb:delete
```

## 📱 Integración con Ionic

El componente `PatientManagementComponent` ya incluye:
- ✅ Formulario para crear pacientes
- ✅ Buscador de pacientes
- ✅ Visualización de historial médico
- ✅ Interfaz optimizada para móvil
- ✅ Manejo de estados de carga
- ✅ Validación de formularios

## 🚨 Errores Comunes y Soluciones

### Error: "UnknownError 302"
**Causa**: DynamoDB Local no está ejecutándose
**Solución**: Iniciar DynamoDB Local antes de ejecutar scripts

### Error: "AccessDenied"
**Causa**: Credenciales AWS incorrectas
**Solución**: Verificar AWS CLI o variables de entorno

### Error: "ResourceNotFoundException"
**Causa**: Tabla no existe
**Solución**: Ejecutar `npm run dynamodb:create`

## 📈 Próximas Mejoras Sugeridas

1. **Autenticación**: Integrar AWS Cognito
2. **Realtime**: Usar AWS AppSync para sincronización
3. **Archivos**: Integrar S3 para documentos médicos
4. **Notificaciones**: AWS SNS para recordatorios
5. **Analytics**: CloudWatch para métricas
6. **Backup**: Configurar backups automáticos

¡Tu sistema de gestión de fichas médicas con DynamoDB está listo para funcionar! 🎉