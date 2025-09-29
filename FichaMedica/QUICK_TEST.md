# 🎯 **GUÍA RÁPIDA DE PRUEBAS - 5 MINUTOS**

## 🚀 **Método Express (Script Automatizado)**

```bash
# 1. Ejecutar script de pruebas automático
./test-fichamedica.sh

# El script hace todo automáticamente:
# ✅ Verifica prerequisites 
# ✅ Inicia MongoDB
# ✅ Instala dependencias
# ✅ Compila el proyecto
# ✅ Inicia el servidor
# ✅ Genera reporte
```

## 🖥️ **Método Manual (Paso a Paso)**

### **1. Preparación (30 segundos)**
```bash
cd /home/matti/Documents/WebApp/App/FichaMedica
npm install
```

### **2. MongoDB (30 segundos)**
```bash
# Iniciar MongoDB
sudo systemctl start mongod

# O si ya está corriendo, verificar
mongosh --eval "db.runCommand('ping')"
```

### **3. Ejecutar App (30 segundos)**
```bash
ionic serve
# Esperar a que abra en http://localhost:8100
```

### **4. Pruebas Rápidas (3 minutos)**

#### **A. Verificar Carga Básica**
- ✅ La app carga sin errores
- ✅ Se ven 5 pestañas: Patients, Consultations, Medications, Reports, Settings
- ✅ No hay errores rojos en DevTools Console

#### **B. Probar Navegación**
- ✅ Hacer clic en cada pestaña
- ✅ Verificar que cada vista carga
- ✅ No hay errores de compilación

#### **C. Console Tests (Automático)**
```javascript
// Abrir DevTools (F12) -> Console
// Pegar este código:

// Test validadores
console.log('RUT válido:', validateRut('12345678-9'));
console.log('IMC:', calculateIMC(70, 1.70));

// Los servicios se auto-testean al cargar la app
// Ver logs automáticos en console
```

## ✅ **Checklist Rápido**

### **🔧 Configuración (1 min)**
- [ ] Node.js >= 18 instalado
- [ ] MongoDB corriendo
- [ ] Dependencias instaladas

### **💻 Aplicación (2 min)**
- [ ] `ionic serve` ejecuta sin errores
- [ ] App carga en http://localhost:8100
- [ ] 5 pestañas visibles y navegables
- [ ] No hay errores rojos en Console

### **🧪 Funcionalidad (2 min)**
- [ ] Servicios cargan automáticamente
- [ ] Validadores funcionan (RUT, IMC, PA)
- [ ] Estados reactivos se inicializan
- [ ] Cache se configura correctamente

## 🎉 **¡LISTO!**

Si todos los checkboxes están marcados, **¡la aplicación funciona perfectamente!**

---

## 🔥 **One-Liner Para Todo**

```bash
# Comando único que hace TODO
./test-fichamedica.sh && echo "🎉 ¡APP FUNCIONANDO!" || echo "❌ Revisar errores"
```

---

## 📱 **Qué Esperar Ver**

### **En el Navegador:**
- 🏥 Título "FichaMedica" 
- 📱 Interfaz Ionic responsive
- 🎯 5 pestañas funcionales
- ⚡ Navegación fluida

### **En la Console:**
```
🧪 === INICIANDO PRUEBAS DE VALIDADORES ===
RUT 12345678-9: ✅ Válido
IMC (70kg, 1.70m): 24.2
PA 120/80: Normal
✅ TODAS LAS PRUEBAS DE VALIDADORES EXITOSAS

🔄 PatientService Loading: false
👥 Pacientes en memoria: 0
🔄 ConsultationService Loading: false
🏥 Consultas en memoria: 0
```

### **En MongoDB:**
```bash
# Verificar que la BD existe
mongosh fichamedica --eval "show collections"
# Resultado esperado: patients, consultations, medications, etc.
```

¡**5 minutos y tienes todo funcionando!** 🚀