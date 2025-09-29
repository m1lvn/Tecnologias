import { Injectable } from '@angular/core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment.aws';

// Importar las interfaces del esquema
import {
  DynamoDBRecord,
  PatientProfile,
  DoctorProfile,
  Consultation,
  MedicalExam,
  Prescription,
  Medication,
  DynamoDBKeyUtils
} from '../models/dynamodb-schema';

@Injectable({
  providedIn: 'root'
})
export class DynamoDBService {
  private client: DynamoDBDocumentClient;
  private tableName = environment.dynamodb.tableName;

  constructor() {
    // Configuración del cliente DynamoDB basada en el entorno
    const config = environment.production ? 
      {
        region: environment.aws.region,
        // En producción, las credenciales se obtienen automáticamente del entorno
      } : 
      {
        region: environment.aws.region,
        endpoint: environment.aws.local.endpoint,
        credentials: environment.aws.local.credentials
      };

    const dynamoClient = new DynamoDBClient(config);
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  // Configurar credenciales dinámicamente
  configureCredentials(accessKeyId: string, secretAccessKey: string, region: string = 'us-east-1') {
    const dynamoClient = new DynamoDBClient({
      region,
      credentials: { accessKeyId, secretAccessKey }
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  // Métodos generales
  async putItem(item: DynamoDBRecord): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async getItem(pk: string, sk: string): Promise<any> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk }
    });

    try {
      const result = await this.client.send(command);
      return result.Item;
    } catch (error) {
      console.error('Error getting item:', error);
      throw error;
    }
  }

  async queryItems(pk: string, skPrefix?: string): Promise<any[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: skPrefix ? 'PK = :pk AND begins_with(SK, :sk)' : 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': pk,
        ...(skPrefix && { ':sk': skPrefix })
      }
    });

    try {
      const result = await this.client.send(command);
      return result.Items || [];
    } catch (error) {
      console.error('Error querying items:', error);
      throw error;
    }
  }

  async updateItem(pk: string, sk: string, updates: Partial<DynamoDBRecord>): Promise<void> {
    const updateExpression = Object.keys(updates)
      .map(key => `#${key} = :${key}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});

    const expressionAttributeValues = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`:${key}`]: updates[key as keyof DynamoDBRecord] }), {});

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk },
      UpdateExpression: `SET ${updateExpression}, updatedAt = :updatedAt`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: {
        ...expressionAttributeValues,
        ':updatedAt': new Date().toISOString()
      }
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(pk: string, sk: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk }
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  // Métodos específicos para Pacientes
  async createPatient(patientData: Omit<PatientProfile, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'patientId'>): Promise<string> {
    const patientId = uuidv4();
    const patient: PatientProfile = {
      PK: DynamoDBKeyUtils.generatePatientPK(patientId),
      SK: 'PROFILE',
      entityType: 'PATIENT_PROFILE',
      patientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...patientData
    };

    await this.putItem(patient);
    return patientId;
  }

  async getPatient(patientId: string): Promise<PatientProfile | null> {
    const pk = DynamoDBKeyUtils.generatePatientPK(patientId);
    return await this.getItem(pk, 'PROFILE');
  }

  async getPatientConsultations(patientId: string): Promise<Consultation[]> {
    const pk = DynamoDBKeyUtils.generatePatientPK(patientId);
    return await this.queryItems(pk, 'CONSULTATION');
  }

  async getPatientExams(patientId: string): Promise<MedicalExam[]> {
    const pk = DynamoDBKeyUtils.generatePatientPK(patientId);
    return await this.queryItems(pk, 'EXAM');
  }

  // Métodos específicos para Médicos
  async createDoctor(doctorData: Omit<DoctorProfile, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'doctorId'>): Promise<string> {
    const doctorId = uuidv4();
    const doctor: DoctorProfile = {
      PK: DynamoDBKeyUtils.generateDoctorPK(doctorId),
      SK: 'PROFILE',
      entityType: 'DOCTOR_PROFILE',
      doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doctorData
    };

    await this.putItem(doctor);
    return doctorId;
  }

  async getDoctor(doctorId: string): Promise<DoctorProfile | null> {
    const pk = DynamoDBKeyUtils.generateDoctorPK(doctorId);
    return await this.getItem(pk, 'PROFILE');
  }

  // Métodos específicos para Consultas
  async createConsultation(consultationData: Omit<Consultation, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'consultationId'>): Promise<string> {
    const consultationId = uuidv4();
    const consultation: Consultation = {
      PK: DynamoDBKeyUtils.generatePatientPK(consultationData.patientId),
      SK: DynamoDBKeyUtils.generateSK('CONSULTATION', consultationId),
      entityType: 'CONSULTATION',
      consultationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...consultationData
    };

    await this.putItem(consultation);
    return consultationId;
  }

  // Métodos específicos para Medicamentos
  async createMedication(medicationData: Omit<Medication, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'medicationId'>): Promise<string> {
    const medicationId = uuidv4();
    const medication: Medication = {
      PK: DynamoDBKeyUtils.generateMedicationPK(medicationId),
      SK: 'INFO',
      entityType: 'MEDICATION',
      medicationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...medicationData
    };

    await this.putItem(medication);
    return medicationId;
  }

  async getAllMedications(): Promise<Medication[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'entityType = :entityType',
      ExpressionAttributeValues: {
        ':entityType': 'MEDICATION'
      }
    });

    try {
      const result = await this.client.send(command);
      return result.Items as Medication[] || [];
    } catch (error) {
      console.error('Error getting medications:', error);
      throw error;
    }
  }

  // Método para buscar pacientes por nombre
  async searchPatientsByName(searchTerm: string): Promise<PatientProfile[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'entityType = :entityType AND (contains(#nombre, :searchTerm) OR contains(apellido, :searchTerm))',
      ExpressionAttributeNames: {
        '#nombre': 'nombre'
      },
      ExpressionAttributeValues: {
        ':entityType': 'PATIENT_PROFILE',
        ':searchTerm': searchTerm
      }
    });

    try {
      const result = await this.client.send(command);
      return result.Items as PatientProfile[] || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }
}