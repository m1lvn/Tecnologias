export interface Patient {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'PP' | 'RC';
  fechaNacimiento: Date;
  telefono: string;
  email: string;
  direccion: string;
  genero: 'M' | 'F' | 'Otro';
  estadoCivil: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre';
  ocupacion: string;
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  alergias: string[];
  medicamentos: string[];
  antecedentes: string[];
  grupoSanguineo: string;
  eps: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: 'activo' | 'inactivo';
}

export interface PatientSearchFilters {
  search?: string;
  genero?: string;
  eps?: string;
  grupoSanguineo?: string;
  estadoCivil?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface PatientListResponse {
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreatePatientRequest {
  nombres: string;
  apellidos: string;
  documento: string;
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'PP' | 'RC';
  fechaNacimiento: Date;
  telefono: string;
  email: string;
  direccion: string;
  genero: 'M' | 'F' | 'Otro';
  estadoCivil: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre';
  ocupacion: string;
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  alergias: string[];
  medicamentos: string[];
  antecedentes: string[];
  grupoSanguineo: string;
  eps: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  // Todos los campos son opcionales para actualizaciones
}