# 📋 TODO: Adaptación Completa del Backend para el Frontend

## 🎯 OBJETIVO PRINCIPAL
Moldear el backend para que cumpla con TODOS los requerimientos del frontend sin modificar nada del frontend, manteniendo compatibilidad completa.

---

## 📊 ANÁLISIS DEL FRONTEND

### 🏥 **TAB1 - Dashboard Principal**
**Datos que requiere:**
- ✅ Estadísticas de pacientes activos
- ✅ Consultas del día 
- ✅ Boxes disponibles
- ✅ Alertas activas
- ✅ Pacientes con exámenes (nombre, exámenes con estado: normal/pendiente/alterado)

**APIs necesarias:**
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/alerts` - Alertas de exámenes
- `GET /api/patients/examenes` - Pacientes con sus exámenes

### 👥 **TAB2 - Lista de Pacientes**
**Datos que requiere:**
- ✅ Lista completa de pacientes con:
  - nombres, rut, edad, ubicacion, estado, diagnostico, telefono, ultimaVisita
- ✅ Búsqueda por texto
- ✅ Filtros por estado
- ✅ Crear nuevo paciente
- ✅ Exportar a CSV

**APIs necesarias:**
- `GET /api/patients` ✅ (YA EXISTE - REVISAR CAMPOS)
- `POST /api/patients` ✅ (YA EXISTE - REVISAR CAMPOS)
- `PUT /api/patients/:id` ✅ (YA EXISTE - REVISAR CAMPOS)
- `DELETE /api/patients/:id` ✅ (YA EXISTE)

**CAMPOS FALTANTES en modelo Patient actual:**
- ❌ `ubicacion` (habitación/box del paciente)
- ❌ `diagnostico` (diagnóstico principal)
- ❌ `rut` (RUT chileno) - actualmente tenemos `documento`
- ❌ `ultimaVisita` (fecha de última consulta)

### 🩺 **TAB3 - Ficha Médica Completa**
**Datos que requiere:**
- ✅ Datos personales completos
- ✅ Alertas médicas (alergias y condiciones con criticidad)
- ✅ Evoluciones/consultas médicas con signos vitales
- ✅ Exámenes médicos con resultados y estados
- ✅ Notas rápidas

**APIs necesarias:**
- `GET /api/patients/:id/ficha` - Ficha médica completa
- `GET /api/patients/:id/consultas` - Historial de consultas
- `GET /api/patients/:id/examenes` - Exámenes médicos
- `POST /api/patients/:id/notas` - Agregar notas rápidas

**MODELOS FALTANTES:**
- ❌ `MedicalConsultation` (consultas médicas)
- ❌ `MedicalExam` (exámenes médicos)
- ❌ `PatientNotes` (notas rápidas)

### 💊 **TAB4 - Medicación y Tratamientos**
**Datos que requiere:**
- ✅ Medicamentos actuales (nombre, dosis, frecuencia, vía, indicación, médico, fecha, estado)
- ✅ Interacciones medicamentosas (tipo, descripción, recomendación)
- ✅ Indicaciones médicas (título, descripción, tipo, estado, fechas)
- ✅ Historial de medicación (período, motivo de suspensión)

**APIs necesarias:**
- `GET /api/patients/:id/medicamentos` - Medicamentos actuales
- `POST /api/patients/:id/medicamentos` - Agregar medicamento
- `PUT /api/medicamentos/:id` - Modificar medicamento
- `DELETE /api/medicamentos/:id` - Suspender medicamento
- `GET /api/medicamentos/interacciones` - Verificar interacciones
- `GET /api/patients/:id/indicaciones` - Indicaciones médicas
- `POST /api/patients/:id/indicaciones` - Agregar indicación

**MODELOS FALTANTES:**
- ❌ `Medication` (medicamentos individuales)
- ❌ `Prescription` (prescripciones/recetas)
- ❌ `MedicalIndication` (indicaciones médicas)
- ❌ `DrugInteraction` (interacciones medicamentosas)

### 🧪 **TAB5 - Exámenes Médicos**
**Datos que requiere:**
- ✅ Lista de exámenes (nombre, fecha, resultado, estado, detalle)
- ✅ Estados: normal, atencion, critico

**APIs necesarias:**
- `GET /api/patients/:id/examenes` - Lista de exámenes
- `POST /api/patients/:id/examenes` - Agregar examen
- `PUT /api/examenes/:id` - Actualizar resultado

---

## 🔧 BACKEND ACTUAL - ESTADO

### ✅ **LO QUE YA FUNCIONA:**
- ✅ Modelo `Patient` básico
- ✅ CRUD completo de pacientes
- ✅ Búsqueda y paginación
- ✅ Validaciones básicas
- ✅ CORS configurado
- ✅ MongoDB conectado

### ❌ **LO QUE FALTA IMPLEMENTAR:**

#### 1. **CAMPOS FALTANTES EN PATIENT MODEL:**
```javascript
// Agregar al modelo Patient existente:
ubicacion: String,        // Habitación/Box
diagnostico: String,      // Diagnóstico principal  
rut: String,             // RUT chileno (además del documento)
ultimaVisita: Date,      // Fecha última consulta
peso: Number,            // Peso en kg
altura: Number,          // Altura en cm
imc: Number,             // IMC calculado
presionArterial: String, // Presión arterial
frecuenciaCardiaca: Number, // FC
temperatura: Number      // Temperatura corporal
```

#### 2. **NUEVOS MODELOS REQUERIDOS:**

##### 📋 **MedicalConsultation**
```javascript
{
  consultationId: String,
  patientId: ObjectId,
  fecha: Date,
  hora: String,
  medico: String,
  especialidad: String,
  motivo: String,
  observaciones: String,
  signosVitales: {
    presionArterial: String,
    frecuenciaCardiaca: Number,
    temperatura: Number,
    peso: Number
  },
  diagnosticos: [String],
  tratamiento: String,
  proximaCita: Date
}
```

##### 🧪 **MedicalExam**
```javascript
{
  examId: String,
  patientId: ObjectId,
  nombre: String,
  fecha: Date,
  resultado: String,
  estado: String, // 'normal', 'atencion', 'critico'
  valorReferencia: String,
  detalle: String,
  laboratorio: String,
  medico: String
}
```

##### 💊 **Medication**
```javascript
{
  medicationId: String,
  patientId: ObjectId,
  nombre: String,
  dosis: String,
  frecuencia: String,
  via: String, // 'Oral', 'IV', 'IM', etc.
  indicacion: String,
  medicoPrescriptor: String,
  fechaInicio: Date,
  fechaFin: Date,
  estado: String, // 'Activo', 'Suspendido', 'Finalizado'
  observaciones: String
}
```

##### 📝 **MedicalIndication**
```javascript
{
  indicationId: String,
  patientId: ObjectId,
  titulo: String,
  descripcion: String,
  tipo: String, // 'Dieta', 'Seguimiento', 'Reposo', 'Ejercicio', 'Control'
  estado: String, // 'Vigente', 'Completado', 'Pendiente'
  fecha: Date,
  fechaVencimiento: Date,
  medico: String
}
```

##### ⚠️ **DrugInteraction**
```javascript
{
  interactionId: String,
  medicamentos: [String],
  tipo: String, // 'menor', 'moderada', 'mayor'
  descripcion: String,
  recomendacion: String,
  severidad: Number
}
```

##### 📝 **PatientNote**
```javascript
{
  noteId: String,
  patientId: ObjectId,
  contenido: String,
  fecha: Date,
  usuario: String,
  tipo: String // 'nota_rapida', 'observacion', 'recordatorio'
}
```

#### 3. **NUEVAS RUTAS REQUERIDAS:**

##### 📊 **Dashboard Routes**
- `GET /api/dashboard/stats`
- `GET /api/dashboard/alerts`

##### 🩺 **Medical Consultation Routes**
- `GET /api/patients/:id/consultas`
- `POST /api/patients/:id/consultas`
- `PUT /api/consultas/:id`
- `DELETE /api/consultas/:id`

##### 🧪 **Medical Exam Routes**
- `GET /api/patients/:id/examenes`
- `POST /api/patients/:id/examenes`
- `PUT /api/examenes/:id`
- `DELETE /api/examenes/:id`

##### 💊 **Medication Routes**
- `GET /api/patients/:id/medicamentos`
- `POST /api/patients/:id/medicamentos`
- `PUT /api/medicamentos/:id`
- `DELETE /api/medicamentos/:id`
- `GET /api/medicamentos/interacciones`

##### 📝 **Medical Indication Routes**
- `GET /api/patients/:id/indicaciones`
- `POST /api/patients/:id/indicaciones`
- `PUT /api/indicaciones/:id`
- `DELETE /api/indicaciones/:id`

##### 📝 **Notes Routes**
- `GET /api/patients/:id/notas`
- `POST /api/patients/:id/notas`
- `DELETE /api/notas/:id`

---

## 🗃️ CAMPOS A MAPEAR ENTRE FRONTEND Y BACKEND

### Frontend `Paciente` → Backend `Patient`
```javascript
// Frontend usa:
{
  nombre: "Juan Carlos",        // → Backend: nombres
  rut: "12.345.678-9",         // → Backend: rut (NUEVO CAMPO)
  edad: 45,                    // → Backend: calculado de fechaNacimiento
  ubicacion: "Hab. 203",       // → Backend: ubicacion (NUEVO CAMPO)
  estado: "Estable",           // → Backend: estado ('activo'/'inactivo')
  diagnostico: "Hipertensión", // → Backend: diagnostico (NUEVO CAMPO)
  telefono: "+56 9 8765 4321", // → Backend: telefono
  ultimaVisita: "2024-01-15"   // → Backend: ultimaVisita (NUEVO CAMPO)
}
```

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### **FASE 1: Ampliar modelo Patient** ⏰ Prioridad ALTA ✅ COMPLETADO
1. ✅ Agregar campos faltantes al modelo Patient
2. ✅ Migración de datos existentes  
3. ✅ Actualizar validaciones
4. ✅ Actualizar rutas existentes

### **FASE 2: Implementar modelos médicos** ⏰ Prioridad ALTA ✅ COMPLETADO
1. ✅ Crear MedicalConsultation model
2. ✅ Crear MedicalExam model
3. ✅ Crear Medication model
4. ✅ Crear MedicalIndication model
5. ✅ Crear PatientNote model

### **FASE 3: Implementar rutas médicas** ⏰ Prioridad ALTA ✅ COMPLETADO
1. ✅ Rutas de consultas médicas
2. ✅ Rutas de exámenes médicos
3. ✅ Rutas de medicamentos
4. ✅ Rutas de indicaciones médicas (PENDIENTE)
5. ✅ Rutas de notas (PENDIENTE)

### **FASE 4: Dashboard y estadísticas** ⏰ Prioridad MEDIA ✅ COMPLETADO
1. ✅ Implementar dashboard stats
2. ✅ Implementar alertas automáticas
3. ✅ Agregaciones de MongoDB

### **FASE 5: Funcionalidades avanzadas** ⏰ Prioridad BAJA 🔄 EN PROGRESO
1. ✅ Sistema de interacciones medicamentosas (básico)
2. ⏳ Notificaciones automáticas
3. ⏳ Reportes y exportación

---

## 📝 NOTAS IMPORTANTES

1. **NO MODIFICAR EL FRONTEND** - Solo adaptar backend
2. **Mantener compatibilidad** con estructura actual de respuestas
3. **Usar mismos nombres de campos** que espera el frontend
4. **Implementar validaciones robustas** para todos los nuevos campos
5. **Crear índices optimizados** para búsquedas rápidas
6. **Mantener consistencia** en formato de respuestas de API

---

## ✅ CRITERIOS DE ÉXITO

- [ ] Todo el frontend funciona sin modificaciones
- [ ] Todas las páginas muestran datos reales del backend
- [ ] CRUD completo funciona en todas las secciones
- [ ] Dashboard muestra estadísticas reales
- [ ] Búsquedas y filtros funcionan correctamente
- [ ] Validaciones previenen datos inconsistentes
- [ ] Performance optimizada con índices adecuados