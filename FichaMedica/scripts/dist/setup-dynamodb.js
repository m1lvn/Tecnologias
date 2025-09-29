"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBTableSetup = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client_dynamodb_2 = require("@aws-sdk/client-dynamodb");
/**
 * Script para crear las tablas DynamoDB necesarias para el sistema de fichas médicas
 * Ejecutar con: node setup-dynamodb.js
 */
class DynamoDBTableSetup {
    constructor() {
        this.tableName = 'MedicalRecords';
        this.client = new client_dynamodb_1.DynamoDBClient({
            region: 'us-east-1', // Cambiar por tu región
            endpoint: 'http://localhost:8000', // Para DynamoDB Local (desarrollo)
            credentials: {
                accessKeyId: 'dummy', // Para DynamoDB Local
                secretAccessKey: 'dummy' // Para DynamoDB Local
            }
        });
    }
    async createMedicalRecordsTable() {
        const createTableParams = {
            TableName: this.tableName,
            // Claves primarias
            KeySchema: [
                {
                    AttributeName: 'PK',
                    KeyType: client_dynamodb_2.KeyType.HASH // Partition key
                },
                {
                    AttributeName: 'SK',
                    KeyType: client_dynamodb_2.KeyType.RANGE // Sort key
                }
            ],
            // Definición de atributos
            AttributeDefinitions: [
                {
                    AttributeName: 'PK',
                    AttributeType: client_dynamodb_2.ScalarAttributeType.S
                },
                {
                    AttributeName: 'SK',
                    AttributeType: client_dynamodb_2.ScalarAttributeType.S
                },
                {
                    AttributeName: 'GSI1PK',
                    AttributeType: client_dynamodb_2.ScalarAttributeType.S
                },
                {
                    AttributeName: 'GSI1SK',
                    AttributeType: client_dynamodb_2.ScalarAttributeType.S
                },
                {
                    AttributeName: 'GSI2PK',
                    AttributeType: client_dynamodb_2.ScalarAttributeType.S
                },
                {
                    AttributeName: 'GSI2SK',
                    AttributeType: client_dynamodb_2.ScalarAttributeType.S
                }
            ],
            // Configuración de facturación
            BillingMode: client_dynamodb_2.BillingMode.PAY_PER_REQUEST, // On-demand billing
            // Índices Secundarios Globales (GSI)
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'GSI1-DoctorDate',
                    KeySchema: [
                        {
                            AttributeName: 'GSI1PK',
                            KeyType: client_dynamodb_2.KeyType.HASH
                        },
                        {
                            AttributeName: 'GSI1SK',
                            KeyType: client_dynamodb_2.KeyType.RANGE
                        }
                    ],
                    Projection: {
                        ProjectionType: client_dynamodb_2.ProjectionType.ALL
                    }
                },
                {
                    IndexName: 'GSI2-PatientType',
                    KeySchema: [
                        {
                            AttributeName: 'GSI2PK',
                            KeyType: client_dynamodb_2.KeyType.HASH
                        },
                        {
                            AttributeName: 'GSI2SK',
                            KeyType: client_dynamodb_2.KeyType.RANGE
                        }
                    ],
                    Projection: {
                        ProjectionType: client_dynamodb_2.ProjectionType.ALL
                    }
                }
            ],
            // Configuración de Streams (opcional para auditoría)
            StreamSpecification: {
                StreamEnabled: true,
                StreamViewType: client_dynamodb_2.StreamViewType.NEW_AND_OLD_IMAGES
            },
            // Configuración de punto en el tiempo (backup)
            PointInTimeRecoverySpecification: {
                PointInTimeRecoveryEnabled: true
            }
        };
        try {
            console.log(`Creando tabla ${this.tableName}...`);
            const command = new client_dynamodb_2.CreateTableCommand(createTableParams);
            const result = await this.client.send(command);
            console.log('Tabla creada exitosamente:', result.TableDescription?.TableName);
            console.log('Estado:', result.TableDescription?.TableStatus);
            // Esperar a que la tabla esté activa
            await this.waitForTableActive();
        }
        catch (error) {
            if (error.name === 'ResourceInUseException') {
                console.log(`La tabla ${this.tableName} ya existe.`);
            }
            else {
                console.error('Error creando la tabla:', error);
                throw error;
            }
        }
    }
    async waitForTableActive() {
        console.log('Esperando a que la tabla esté activa...');
        while (true) {
            try {
                const command = new client_dynamodb_2.DescribeTableCommand({ TableName: this.tableName });
                const result = await this.client.send(command);
                if (result.Table?.TableStatus === 'ACTIVE') {
                    console.log('✅ Tabla está activa y lista para usar');
                    break;
                }
                console.log(`Estado actual: ${result.Table?.TableStatus}. Esperando...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
            }
            catch (error) {
                console.error('Error verificando estado de la tabla:', error);
                throw error;
            }
        }
    }
    async deleteTable() {
        try {
            console.log(`Eliminando tabla ${this.tableName}...`);
            const command = new client_dynamodb_2.DeleteTableCommand({ TableName: this.tableName });
            await this.client.send(command);
            console.log('Tabla eliminada exitosamente');
        }
        catch (error) {
            if (error.name === 'ResourceNotFoundException') {
                console.log(`La tabla ${this.tableName} no existe.`);
            }
            else {
                console.error('Error eliminando la tabla:', error);
                throw error;
            }
        }
    }
    async describeTable() {
        try {
            const command = new client_dynamodb_2.DescribeTableCommand({ TableName: this.tableName });
            const result = await this.client.send(command);
            console.log('=== Información de la Tabla ===');
            console.log('Nombre:', result.Table?.TableName);
            console.log('Estado:', result.Table?.TableStatus);
            console.log('Elementos:', result.Table?.ItemCount);
            console.log('Tamaño:', result.Table?.TableSizeBytes, 'bytes');
            console.log('Modo de facturación:', result.Table?.BillingModeSummary?.BillingMode);
            if (result.Table?.GlobalSecondaryIndexes) {
                console.log('\n=== Índices Secundarios Globales ===');
                result.Table.GlobalSecondaryIndexes.forEach(gsi => {
                    console.log(`- ${gsi.IndexName}: ${gsi.IndexStatus}`);
                });
            }
        }
        catch (error) {
            console.error('Error describiendo la tabla:', error);
        }
    }
    // Método para insertar datos de prueba
    async insertSampleData() {
        const { DynamoDBDocumentClient, PutCommand } = await Promise.resolve().then(() => __importStar(require('@aws-sdk/lib-dynamodb')));
        const docClient = DynamoDBDocumentClient.from(this.client);
        const sampleData = [
            // Medicamento de ejemplo
            {
                PK: 'MEDICATION#med-001',
                SK: 'INFO',
                entityType: 'MEDICATION',
                medicationId: 'med-001',
                nombre: 'Paracetamol',
                nombreColoquial: 'Acetaminofén',
                viaAdministracion: 'Oral',
                descripcion: 'Analgésico y antipirético',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            // Paciente de ejemplo
            {
                PK: 'PATIENT#pat-001',
                SK: 'PROFILE',
                entityType: 'PATIENT_PROFILE',
                patientId: 'pat-001',
                nombre: 'Juan',
                apellido: 'Pérez',
                fechaNacimiento: '1990-05-15',
                sexo: 'M',
                direccion: 'Av. Principal 123',
                telefono: '+56912345678',
                tipoSangre: 'O+',
                peso: 75,
                altura: 180,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            // Médico de ejemplo
            {
                PK: 'DOCTOR#doc-001',
                SK: 'PROFILE',
                entityType: 'DOCTOR_PROFILE',
                doctorId: 'doc-001',
                rut: '12345678-9',
                nombre: 'María',
                apellido: 'González',
                fechaNacimiento: '1980-03-20',
                sexo: 'F',
                especialidad: 'Medicina General',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        try {
            console.log('Insertando datos de prueba...');
            for (const item of sampleData) {
                const command = new PutCommand({
                    TableName: this.tableName,
                    Item: item
                });
                await docClient.send(command);
                console.log(`✅ Insertado: ${item.entityType} - ${item.PK}`);
            }
            console.log('Datos de prueba insertados exitosamente');
        }
        catch (error) {
            console.error('Error insertando datos de prueba:', error);
        }
    }
}
exports.DynamoDBTableSetup = DynamoDBTableSetup;
// Función principal para ejecutar el script
async function main() {
    const setup = new DynamoDBTableSetup();
    try {
        // Mostrar menú de opciones
        const args = process.argv.slice(2);
        const action = args[0];
        switch (action) {
            case 'create':
                await setup.createMedicalRecordsTable();
                break;
            case 'delete':
                await setup.deleteTable();
                break;
            case 'describe':
                await setup.describeTable();
                break;
            case 'sample':
                await setup.insertSampleData();
                break;
            case 'setup':
                await setup.createMedicalRecordsTable();
                await setup.insertSampleData();
                break;
            default:
                console.log('Uso: node setup-dynamodb.js [action]');
                console.log('Acciones disponibles:');
                console.log('  create   - Crear la tabla MedicalRecords');
                console.log('  delete   - Eliminar la tabla MedicalRecords');
                console.log('  describe - Mostrar información de la tabla');
                console.log('  sample   - Insertar datos de prueba');
                console.log('  setup    - Crear tabla e insertar datos de prueba');
        }
    }
    catch (error) {
        console.error('Error en la configuración:', error);
        process.exit(1);
    }
}
// Ejecutar solo si es el módulo principal
if (require.main === module) {
    main();
}
