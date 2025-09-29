import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientMockService {
  private mockPatients: Patient[] = [
    {
      id: '1',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez García',
      documento: '12345678',
      tipoDocumento: 'CC',
      fechaNacimiento: new Date('1990-05-15'),
      telefono: '+57 300 123 4567',
      email: 'juan.perez@email.com',
      direccion: 'Calle 123 #45-67, Bogotá',
      genero: 'M',
      estadoCivil: 'soltero',
      ocupacion: 'Ingeniero',
      contactoEmergencia: {
        nombre: 'María Pérez',
        telefono: '+57 310 987 6543',
        relacion: 'Hermana'
      },
      alergias: ['Penicilina', 'Polen'],
      medicamentos: ['Omeprazol 20mg'],
      antecedentes: ['Hipertensión familiar'],
      grupoSanguineo: 'O+',
      eps: 'Sanitas',
      fechaCreacion: new Date('2024-01-15'),
      fechaActualizacion: new Date('2024-09-15'),
      estado: 'activo'
    },
    {
      id: '2',
      nombres: 'Ana María',
      apellidos: 'López Rodríguez',
      documento: '87654321',
      tipoDocumento: 'CC',
      fechaNacimiento: new Date('1985-08-22'),
      telefono: '+57 320 555 7890',
      email: 'ana.lopez@email.com',
      direccion: 'Carrera 15 #30-25, Medellín',
      genero: 'F',
      estadoCivil: 'casado',
      ocupacion: 'Doctora',
      contactoEmergencia: {
        nombre: 'Carlos López',
        telefono: '+57 315 444 3333',
        relacion: 'Esposo'
      },
      alergias: ['Mariscos'],
      medicamentos: ['Ácido fólico'],
      antecedentes: ['Diabetes tipo 2 familiar'],
      grupoSanguineo: 'A+',
      eps: 'Compensar',
      fechaCreacion: new Date('2024-02-10'),
      fechaActualizacion: new Date('2024-09-20'),
      estado: 'activo'
    },
    {
      id: '3',
      nombres: 'Luis Fernando',
      apellidos: 'González Martínez',
      documento: '11223344',
      tipoDocumento: 'CC',
      fechaNacimiento: new Date('1978-12-03'),
      telefono: '+57 301 888 9999',
      email: 'luis.gonzalez@email.com',
      direccion: 'Avenida 68 #25-40, Cali',
      genero: 'M',
      estadoCivil: 'divorciado',
      ocupacion: 'Contador',
      contactoEmergencia: {
        nombre: 'Elena González',
        telefono: '+57 302 777 6666',
        relacion: 'Madre'
      },
      alergias: [],
      medicamentos: ['Aspirina 100mg'],
      antecedentes: ['Infarto hace 5 años'],
      grupoSanguineo: 'B-',
      eps: 'Sura',
      fechaCreacion: new Date('2024-03-05'),
      fechaActualizacion: new Date('2024-09-25'),
      estado: 'activo'
    }
  ];

  constructor() { }

  // Obtener todos los pacientes con paginación
  getPatients(page: number = 1, limit: number = 20, search?: string): Observable<{patients: Patient[], total: number, page: number, totalPages: number, limit: number}> {
    let filteredPatients = this.mockPatients;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = this.mockPatients.filter(patient => 
        patient.nombres.toLowerCase().includes(searchLower) ||
        patient.apellidos.toLowerCase().includes(searchLower) ||
        patient.documento.includes(search) ||
        patient.email.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredPatients.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const patients = filteredPatients.slice(startIndex, endIndex);

    return of({
      patients,
      total,
      page,
      totalPages,
      limit
    }).pipe(delay(500)); // Simular latencia de red
  }

  // Obtener un paciente por ID
  getPatientById(id: string): Observable<Patient | null> {
    const patient = this.mockPatients.find(p => p.id === id);
    return of(patient || null).pipe(delay(300));
  }

  // Crear un nuevo paciente
  createPatient(patient: Omit<Patient, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Observable<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: (this.mockPatients.length + 1).toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    
    this.mockPatients.push(newPatient);
    return of(newPatient).pipe(delay(400));
  }

  // Actualizar un paciente
  updatePatient(id: string, updates: Partial<Patient>): Observable<Patient | null> {
    const index = this.mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      return of(null);
    }

    this.mockPatients[index] = {
      ...this.mockPatients[index],
      ...updates,
      fechaActualizacion: new Date()
    };

    return of(this.mockPatients[index]).pipe(delay(400));
  }

  // Eliminar un paciente
  deletePatient(id: string): Observable<boolean> {
    const index = this.mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      return of(false);
    }

    this.mockPatients.splice(index, 1);
    return of(true).pipe(delay(300));
  }

  // Buscar pacientes
  searchPatients(query: string): Observable<Patient[]> {
    if (!query.trim()) {
      return of([]);
    }

    const searchLower = query.toLowerCase();
    const results = this.mockPatients.filter(patient => 
      patient.nombres.toLowerCase().includes(searchLower) ||
      patient.apellidos.toLowerCase().includes(searchLower) ||
      patient.documento.includes(query) ||
      patient.email.toLowerCase().includes(searchLower)
    );

    return of(results).pipe(delay(200));
  }
}