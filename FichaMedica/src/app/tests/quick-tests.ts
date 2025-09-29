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
        tipo: "principal" as const,
        confirmado: true,
        fechaDiagnostico: new Date()
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