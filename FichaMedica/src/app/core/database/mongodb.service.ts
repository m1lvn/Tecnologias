import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment.mongodb';

// Interfaces para el estado de conexión
export interface ConnectionStatus {
  isConnected: boolean;
  connectionString: string;
  database: string;
  lastConnected?: Date;
  lastError?: string;
  retryCount: number;
}

export interface DatabaseConfig {
  uri: string;
  options: any;
}

@Injectable({
  providedIn: 'root'
})
export class MongoDBService {
  private connectionStatus$ = new BehaviorSubject<ConnectionStatus>({
    isConnected: false,
    connectionString: '',
    database: '',
    retryCount: 0
  });

  private isInitialized = false;
  private maxRetries = 3;
  private retryDelay = 2000; // 2 segundos

  constructor() {
    this.initializeConnection();
  }

  /**
   * Obtiene el estado actual de la conexión
   */
  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Verifica si está conectado a la base de datos
   */
  isConnected(): boolean {
    return this.connectionStatus$.value.isConnected;
  }

  /**
   * Inicializa la conexión a MongoDB
   */
  private async initializeConnection(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const config = this.getDatabaseConfig();
      await this.connect(config);
      this.isInitialized = true;
      this.logInfo('MongoDB service initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize MongoDB service', error);
      this.scheduleReconnection();
    }
  }

  /**
   * Conecta a la base de datos MongoDB
   */
  private async connect(config: DatabaseConfig): Promise<void> {
    const currentStatus = this.connectionStatus$.value;
    
    try {
      this.logInfo(`Attempting to connect to MongoDB: ${this.maskConnectionString(config.uri)}`);
      
      // Simulación de conexión para el frontend
      // En un entorno real, aquí se haría la conexión real a MongoDB
      await this.simulateConnection(config);
      
      const newStatus: ConnectionStatus = {
        isConnected: true,
        connectionString: this.maskConnectionString(config.uri),
        database: this.extractDatabaseName(config.uri),
        lastConnected: new Date(),
        lastError: undefined,
        retryCount: 0
      };

      this.connectionStatus$.next(newStatus);
      this.logInfo('Successfully connected to MongoDB');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      
      const newStatus: ConnectionStatus = {
        ...currentStatus,
        isConnected: false,
        lastError: errorMessage,
        retryCount: currentStatus.retryCount + 1
      };

      this.connectionStatus$.next(newStatus);
      this.logError('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  /**
   * Desconecta de la base de datos
   */
  async disconnect(): Promise<void> {
    try {
      // Simulación de desconexión para el frontend
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentStatus = this.connectionStatus$.value;
      this.connectionStatus$.next({
        ...currentStatus,
        isConnected: false,
        lastError: undefined
      });
      
      this.logInfo('Disconnected from MongoDB');
    } catch (error) {
      this.logError('Error during MongoDB disconnection', error);
    }
  }

  /**
   * Reconecta a la base de datos
   */
  async reconnect(): Promise<void> {
    await this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
    
    const config = this.getDatabaseConfig();
    await this.connect(config);
  }

  /**
   * Programa una reconexión automática
   */
  private scheduleReconnection(): void {
    const currentStatus = this.connectionStatus$.value;
    
    if (currentStatus.retryCount < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, currentStatus.retryCount); // Backoff exponencial
      
      this.logInfo(`Scheduling reconnection in ${delay}ms (attempt ${currentStatus.retryCount + 1}/${this.maxRetries})`);
      
      setTimeout(async () => {
        try {
          const config = this.getDatabaseConfig();
          await this.connect(config);
        } catch (error) {
          this.scheduleReconnection();
        }
      }, delay);
    } else {
      this.logError('Max reconnection attempts reached. Manual intervention required.');
    }
  }

  /**
   * Obtiene la configuración de la base de datos según el entorno
   */
  private getDatabaseConfig(): DatabaseConfig {
    const activeConfig = environment.mongodb.active;
    
    if (activeConfig === 'atlas' && environment.mongodb.atlas) {
      return environment.mongodb.atlas;
    } else if (environment.mongodb.local) {
      return environment.mongodb.local;
    } else {
      throw new Error('No valid MongoDB configuration found');
    }
  }

  /**
   * Simula una conexión a MongoDB (para desarrollo frontend)
   */
  private async simulateConnection(config: DatabaseConfig): Promise<void> {
    // Simula tiempo de conexión
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simula posibles errores de conexión (10% de probabilidad)
    if (Math.random() < 0.1) {
      throw new Error('Simulated connection error');
    }
  }

  /**
   * Extrae el nombre de la base de datos de la URI
   */
  private extractDatabaseName(uri: string): string {
    try {
      // Para URIs locales: mongodb://localhost:27017/fichamedica
      if (uri.includes('mongodb://localhost')) {
        const parts = uri.split('/');
        return parts[parts.length - 1] || 'fichamedica';
      }
      
      // Para URIs de Atlas: mongodb+srv://user:pass@cluster.mongodb.net/fichamedica
      if (uri.includes('mongodb+srv://')) {
        const parts = uri.split('/');
        const dbPart = parts[parts.length - 1];
        return dbPart.split('?')[0] || 'fichamedica';
      }
      
      return 'fichamedica';
    } catch (error) {
      return 'fichamedica';
    }
  }

  /**
   * Enmascara la cadena de conexión para logging seguro
   */
  private maskConnectionString(uri: string): string {
    try {
      // Oculta credenciales en la URI
      return uri.replace(/:\/\/.*@/, '://***:***@');
    } catch (error) {
      return 'mongodb://***:***@***';
    }
  }

  /**
   * Logs de información
   */
  private logInfo(message: string): void {
    if (environment.logging.enableConsole && environment.logging.level === 'debug') {
      console.log(`[MongoDB Service] ${message}`);
    }
  }

  /**
   * Logs de errores
   */
  private logError(message: string, error?: any): void {
    if (environment.logging.enableConsole) {
      console.error(`[MongoDB Service] ${message}`, error);
    }
  }

  /**
   * Ejecuta una operación con reintentos automáticos
   */
  executeWithRetry<T>(operation: () => Observable<T>, retries: number = 3): Observable<T> {
    return operation().pipe(
      timeout(10000), // 10 segundos de timeout
      retry(retries),
      catchError(error => {
        this.logError('Operation failed after retries', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica la salud de la conexión
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simula un ping a la base de datos
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.isConnected();
    } catch (error) {
      this.logError('Health check failed', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de la conexión
   */
  getConnectionStats(): Observable<any> {
    return this.connectionStatus$.pipe(
      map(status => ({
        isConnected: status.isConnected,
        database: status.database,
        uptime: status.lastConnected ? Date.now() - status.lastConnected.getTime() : 0,
        retryCount: status.retryCount,
        lastError: status.lastError,
        configuration: {
          environment: environment.mongodb.active,
          retryDelay: this.retryDelay,
          maxRetries: this.maxRetries
        }
      }))
    );
  }
}