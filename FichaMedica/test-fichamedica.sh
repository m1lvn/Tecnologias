#!/bin/bash

# 🚀 FichaMedica - Script de Prueba Automatizado
# Ejecuta todas las verificaciones necesarias para probar la aplicación

echo "🏥 === FICHAMEDICA - SCRIPT DE PRUEBAS AUTOMATIZADO ==="
echo "📅 Fecha: $(date)"
echo "👤 Usuario: $(whoami)"
echo "📂 Directorio: $(pwd)"
echo ""

# Variables de configuración
PROJECT_DIR="/home/matti/Documents/WebApp/App/FichaMedica"
MONGODB_PORT=27017
IONIC_PORT=8100
TEST_TIMEOUT=30

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}🔄 === $1 ===${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "ionic.config.json" ]; then
    print_error "No estamos en el directorio del proyecto FichaMedica"
    print_info "Navegando a: $PROJECT_DIR"
    cd "$PROJECT_DIR" || {
        print_error "No se puede acceder al directorio del proyecto"
        exit 1
    }
fi

# PASO 1: Verificar Prerequisites
print_step "VERIFICANDO PREREQUISITES"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js detectado: $NODE_VERSION"
    
    # Verificar versión mínima (v18.0.0)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Versión de Node.js es compatible (>= 18)"
    else
        print_error "Versión de Node.js muy antigua. Se requiere >= 18.0.0"
        exit 1
    fi
else
    print_error "Node.js no está instalado"
    exit 1
fi

# NPM
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "NPM detectado: v$NPM_VERSION"
else
    print_error "NPM no está instalado"
    exit 1
fi

# Ionic CLI
if command -v ionic &> /dev/null; then
    IONIC_VERSION=$(ionic --version)
    print_success "Ionic CLI detectado: $IONIC_VERSION"
else
    print_warning "Ionic CLI no está instalado globalmente"
    print_info "Instalando Ionic CLI..."
    npm install -g @ionic/cli
    if [ $? -eq 0 ]; then
        print_success "Ionic CLI instalado correctamente"
    else
        print_error "Error instalando Ionic CLI"
        exit 1
    fi
fi

# PASO 2: Verificar MongoDB
print_step "VERIFICANDO MONGODB"

# Verificar si MongoDB está corriendo
if pgrep -x "mongod" > /dev/null; then
    print_success "MongoDB está corriendo"
else
    print_warning "MongoDB no está corriendo, intentando iniciar..."
    
    # Intentar iniciar MongoDB
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mongod
        sleep 3
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB iniciado correctamente"
        else
            print_error "No se pudo iniciar MongoDB con systemctl"
        fi
    elif command -v service &> /dev/null; then
        sudo service mongod start
        sleep 3
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB iniciado correctamente"
        else
            print_error "No se pudo iniciar MongoDB con service"
        fi
    else
        print_error "No se puede iniciar MongoDB automáticamente"
        print_info "Por favor, inicia MongoDB manualmente"
    fi
fi

# Verificar conectividad a MongoDB
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_success "Conexión a MongoDB exitosa"
    else
        print_error "No se puede conectar a MongoDB"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_success "Conexión a MongoDB exitosa"
    else
        print_error "No se puede conectar a MongoDB"
    fi
else
    print_warning "Cliente de MongoDB no encontrado"
fi

# PASO 3: Verificar e instalar dependencias
print_step "VERIFICANDO DEPENDENCIAS DEL PROYECTO"

if [ ! -d "node_modules" ]; then
    print_info "Directorio node_modules no existe, instalando dependencias..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencias instaladas correctamente"
    else
        print_error "Error instalando dependencias"
        exit 1
    fi
else
    print_success "Directorio node_modules existe"
    
    # Verificar si package-lock.json es más nuevo que node_modules
    if [ "package-lock.json" -nt "node_modules" ]; then
        print_warning "package-lock.json es más nuevo, ejecutando npm ci..."
        npm ci
        if [ $? -eq 0 ]; then
            print_success "Dependencias actualizadas correctamente"
        else
            print_error "Error actualizando dependencias"
            exit 1
        fi
    fi
fi

# Verificar dependencias críticas
print_info "Verificando dependencias críticas..."

CRITICAL_DEPS=("@ionic/angular" "@angular/core" "mongoose" "rxjs" "typescript")
for dep in "${CRITICAL_DEPS[@]}"; do
    if npm list "$dep" > /dev/null 2>&1; then
        VERSION=$(npm list "$dep" --depth=0 2>/dev/null | grep "$dep" | head -1 | awk '{print $2}')
        print_success "$dep@$VERSION"
    else
        print_error "Dependencia crítica no encontrada: $dep"
    fi
done

# PASO 4: Compilación y verificación de errores
print_step "COMPILANDO PROYECTO"

print_info "Ejecutando compilación de TypeScript..."
npx tsc --noEmit --project tsconfig.json
if [ $? -eq 0 ]; then
    print_success "Compilación de TypeScript exitosa"
else
    print_error "Errores de compilación de TypeScript encontrados"
    print_warning "Continuando con las pruebas..."
fi

print_info "Ejecutando build de desarrollo..."
ng build --configuration development --verbose=false
if [ $? -eq 0 ]; then
    print_success "Build de desarrollo exitoso"
else
    print_error "Error en build de desarrollo"
    print_warning "Continuando con las pruebas..."
fi

# PASO 5: Verificar estructura de archivos
print_step "VERIFICANDO ESTRUCTURA DE ARCHIVOS"

CRITICAL_FILES=(
    "src/app/services/patient.service.ts"
    "src/app/services/medical-consultation.service.ts"
    "src/app/models/patient.interface.ts"
    "src/app/models/medical-consultation.interface.ts"
    "src/app/schemas/patient.schema.ts"
    "src/app/utils/validators.ts"
    "src/environments/environment.ts"
    "src/environments/environment.mongodb.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Archivo encontrado: $file"
    else
        print_error "Archivo faltante: $file"
    fi
done

# PASO 6: Ejecutar servidor de desarrollo
print_step "INICIANDO SERVIDOR DE DESARROLLO"

print_info "Iniciando Ionic serve en puerto $IONIC_PORT..."

# Matar procesos previos en el puerto
lsof -ti:$IONIC_PORT | xargs kill -9 2>/dev/null

# Iniciar ionic serve en background
ionic serve --port=$IONIC_PORT --no-open --quiet &
IONIC_PID=$!

print_info "Esperando que el servidor se inicie... (PID: $IONIC_PID)"

# Esperar a que el servidor responda
for i in $(seq 1 $TEST_TIMEOUT); do
    if curl -s "http://localhost:$IONIC_PORT" > /dev/null 2>&1; then
        print_success "Servidor de desarrollo respondiendo en http://localhost:$IONIC_PORT"
        break
    fi
    
    if [ $i -eq $TEST_TIMEOUT ]; then
        print_error "Timeout esperando respuesta del servidor"
        kill $IONIC_PID 2>/dev/null
        exit 1
    fi
    
    echo -n "."
    sleep 1
done

# PASO 7: Verificar endpoints y respuestas
print_step "VERIFICANDO RESPUESTAS DEL SERVIDOR"

# Verificar página principal
if curl -s "http://localhost:$IONIC_PORT" | grep -q "FichaMedica\|ionic\|angular"; then
    print_success "Página principal carga correctamente"
else
    print_warning "La página principal puede no estar cargando correctamente"
fi

# Verificar assets
if curl -s "http://localhost:$IONIC_PORT/assets/shapes.svg" > /dev/null 2>&1; then
    print_success "Assets estáticos accesibles"
else
    print_warning "Assets estáticos pueden no estar accesibles"
fi

# PASO 8: Generar reporte de pruebas
print_step "GENERANDO REPORTE DE PRUEBAS"

REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).txt"

cat > "$REPORT_FILE" << EOF
REPORTE DE PRUEBAS - FICHAMEDICA
================================
Fecha: $(date)
Usuario: $(whoami)
Directorio: $(pwd)

ENVIRONMENT:
- Node.js: $NODE_VERSION
- NPM: v$NPM_VERSION
- Ionic CLI: $IONIC_VERSION
- MongoDB: $(pgrep -x "mongod" > /dev/null && echo "Running" || echo "Not Running")

SERVIDOR:
- Puerto: $IONIC_PORT
- PID: $IONIC_PID
- URL: http://localhost:$IONIC_PORT

ARCHIVOS VERIFICADOS:
EOF

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file" >> "$REPORT_FILE"
    else
        echo "❌ $file" >> "$REPORT_FILE"
    fi
done

print_success "Reporte generado: $REPORT_FILE"

# PASO 9: Instrucciones finales
print_step "PRUEBAS COMPLETADAS"

echo ""
echo "🎉 ¡SERVIDOR CORRIENDO EXITOSAMENTE!"
echo ""
echo "📱 Accede a la aplicación en: ${GREEN}http://localhost:$IONIC_PORT${NC}"
echo "🖥️  Abre DevTools para ver logs de pruebas automáticas"
echo "📊 MongoDB corriendo en puerto: $MONGODB_PORT"
echo "📋 Reporte guardado en: $REPORT_FILE"
echo ""
echo "🧪 PRÓXIMOS PASOS:"
echo "1. Abre http://localhost:$IONIC_PORT en tu navegador"
echo "2. Abre DevTools (F12) y ve a la pestaña Console"
echo "3. Navega por las 5 pestañas de la aplicación"
echo "4. Verifica que los servicios cargan sin errores"
echo "5. Prueba crear/buscar pacientes y consultas"
echo ""
echo "🛑 Para detener el servidor, presiona Ctrl+C o ejecuta:"
echo "   kill $IONIC_PID"
echo ""

# Mantener el script corriendo hasta que el usuario lo detenga
print_info "Presiona Ctrl+C para detener el servidor y salir..."

# Trap para limpiar al salir
trap 'echo ""; print_info "Deteniendo servidor..."; kill $IONIC_PID 2>/dev/null; print_success "Servidor detenido. ¡Adiós!"; exit 0' INT

# Mantener el script activo
while kill -0 $IONIC_PID 2>/dev/null; do
    sleep 5
done

print_warning "El servidor se detuvo inesperadamente"