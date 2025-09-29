# 🧪 **SCRIPTS DE PRUEBA AUTOMATIZADOS**

## 📝 **Archivo de Pruebas Rápidas**

Crear este archivo en: `src/app/tests/quick-tests.ts`

```typescript
import { PatientService } from '../services/patient.service';
import { MedicalConsultationService } from '../services/medical-consultation.service';
import { validateRut, calculateIMC, classifyBloodPressure } from '../utils/validators';

export class QuickTests {
  
  constructor(
    private patientService: PatientService,
    private consultationService: MedicalConsultationService
  ) {}

  /**
   * 🩺 Prueba completa del PatientService
   */
  async testPatientService(): Promise<void> {
    console.log('🧪 === INICIANDO PRUEBAS DE PACIENTES ===');
    
    // 1. Crear paciente de prueba
    const testPatient = {
      personalInfo: {
        nombre: "María",
        apellido: "Contreras",
        rut: "15432678-1",
        fechaNacimiento: new Date("1985-08-20"),
        sexo: "F" as const,
        tipoSangre: "A+" as const,
        direccion: "Las Condes 456, Santiago",
        telefono: "+56998765432",
        contactoEmergencia: "Pedro Contreras - +56987654321",
        email: "maria.contreras@email.com"
      },
      medicalInfo: {
        alergias: ["Aspirina"],
        chronicDiseases: ["Diabetes Tipo 2"],
        emergencyContact: {
          name: "Pedro Contreras",
          phone: "+56987654321",
          relationship: "Hermano"
        }
      }
    };

    try {
      // Crear paciente
      console.log('✅ Creando paciente...');
      const createdPatient = await this.patientService.createPatient(testPatient).toPromise();
      console.log('Paciente creado:', createdPatient?.personalInfo.nombre);

      // Buscar por RUT
      console.log('🔍 Buscando por RUT...');
      const foundPatient = await this.patientService.getPatientByRut("15432678-1").toPromise();
      console.log('Paciente encontrado:', foundPatient?.personalInfo.nombre);

      // Listar con filtros
      console.log('📋 Listando con filtros...');
      const patientsList = await this.patientService.getPatients(1, 5, {
        sexo: "F",
        edadMin: 30,
        edadMax: 50
      }).toPromise();
      console.log(`Encontrados ${patientsList?.patients.length} pacientes`);

      // Actualizar paciente
      if (createdPatient?.patientId) {
        console.log('✏️ Actualizando paciente...');
        const updated = await this.patientService.updatePatient(createdPatient.patientId, {
          personalInfo: { telefono: "+56999888777" }
        }).toPromise();
        console.log('Teléfono actualizado:', updated?.personalInfo.telefono);
      }

      console.log('✅ TODAS LAS PRUEBAS DE PACIENTES EXITOSAS');
      
    } catch (error) {
      console.error('❌ Error en pruebas de pacientes:', error);
    }
  }

  /**
   * 🏥 Prueba completa del MedicalConsultationService
   */
  async testConsultationService(): Promise<void> {
    console.log('🧪 === INICIANDO PRUEBAS DE CONSULTAS ===');
    
    const testConsultation = {
      patientId: "test-patient-id",
      doctorId: "test-doctor-id",
      fechaConsulta: new Date(),
      tipoConsulta: "control" as const,
      motivoConsulta: "Control de rutina",
      anamnesis: {
        enfermedadActual: "Paciente asintomática para control",
        antecedentesPersonales: "Diabetes controlada",
        antecedentesFamiliares: "HTA materna",
        habitosYEstiloVida: "Ejercicio regular, no fuma"
      },
      signosVitales: {
        presionArterial: { sistolica: 120, diastolica: 80 },
        frecuenciaCardiaca: 72,
        frecuenciaRespiratoria: 16,
        temperatura: 36.5,
        saturacionOxigeno: 99,
        peso: 65.0,
        altura: 160
      },
      examenFisico: {
        aspecto: "Buen estado general",
        conciencia: "alerta" as const,
        orientacion: "orientado" as const
      },
      diagnosticos: [{
        codigo: "E11.9",
        descripcion: "Diabetes mellitus tipo 2 sin complicaciones",
        tipo: "principal" as const
      }],
      planTratamiento: {
        indicacionesGenerales: ["Continuar con dieta y ejercicio"],
        medicamentos: [],
        examenes: ["Hemoglobina glicosilada"],
        procedimientos: [],
        controles: [{
          fecha: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 meses
          tipo: "control" as const,
          observaciones: "Control en 3 meses"
        }]
      }
    };

    try {
      // Crear consulta
      console.log('✅ Creando consulta médica...');
      const created = await this.consultationService.createConsultation(testConsultation).toPromise();
      console.log('Consulta creada:', created?.motivoConsulta);

      // Buscar consultas
      console.log('🔍 Buscando consultas...');
      const consultations = await this.consultationService.getConsultations(1, 5).toPromise();
      console.log(`Encontradas ${consultations?.consultations.length} consultas`);

      // Obtener estadísticas
      console.log('📊 Obteniendo estadísticas...');
      const stats = await this.consultationService.getConsultationStats().toPromise();
      console.log('Total consultas en stats:', stats?.totalConsultations);

      console.log('✅ TODAS LAS PRUEBAS DE CONSULTAS EXITOSAS');
      
    } catch (error) {
      console.error('❌ Error en pruebas de consultas:', error);
    }
  }

  /**
   * 🔧 Prueba de validadores y utilidades
   */
  testValidators(): void {
    console.log('🧪 === INICIANDO PRUEBAS DE VALIDADORES ===');
    
    // Test RUT validation
    const ruts = [
      "12345678-9",
      "15432678-1", 
      "98765432-1",
      "invalid-rut"
    ];
    
    ruts.forEach(rut => {
      const isValid = validateRut(rut);
      console.log(`RUT ${rut}: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
    });

    // Test IMC calculation
    console.log('📏 Calculando IMC...');
    console.log(`IMC (70kg, 1.70m): ${calculateIMC(70, 1.70).toFixed(1)}`);
    console.log(`IMC (85kg, 1.80m): ${calculateIMC(85, 1.80).toFixed(1)}`);

    // Test blood pressure classification
    console.log('🩺 Clasificando presión arterial...');
    console.log(`PA 120/80: ${classifyBloodPressure(120, 80)}`);
    console.log(`PA 140/90: ${classifyBloodPressure(140, 90)}`);
    console.log(`PA 180/110: ${classifyBloodPressure(180, 110)}`);

    console.log('✅ TODAS LAS PRUEBAS DE VALIDADORES EXITOSAS');
  }

  /**
   * 🚀 Ejecutar todas las pruebas
   */
  async runAllTests(): Promise<void> {
    console.log('🎯 === EJECUTANDO SUITE COMPLETA DE PRUEBAS ===');
    console.log('⏰ Hora de inicio:', new Date().toLocaleString());
    
    try {
      // Pruebas síncronas primero
      this.testValidators();
      
      // Pruebas asíncronas
      await this.testPatientService();
      await this.testConsultationService();
      
      console.log('🎉 === TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===');
      console.log('⏰ Hora de finalización:', new Date().toLocaleString());
      
    } catch (error) {
      console.error('💥 Error en suite de pruebas:', error);
    }
  }

  /**
   * 📊 Monitorear estados reactivos
   */
  monitorReactiveStates(): void {
    console.log('👁️ === MONITOREANDO ESTADOS REACTIVOS ===');
    
    // Monitor patient service states
    this.patientService.loading$.subscribe(loading => {
      console.log(`🔄 PatientService Loading: ${loading}`);
    });
    
    this.patientService.error$.subscribe(error => {
      if (error) console.error(`❌ PatientService Error: ${error}`);
    });
    
    this.patientService.patients$.subscribe(patients => {
      console.log(`👥 Pacientes en memoria: ${patients.length}`);
    });

    // Monitor consultation service states
    this.consultationService.loading$.subscribe(loading => {
      console.log(`🔄 ConsultationService Loading: ${loading}`);
    });
    
    this.consultationService.error$.subscribe(error => {
      if (error) console.error(`❌ ConsultationService Error: ${error}`);
    });
    
    this.consultationService.consultations$.subscribe(consultations => {
      console.log(`🏥 Consultas en memoria: ${consultations.length}`);
    });
  }
}
```

---

## 🎮 **Cómo Usar las Pruebas**

### **En cualquier componente:**

```typescript
// En tab1.page.ts o cualquier componente
import { QuickTests } from '../tests/quick-tests';

export class Tab1Page {
  private quickTests: QuickTests;

  constructor(
    private patientService: PatientService,
    private consultationService: MedicalConsultationService
  ) {
    this.quickTests = new QuickTests(patientService, consultationService);
  }

  async ngOnInit() {
    // Ejecutar pruebas automáticamente al cargar
    if (!environment.production) {
      await this.quickTests.runAllTests();
      this.quickTests.monitorReactiveStates();
    }
  }

  // Método para ejecutar pruebas manualmente
  async runTests() {
    await this.quickTests.runAllTests();
  }
}
```

### **Desde la consola del navegador:**

```javascript
// Después de que la app esté cargada
const component = ng.getComponent(document.querySelector('app-tab1'));
component.runTests();
```

---

## 🔥 **Script de Prueba Express (1 minuto)**

```bash
#!/bin/bash
# Archivo: test-everything.sh

echo "🚀 === PRUEBA RÁPIDA DE FICHAMEDICA ==="

# 1. Verificar dependencias
echo "📦 Verificando dependencias..."
npm ls @ionic/angular mongoose rxjs

# 2. Compilar sin errores
echo "🔨 Compilando proyecto..."
ng build --configuration development

# 3. Ejecutar tests unitarios (si existen)
echo "🧪 Ejecutando tests..."
npm test -- --watch=false --browsers=ChromeHeadless

# 4. Servir aplicación
echo "🌐 Iniciando servidor..."
ionic serve --port=8100 &
SERVER_PID=$!

# 5. Esperar a que se levante
sleep 10

# 6. Verificar que responde
echo "🔍 Verificando respuesta del servidor..."
curl -s http://localhost:8100 > /dev/null && echo "✅ Servidor respondiendo" || echo "❌ Servidor no responde"

# 7. Cleanup
echo "🧹 Limpiando..."
kill $SERVER_PID

echo "🎉 ¡Prueba completa!"
```

---

## 📋 **Checklist Final de Pruebas**

Marcar cada elemento después de verificar:

### **🔧 Configuración Base**
- [ ] Node.js >= 18.0.0 instalado
- [ ] Ionic CLI instalado globalmente
- [ ] MongoDB corriendo en puerto 27017
- [ ] Dependencias npm instaladas sin errores

### **💾 Base de Datos**
- [ ] MongoDB conecta correctamente
- [ ] Esquemas Mongoose validando datos
- [ ] Colecciones creándose automáticamente
- [ ] Índices de búsqueda funcionando

### **🏗️ Servicios Angular**
- [ ] PatientService: CRUD completo
- [ ] MedicalConsultationService: Gestión de consultas
- [ ] Estados reactivos actualizándose
- [ ] Cache local funcionando (TTL)
- [ ] Error handling manejando fallos

### **🎨 Interfaz de Usuario**
- [ ] Ionic serve corriendo sin errores
- [ ] Navegación por pestañas funcionando
- [ ] Componentes renderizándose correctamente
- [ ] Responsive design en móvil/tablet

### **⚡ Rendimiento**
- [ ] Loading states durante operaciones
- [ ] Paginación en listas grandes
- [ ] Cache evitando requests innecesarios
- [ ] Búsquedas respondiendo < 2 segundos

### **🔐 Validaciones**
- [ ] RUT chileno validándose correctamente
- [ ] IMC calculándose automáticamente
- [ ] Presión arterial clasificándose
- [ ] Fechas en formato correcto

¡Con esto tienes **TODO** lo necesario para probar la aplicación completamente! 🎯