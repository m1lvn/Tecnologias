#!/bin/bash

# Script para probar el componente PatientListComponent
# Ubicación: scripts/test-patient-component.sh

echo "🧪 TESTING: Patient List Component"
echo "=================================="
echo ""

# 1. Verificar estructura de archivos
echo "📁 1. Verificando estructura de archivos..."
FILES=(
    "src/app/components/patient/patient-list.component.ts"
    "src/app/components/patient/patient-list.component.html"
    "src/app/components/patient/patient-list.component.scss"
    "src/app/components/index.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - NO ENCONTRADO"
    fi
done

echo ""

# 2. Compilar proyecto para verificar errores TypeScript
echo "🔨 2. Compilando proyecto..."
echo "Ejecutando: ng build --configuration development"
echo ""

if npm run build > build_output.log 2>&1; then
    echo "✅ Compilación exitosa"
    echo "📊 Verificando advertencias..."
    if grep -q "warning" build_output.log; then
        echo "⚠️  Advertencias encontradas:"
        grep "warning" build_output.log
    else
        echo "✅ Sin advertencias"
    fi
else
    echo "❌ Error en compilación:"
    tail -20 build_output.log
    echo ""
    echo "Para ver errores completos: cat build_output.log"
fi

echo ""

# 3. Verificar importaciones
echo "🔗 3. Verificando importaciones del componente..."
if grep -q "PatientListComponent" src/app/tab1/tab1.page.ts; then
    echo "✅ PatientListComponent importado en tab1.page.ts"
else
    echo "❌ PatientListComponent NO importado en tab1.page.ts"
fi

if grep -q "app-patient-list" src/app/tab1/tab1.page.html; then
    echo "✅ app-patient-list incluido en template tab1"
else
    echo "❌ app-patient-list NO incluido en template tab1"
fi

echo ""

# 4. Verificar servicios requeridos
echo "🔧 4. Verificando servicios requeridos..."
if [ -f "src/app/services/patient.service.ts" ]; then
    echo "✅ PatientService disponible"
    
    # Verificar métodos requeridos
    METHODS=("getPatients" "deletePatient")
    PROPERTIES=("patients\$" "loading\$" "error\$")
    
    for method in "${METHODS[@]}"; do
        if grep -q "$method" src/app/services/patient.service.ts; then
            echo "  ✅ Método $method disponible"
        else
            echo "  ❌ Método $method NO encontrado"
        fi
    done
    
    for prop in "${PROPERTIES[@]}"; do
        # Escapar el $ para grep
        escaped_prop=$(echo "$prop" | sed 's/\$/\\$/g')
        if grep -q "public $escaped_prop" src/app/services/patient.service.ts; then
            echo "  ✅ Propiedad $prop disponible"
        else
            echo "  ❌ Propiedad $prop NO encontrado"
        fi
    done
else
    echo "❌ PatientService NO encontrado"
fi

echo ""

# 5. Probar servidor de desarrollo
echo "🚀 5. Iniciando servidor de desarrollo..."
echo "Ejecutando: ionic serve en background..."
echo ""

# Iniciar ionic serve en background
ionic serve --port 8100 > serve_output.log 2>&1 &
SERVE_PID=$!

# Esperar a que el servidor inicie
echo "⏳ Esperando 15 segundos para que inicie el servidor..."
sleep 15

# Verificar si el servidor está ejecutándose
if curl -s http://localhost:8100 > /dev/null; then
    echo "✅ Servidor iniciado correctamente en http://localhost:8100"
    echo ""
    echo "🎯 INSTRUCCIONES DE PRUEBA MANUAL:"
    echo "================================="
    echo "1. Abrir navegador en: http://localhost:8100"
    echo "2. Navegar a Tab 1 (debe mostrar el componente de pacientes)"
    echo "3. Verificar elementos de la interfaz:"
    echo "   - Header con estadísticas de pacientes"
    echo "   - Barra de búsqueda funcional"
    echo "   - Filtros expandibles"
    echo "   - Lista de pacientes (puede estar vacía inicialmente)"
    echo "   - Botón flotante '+' para agregar paciente"
    echo "4. Probar interacciones:"
    echo "   - Búsqueda en tiempo real"
    echo "   - Filtros por estado"
    echo "   - Pull to refresh"
    echo "   - Botones de acción en cada tarjeta"
    echo ""
    echo "📱 RESPONSIVE TESTING:"
    echo "- Redimensionar ventana del navegador"
    echo "- Usar DevTools para simular dispositivos móviles"
    echo "- Verificar que el diseño se adapte correctamente"
    echo ""
    echo "🔧 Para detener el servidor: kill $SERVE_PID"
    echo "📝 Logs del servidor: tail -f serve_output.log"
else
    echo "❌ Error al iniciar servidor"
    echo "Logs del error:"
    tail -10 serve_output.log
    kill $SERVE_PID 2>/dev/null
fi

echo ""
echo "🏁 Test completado. Revisar resultados arriba."
echo "💡 Para pruebas completas, también ejecuta: npm run test"