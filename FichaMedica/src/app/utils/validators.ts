// Utilidades para validaciones en FichaMedica
import { RutValidation } from '../models/patient.interface';

/**
 * Validador de RUT chileno
 * @param rut RUT a validar (formato: 12345678-9 o 12.345.678-9)
 * @returns Objeto con resultado de validación
 */
export function validateRut(rut: string): RutValidation {
  if (!rut) {
    return {
      isValid: false,
      formatted: '',
      error: 'RUT no puede estar vacío'
    };
  }

  // Limpiar el RUT de puntos, guiones y espacios
  const cleanRut = rut.replace(/[.\-\s]/g, '').toUpperCase();
  
  if (cleanRut.length < 2) {
    return {
      isValid: false,
      formatted: rut,
      error: 'RUT muy corto'
    };
  }

  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1);

  // Validar que el número sea numérico
  if (!/^[0-9]+$/.test(rutNumber)) {
    return {
      isValid: false,
      formatted: rut,
      error: 'RUT contiene caracteres inválidos'
    };
  }

  // Validar que el dígito verificador sea válido
  if (!/^[0-9K]$/.test(verifier)) {
    return {
      isValid: false,
      formatted: rut,
      error: 'Dígito verificador inválido'
    };
  }

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculatedVerifier = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();

  const isValid = calculatedVerifier === verifier;
  const formatted = formatRut(rutNumber + verifier);

  return {
    isValid,
    formatted,
    error: isValid ? undefined : 'Dígito verificador incorrecto'
  };
}

/**
 * Formatea un RUT con puntos y guión
 * @param rut RUT limpio (solo números y dígito verificador)
 * @returns RUT formateado (12.345.678-9)
 */
export function formatRut(rut: string): string {
  if (!rut) return '';

  const cleanRut = rut.replace(/[.\-\s]/g, '').toUpperCase();
  
  if (cleanRut.length < 2) return rut;

  const rutNumber = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1);

  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedNumber}-${verifier}`;
}

/**
 * Limpia un RUT removiendo puntos, guiones y espacios
 * @param rut RUT a limpiar
 * @returns RUT limpio
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

/**
 * Valida formato de email
 * @param email Email a validar
 * @returns true si es válido
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de teléfono chileno
 * @param phone Teléfono a validar
 * @returns true si es válido
 */
export function validateChileanPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Limpiar el teléfono
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Patrones válidos para Chile:
  // +56912345678 (móvil con código país)
  // +56221234567 (fijo con código país)
  // 912345678 (móvil sin código país)
  // 221234567 (fijo sin código país)
  const patterns = [
    /^\+569[0-9]{8}$/, // Móvil con código país
    /^\+562[0-9]{8}$/, // Fijo Santiago con código país
    /^\+56[0-9]{9}$/,  // Otros fijos con código país
    /^9[0-9]{8}$/,     // Móvil sin código país
    /^2[0-9]{8}$/,     // Fijo sin código país
    /^[0-9]{8,9}$/     // Otros formatos
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
}

/**
 * Valida rango de edad
 * @param birthDate Fecha de nacimiento
 * @param minAge Edad mínima (opcional)
 * @param maxAge Edad máxima (opcional)
 * @returns true si está en el rango válido
 */
export function validateAge(birthDate: Date, minAge?: number, maxAge?: number): boolean {
  const today = new Date();
  const birth = new Date(birthDate);
  
  // Verificar que la fecha no sea futura
  if (birth > today) return false;
  
  // Calcular edad
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  // Verificar rangos
  if (minAge !== undefined && age < minAge) return false;
  if (maxAge !== undefined && age > maxAge) return false;
  
  return true;
}

/**
 * Calcula la edad en años a partir de fecha de nacimiento
 * @param birthDate Fecha de nacimiento
 * @returns Edad en años
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Calcula el IMC (Índice de Masa Corporal)
 * @param weight Peso en kg
 * @param height Altura en cm
 * @returns IMC con 2 decimales
 */
export function calculateIMC(weight: number, height: number): number {
  if (!weight || !height || weight <= 0 || height <= 0) return 0;
  
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

/**
 * Clasifica el IMC según estándares OMS
 * @param imc Valor del IMC
 * @returns Clasificación del IMC
 */
export function classifyIMC(imc: number): string {
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidad grado I';
  if (imc < 40) return 'Obesidad grado II';
  return 'Obesidad grado III';
}

/**
 * Valida presión arterial
 * @param sistolica Presión sistólica
 * @param diastolica Presión diastólica
 * @returns true si está en rangos normales
 */
export function validateBloodPressure(sistolica: number, diastolica: number): boolean {
  // Rangos considerados normales/aceptables
  return sistolica >= 70 && sistolica <= 200 && 
         diastolica >= 40 && diastolica <= 120 &&
         sistolica > diastolica;
}

/**
 * Clasifica la presión arterial según guías médicas
 * @param sistolica Presión sistólica
 * @param diastolica Presión diastólica
 * @returns Clasificación de la presión arterial
 */
export function classifyBloodPressure(sistolica: number, diastolica: number): string {
  if (sistolica < 120 && diastolica < 80) return 'Óptima';
  if (sistolica < 130 && diastolica < 85) return 'Normal';
  if (sistolica < 140 && diastolica < 90) return 'Normal alta';
  if (sistolica < 160 && diastolica < 100) return 'Hipertensión grado 1';
  if (sistolica < 180 && diastolica < 110) return 'Hipertensión grado 2';
  return 'Hipertensión grado 3';
}

/**
 * Valida temperatura corporal
 * @param temperature Temperatura en grados Celsius
 * @returns true si está en rango normal/aceptable
 */
export function validateTemperature(temperature: number): boolean {
  return temperature >= 32 && temperature <= 45;
}

/**
 * Clasifica la temperatura corporal
 * @param temperature Temperatura en grados Celsius
 * @returns Clasificación de la temperatura
 */
export function classifyTemperature(temperature: number): string {
  if (temperature < 36) return 'Hipotermia';
  if (temperature <= 37.5) return 'Normal';
  if (temperature <= 38.5) return 'Febrícula';
  if (temperature <= 39.5) return 'Fiebre';
  return 'Fiebre alta';
}

/**
 * Genera un ID único para entidades
 * @param prefix Prefijo para el ID (ej: 'PAT', 'CONS', 'MED')
 * @returns ID único generado
 */
export function generateUniqueId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Valida código CIE-10
 * @param code Código CIE-10 a validar
 * @returns true si el formato es válido
 */
export function validateCIE10Code(code: string): boolean {
  if (!code) return false;
  
  // Formato básico CIE-10: Letra + 2-3 dígitos + posible punto + 1-2 dígitos/letras
  const cie10Regex = /^[A-Z][0-9]{2}(\.[0-9A-Z]{1,2})?$/;
  return cie10Regex.test(code.toUpperCase());
}

/**
 * Formatea una fecha para mostrar en la UI
 * @param date Fecha a formatear
 * @param includeTime Si incluir la hora
 * @returns Fecha formateada
 */
export function formatDate(date: Date, includeTime: boolean = false): string {
  if (!date) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false;
  }
  
  return new Intl.DateTimeFormat('es-CL', options).format(new Date(date));
}

/**
 * Valida si una cadena está vacía o contiene solo espacios
 * @param str Cadena a validar
 * @returns true si no está vacía
 */
export function isNotEmpty(str: string): boolean {
  return Boolean(str && str.trim().length > 0);
}

/**
 * Capitaliza la primera letra de cada palabra
 * @param str Cadena a capitalizar
 * @returns Cadena capitalizada
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}