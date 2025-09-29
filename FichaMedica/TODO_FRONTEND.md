# 🔄 TODO FRONTEND - Conectar con Backend Real

## 🎯 OBJETIVO PRINCIPAL
Reemplazar **TODOS** los datos mock/placeholder del frontend con conexiones reales a los endpoints del backend que acabamos de implementar.

---

## 📋 ANÁLISIS COMPLETO DEL FRONTEND

### 🏠 **Tab1Page (Dashboard)** - ❌ USANDO MOCKS
**Archivo**: `src/app/tab1/tab1.page.ts`

#### 🔍 **Datos Mock Identificados**:
```typescript
// LÍNEAS 31-36: Stats hardcodeados
stats = [
  { title: 'Pacientes Activos', value: 42, sub: '28 hospitalizados, 14 ambulatorios', icon: 'people-outline' },
  { title: 'Consultas del Día', value: 18, sub: 'Cardiología: 6, Medicina: 8, Pediatría: 4', icon: 'calendar-outline' },
  { title: 'Boxes Disponibles', value: '3/8', sub: '5 boxes ocupados', icon: 'bed-outline' },
  { title: 'Alertas Activas', value: 7, sub: '2 críticas, 5 moderadas', icon: 'alert-circle-outline' },
];

// LÍNEAS 43-66: Pacientes y exámenes fake
pacientes = [
  {
    nombre: 'Juan Pérez',
    examenes: [
      { nombre: 'Hemograma', estado: 'normal' },
      { nombre: 'Colesterol', estado: 'pendiente' }
    ]
  },
  // ... más datos fake
];
```

#### ✅ **Solución - Conectar con**:
- `GET /api/dashboard/stats` ✅ YA IMPLEMENTADO
- `GET /api/dashboard/alerts` ✅ YA IMPLEMENTADO

---

### 👥 **Tab2Page (Gestión Pacientes)** - ❌ USANDO MOCKS
**Archivo**: `src/app/tab2/tab2.page.ts`

#### 🔍 **Datos Mock Identificados**:
```typescript
// LÍNEAS 55-79: Array hardcodeado de pacientes
pacientes: Paciente[] = [
  {
    nombre: 'Ignacia Castillo',
    rut: '12.345.678-9',
    edad: 45,
    ubicacion: 'Hab. 203',
    estado: 'Estable',
    diagnostico: 'Hipertensión arterial',
    telefono: '+56 9 8765 4321',
    ultimaVisita: '2024-01-15'
  },
  // ... más pacientes fake
];
```

#### ✅ **Solución - Conectar con**:
- `GET /api/patients` ✅ YA IMPLEMENTADO
- `POST /api/patients` ✅ YA IMPLEMENTADO
- `PUT /api/patients/:id` ✅ YA IMPLEMENTADO
- `DELETE /api/patients/:id` ✅ YA IMPLEMENTADO

---

### 🩺 **Tab3Page (Ficha Médica)** - ❌ USANDO MOCKS
**Archivo**: `src/app/tab3/tab3.page.ts`

#### 🔍 **Datos Mock Identificados**:
```typescript
// LÍNEAS 71-156: Ficha médica completa hardcodeada
ficha: FichaMedica = {
  datosPersonales: {
    nombre: 'Ignacia Castilo',
    rut: '12.345.678-9',
    edad: 45,
    tipoSanguineo: 'O+',
    direccion: 'Av. Providencia 1234, Santiago',
    contacto: '+56 9 8765 4321',
    emergencia: 'Pedro González - +56 9 1111 2222'
  },
  alertasMedicas: [
    { tipo: 'alergia', descripcion: 'Penicilina', criticidad: 'alta' },
    // ... más alertas fake
  ],
  examenes: [
    {
      nombre: 'Hemograma completo',
      fecha: '2024-01-20',
      resultado: 'Valores normales',
      estado: 'normal'
    },
    // ... más exámenes fake
  ],
  evoluciones: [
    {
      fecha: '2024-01-21',
      hora: '14:30',
      medico: 'Dr. Luis Martínez',
      especialidad: 'Cardiología',
      motivo: 'Control rutinario',
      observaciones: 'Paciente acude por control rutinario...',
      signosVitales: {
        presionArterial: '125/80 mmHg',
        frecuenciaCardiaca: 72,
        temperatura: 36.5,
        peso: 68
      }
    },
    // ... más consultas fake
  ]
};
```

#### ✅ **Solución - Conectar con**:
- `GET /api/patients/:id` ✅ YA IMPLEMENTADO
- `GET /api/patients/:id/consultas` ✅ YA IMPLEMENTADO
- `GET /api/patients/:id/examenes` ✅ YA IMPLEMENTADO

---

### 💊 **Tab4Page (Medicamentos)** - ❌ USANDO MOCKS
**Archivo**: `src/app/tab4/tab4.page.ts`

#### 🔍 **Datos Mock Identificados**:
```typescript
// LÍNEAS 56-82: Medicamentos actuales hardcodeados
medicamentosActuales: Medicamento[] = [
  {
    id: 1,
    nombre: 'Metformina',
    dosis: '850 mg',
    frecuencia: '2 veces al día',
    via: 'Oral',
    indicacion: 'Control de diabetes mellitus tipo 2',
    medicoPrescriptor: 'Dr. José Fernández',
    fechaInicio: '2024-01-10',
    estado: 'Activo'
  },
  // ... más medicamentos fake
];

// También hay arrays para:
// - interaccionesMedicamentosas
// - indicacionesMedicas
// - historialMedicamentos
```

#### ✅ **Solución - Conectar con**:
- `GET /api/patients/:id/medicamentos` ✅ YA IMPLEMENTADO
- `POST /api/patients/:id/medicamentos` ✅ YA IMPLEMENTADO
- `PUT /api/medicamentos/:id` ✅ YA IMPLEMENTADO
- `DELETE /api/medicamentos/:id` ✅ YA IMPLEMENTADO

---

### 🧪 **Tab5Page (Exámenes)** - ❌ USANDO MOCKS
**Archivo**: `src/app/tab5/tab5.page.ts`

#### 🔍 **Datos Mock Identificados**:
```typescript
// LÍNEAS 14-33: Exámenes hardcodeados
examenes = [
  {
    nombre: 'Hemograma completo',
    fecha: '2024-01-20',
    resultado: 'Valores normales',
    estado: 'normal',
    detalle: 'Todos los valores dentro de rango.'
  },
  // ... más exámenes fake
];
```

#### ✅ **Solución - Conectar con**:
- `GET /api/patients/:id/examenes` ✅ YA IMPLEMENTADO
- `POST /api/patients/:id/examenes` ✅ YA IMPLEMENTADO
- `PUT /api/examenes/:id` ✅ YA IMPLEMENTADO

---

## 🔧 ANÁLISIS DE SERVICIOS EXISTENTES

### ✅ **Servicios ya Implementados (Pero no conectados)**:

#### 1. **PatientService** (`patient.service.ts`)
- ✅ **YA CONECTADO** al backend real
- ✅ Endpoints implementados correctamente
- ✅ Manejo de errores robusto
- ✅ Estado reactivo con BehaviorSubjects

#### 2. **MedicalConsultationService** (`medical-consultation.service.ts`)
- ❌ **NO CONECTADO** - Usa endpoints incorrectos
- ❌ Apunta a `/consultations` en lugar de `/patients/:id/consultas`

#### 3. **MedicationService** (`medication.service.ts`)
- ❌ **NO CONECTADO** - Usa endpoints incorrectos
- ❌ Apunta a `/medications` en lugar de `/patients/:id/medicamentos`

### ❌ **Servicios Faltantes**:
- **DashboardService** - Para estadísticas
- **ExamService** - Para gestión de exámenes
- **AlertService** - Para alertas del sistema

---

## 📅 PLAN DE IMPLEMENTACIÓN

### 🚀 **FASE 1: Crear Servicios Faltantes**
**Prioridad**: CRÍTICA ⚠️

#### 1.1 **DashboardService**
```typescript
// Crear: src/app/services/dashboard.service.ts
class DashboardService {
  getDashboardStats(): Observable<DashboardStats>
  getDashboardAlerts(): Observable<Alert[]>
}
```

#### 1.2 **ExamService**
```typescript
// Crear: src/app/services/exam.service.ts
class ExamService {
  getPatientExams(patientId: string): Observable<ExamListResponse>
  createExam(patientId: string, exam: CreateExamRequest): Observable<Exam>
  updateExam(examId: string, updates: UpdateExamRequest): Observable<Exam>
  deleteExam(examId: string): Observable<void>
}
```

#### 1.3 **AlertService**
```typescript
// Crear: src/app/services/alert.service.ts
class AlertService {
  getActiveAlerts(): Observable<Alert[]>
  markAlertAsRead(alertId: string): Observable<void>
}
```

### 🚀 **FASE 2: Corregir Servicios Existentes**
**Prioridad**: ALTA 🔴

#### 2.1 **Actualizar MedicalConsultationService**
- Cambiar endpoints de `/consultations` a `/patients/:id/consultas`
- Actualizar métodos para usar patientId

#### 2.2 **Actualizar MedicationService** 
- Cambiar endpoints de `/medications` a `/patients/:id/medicamentos`
- Actualizar métodos para usar patientId

### 🚀 **FASE 3: Conectar Tab1Page (Dashboard)**
**Prioridad**: ALTA 🔴

#### 3.1 **Reemplazar datos mock**:
```typescript
// ANTES (mock):
stats = [/* datos hardcodeados */];

// DESPUÉS (real):
constructor(private dashboardService: DashboardService) {}
ngOnInit() {
  this.dashboardService.getDashboardStats().subscribe(stats => {
    this.stats = this.transformStats(stats);
  });
}
```

#### 3.2 **Conectar alertas de exámenes**:
```typescript
// ANTES (mock):
pacientes = [/* datos fake */];

// DESPUÉS (real):
this.alertService.getActiveAlerts().subscribe(alerts => {
  this.alertas = alerts;
});
```

### 🚀 **FASE 4: Conectar Tab2Page (Pacientes)**
**Prioridad**: ALTA 🔴

#### 4.1 **Conectar con PatientService**:
```typescript
// ANTES (mock):
pacientes: Paciente[] = [/* datos fake */];

// DESPUÉS (real):
constructor(private patientService: PatientService) {}
ngOnInit() {
  this.loadPatients();
}

loadPatients() {
  this.patientService.getPatients().subscribe(response => {
    this.pacientes = response.patients;
  });
}
```

#### 4.2 **Conectar CRUD operations**:
- ✅ CREATE: Usar `patientService.createPatient()`
- ✅ UPDATE: Usar `patientService.updatePatient()`
- ✅ DELETE: Usar `patientService.deletePatient()`
- ✅ SEARCH: Usar `patientService.getPatients(page, limit, search)`

### 🚀 **FASE 5: Conectar Tab3Page (Ficha Médica)**
**Prioridad**: ALTA 🔴

#### 5.1 **Cargar datos del paciente**:
```typescript
// ANTES (mock):
ficha: FichaMedica = {/* datos fake */};

// DESPUÉS (real):
constructor(
  private patientService: PatientService,
  private consultationService: MedicalConsultationService,
  private examService: ExamService
) {}

ngOnInit() {
  const patientId = this.getPatientIdFromRoute();
  this.loadPatientData(patientId);
}

loadPatientData(patientId: string) {
  forkJoin({
    patient: this.patientService.getPatientById(patientId),
    consultations: this.consultationService.getPatientConsultations(patientId),
    exams: this.examService.getPatientExams(patientId)
  }).subscribe(data => {
    this.ficha = this.buildFichaMedica(data);
  });
}
```

### 🚀 **FASE 6: Conectar Tab4Page (Medicamentos)**
**Prioridad**: MEDIA 🟡

#### 6.1 **Cargar medicamentos del paciente**:
```typescript
// ANTES (mock):
medicamentosActuales: Medicamento[] = [/* datos fake */];

// DESPUÉS (real):
constructor(private medicationService: MedicationService) {}

ngOnInit() {
  const patientId = this.getPatientIdFromRoute();
  this.loadMedications(patientId);
}

loadMedications(patientId: string) {
  this.medicationService.getPatientMedications(patientId).subscribe(response => {
    this.medicamentosActuales = response.medications;
  });
}
```

### 🚀 **FASE 7: Conectar Tab5Page (Exámenes)**
**Prioridad**: MEDIA 🟡

#### 7.1 **Cargar exámenes del paciente**:
```typescript
// ANTES (mock):
examenes = [/* datos fake */];

// DESPUÉS (real):
constructor(private examService: ExamService) {}

ngOnInit() {
  const patientId = this.getPatientIdFromRoute();
  this.loadExams(patientId);
}

loadExams(patientId: string) {
  this.examService.getPatientExams(patientId).subscribe(response => {
    this.examenes = response.exams;
  });
}
```

### 🚀 **FASE 8: Implementar Navegación Dinámica**
**Prioridad**: BAJA 🟢

#### 8.1 **Pasar IDs de pacientes entre rutas**:
```typescript
// En Tab2Page (lista pacientes):
verFicha(paciente: Paciente) {
  this.router.navigate(['/tabs/tab3'], { 
    queryParams: { patientId: paciente.id } 
  });
}

// En Tab3Page (ficha médica):
ngOnInit() {
  this.route.queryParams.subscribe(params => {
    if (params['patientId']) {
      this.loadPatientData(params['patientId']);
    }
  });
}
```

---

## 🔍 ARCHIVOS A MODIFICAR

### 📁 **Servicios Nuevos a Crear**:
1. `src/app/services/dashboard.service.ts` ❌
2. `src/app/services/exam.service.ts` ❌ 
3. `src/app/services/alert.service.ts` ❌

### 📁 **Servicios a Modificar**:
1. `src/app/services/medical-consultation.service.ts` ✏️
2. `src/app/services/medication.service.ts` ✏️

### 📁 **Páginas a Conectar**:
1. `src/app/tab1/tab1.page.ts` ✏️ **Dashboard**
2. `src/app/tab2/tab2.page.ts` ✏️ **Pacientes**
3. `src/app/tab3/tab3.page.ts` ✏️ **Ficha Médica**
4. `src/app/tab4/tab4.page.ts` ✏️ **Medicamentos**
5. `src/app/tab5/tab5.page.ts` ✏️ **Exámenes**

### 📁 **Routing a Actualizar**:
1. `src/app/app.routes.ts` ✏️ **Parámetros de ruta**
2. `src/app/tabs/tabs.routes.ts` ✏️ **Parámetros de ruta**

---

## ✅ CRITERIOS DE ÉXITO

### 🎯 **Funcionalidad**:
- [ ] ❌ Dashboard muestra datos reales del backend
- [ ] ❌ Lista de pacientes carga desde API
- [ ] ❌ CRUD de pacientes funciona completamente
- [ ] ❌ Ficha médica carga datos reales del paciente
- [ ] ❌ Medicamentos y exámenes cargan desde API
- [ ] ❌ Navegación entre páginas con IDs reales

### 🎯 **Performance**:
- [ ] ❌ Carga inicial < 2 segundos
- [ ] ❌ Búsqueda de pacientes < 1 segundo
- [ ] ❌ Navegación entre fichas instantánea

### 🎯 **UX**:
- [ ] ❌ Loading states implementados
- [ ] ❌ Error handling con mensajes user-friendly
- [ ] ❌ Estados vacíos manejados correctamente

---

## 🚨 NOTAS IMPORTANTES

### ⚠️ **Backend Ready**:
- ✅ **Todos los endpoints funcionando** en `localhost:3000`
- ✅ **Base de datos con datos reales** 
- ✅ **CORS configurado** correctamente
- ✅ **Validaciones robustas** implementadas

### ⚠️ **Frontend Tasks**:
1. **NO modificar** la UI/UX existente
2. **Solo reemplazar** datos mock con llamadas API reales
3. **Mantener** la funcionalidad actual
4. **Agregar** manejo de estados de loading/error
5. **Implementar** navegación con IDs reales

### ⚠️ **Testing Strategy**:
1. Probar cada página individualmente
2. Verificar que no hay errores en consola
3. Confirmar que datos se cargan correctamente
4. Validar que CRUD operations funcionan
5. Test navegación entre páginas

---

## 📊 PROGRESO TRACKING

### ✅ **Completado**:
- [x] Backend completamente implementado
- [x] PatientService ya conectado al backend
- [x] Endpoints de API funcionando

### 🚧 **En Progreso**:
- [ ] Análisis completo del frontend (ESTE DOCUMENTO)

### ⏳ **Pendiente**:
- [ ] Creación de servicios faltantes
- [ ] Corrección de servicios existentes  
- [ ] Conexión de todas las páginas
- [ ] Testing completo

---

**Estado Actual**: 📋 **ANÁLISIS COMPLETO** - LISTO PARA IMPLEMENTACIÓN

**Próximo Paso**: 🚀 **FASE 1** - Crear servicios faltantes (DashboardService, ExamService, AlertService)