const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const Patient = require('../models/Patient');
const { body, validationResult, param } = require('express-validator');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateMedication = [
  body('patientId')
    .isMongoId()
    .withMessage('ID de paciente inválido'),
  
  body('nombre')
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre del medicamento debe tener entre 2 y 200 caracteres'),
  
  body('dosis')
    .isLength({ min: 1, max: 100 })
    .withMessage('La dosis debe tener entre 1 y 100 caracteres'),
  
  body('frecuencia')
    .isLength({ min: 1, max: 100 })
    .withMessage('La frecuencia debe tener entre 1 y 100 caracteres'),
  
  body('via')
    .isIn(['Oral', 'IV', 'IM', 'SC', 'Tópica', 'Inhalatoria', 'Rectal', 'Sublingual', 'Otra'])
    .withMessage('Vía de administración inválida'),
  
  body('indicacion')
    .isLength({ min: 2, max: 500 })
    .withMessage('La indicación debe tener entre 2 y 500 caracteres'),
  
  body('medicoPrescriptor')
    .isLength({ min: 2, max: 100 })
    .withMessage('El médico prescriptor debe tener entre 2 y 100 caracteres'),
  
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de inicio inválido'),
  
  body('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de fin inválido'),
  
  body('estado')
    .optional()
    .isIn(['Activo', 'Suspendido', 'Finalizado'])
    .withMessage('Estado inválido'),
  
  body('adherencia')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('La adherencia debe estar entre 0 y 100%'),
  
  body('costo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo no puede ser negativo')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: 'Datos de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/patients/:patientId/medicamentos - Obtener medicamentos de un paciente
router.get('/:patientId/medicamentos', [
  param('patientId').isMongoId().withMessage('ID de paciente inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { patientId } = req.params;
    const estado = req.query.estado;
    const activos = req.query.activos === 'true';

    // Verificar que el paciente existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Paciente no encontrado'
      });
    }

    // Construir filtros
    let filter = { patientId };
    if (estado) filter.estado = estado;
    if (activos) filter.estado = 'Activo';

    // Obtener medicamentos
    const medicamentos = await Medication.find(filter)
      .sort({ fechaInicio: -1 })
      .lean();

    res.json({
      success: true,
      medicamentos: medicamentos.map(medicamento => ({
        ...medicamento,
        id: medicamento._id,
        _id: undefined
      }))
    });

  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/patients/:patientId/medicamentos - Crear nuevo medicamento
router.post('/:patientId/medicamentos', [
  param('patientId').isMongoId().withMessage('ID de paciente inválido'),
  ...validateMedication,
  handleValidationErrors
], async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verificar que el paciente existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar posibles interacciones
    const interacciones = await Medication.checkInteractions(patientId, req.body.nombre);

    // Crear nuevo medicamento
    const nuevoMedicamento = new Medication({
      ...req.body,
      patientId
    });

    const medicamentoGuardado = await nuevoMedicamento.save();

    res.status(201).json({
      success: true,
      message: 'Medicamento agregado exitosamente',
      medicamento: {
        ...medicamentoGuardado.toObject(),
        id: medicamentoGuardado._id,
        _id: undefined
      },
      interacciones: interacciones
    });

  } catch (error) {
    console.error('Error al crear medicamento:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Datos de medicamento inválidos',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/medicamentos/:medicationId - Actualizar medicamento
router.put('/medicamentos/:medicationId', [
  param('medicationId').isMongoId().withMessage('ID de medicamento inválido'),
  ...validateMedication,
  handleValidationErrors
], async (req, res) => {
  try {
    const { medicationId } = req.params;

    const medicamentoActualizado = await Medication.findByIdAndUpdate(
      medicationId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicamentoActualizado) {
      return res.status(404).json({
        error: true,
        message: 'Medicamento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Medicamento actualizado exitosamente',
      medicamento: {
        ...medicamentoActualizado.toObject(),
        id: medicamentoActualizado._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error al actualizar medicamento:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/medicamentos/:medicationId - Eliminar/Suspender medicamento
router.delete('/medicamentos/:medicationId', [
  param('medicationId').isMongoId().withMessage('ID de medicamento inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { medicationId } = req.params;
    const { motivo } = req.body;

    // En lugar de eliminar, suspender el medicamento
    const medicamentoSuspendido = await Medication.findByIdAndUpdate(
      medicationId,
      { 
        estado: 'Suspendido',
        fechaFin: new Date(),
        observaciones: motivo || 'Medicamento suspendido'
      },
      { new: true }
    );

    if (!medicamentoSuspendido) {
      return res.status(404).json({
        error: true,
        message: 'Medicamento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Medicamento suspendido exitosamente'
    });

  } catch (error) {
    console.error('Error al suspender medicamento:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/medicamentos/:medicationId - Obtener medicamento específico
router.get('/medicamentos/:medicationId', [
  param('medicationId').isMongoId().withMessage('ID de medicamento inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { medicationId } = req.params;

    const medicamento = await Medication.findById(medicationId)
      .populate('patientId', 'nombres apellidos documento')
      .lean();

    if (!medicamento) {
      return res.status(404).json({
        error: true,
        message: 'Medicamento no encontrado'
      });
    }

    res.json({
      success: true,
      medicamento: {
        ...medicamento,
        id: medicamento._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error al obtener medicamento:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/medicamentos/interacciones - Verificar interacciones medicamentosas
router.get('/medicamentos/interacciones', async (req, res) => {
  try {
    const { patientId, medicamento } = req.query;

    if (!patientId || !medicamento) {
      return res.status(400).json({
        error: true,
        message: 'Se requiere patientId y medicamento'
      });
    }

    const interacciones = await Medication.checkInteractions(patientId, medicamento);

    res.json({
      success: true,
      interacciones
    });

  } catch (error) {
    console.error('Error al verificar interacciones:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/patients/:patientId/medicamentos/activos - Obtener solo medicamentos activos
router.get('/:patientId/medicamentos/activos', [
  param('patientId').isMongoId().withMessage('ID de paciente inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verificar que el paciente existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Paciente no encontrado'
      });
    }

    const medicamentos = await Medication.findActiveByPatient(patientId);

    res.json({
      success: true,
      medicamentos: medicamentos.map(medicamento => ({
        ...medicamento.toObject(),
        id: medicamento._id,
        _id: undefined
      }))
    });

  } catch (error) {
    console.error('Error al obtener medicamentos activos:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/patients/:patientId/medicamentos/historial - Obtener historial de medicamentos
router.get('/:patientId/medicamentos/historial', [
  param('patientId').isMongoId().withMessage('ID de paciente inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verificar que el paciente existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Paciente no encontrado'
      });
    }

    const historial = await Medication.find({
      patientId,
      estado: { $in: ['Suspendido', 'Finalizado'] }
    }).sort({ fechaFin: -1 });

    res.json({
      success: true,
      historial: historial.map(medicamento => ({
        id: medicamento._id,
        nombre: medicamento.nombre,
        dosis: medicamento.dosis,
        frecuencia: medicamento.frecuencia,
        periodo: `${medicamento.fechaInicio.toISOString().split('T')[0]} - ${medicamento.fechaFin?.toISOString().split('T')[0] || 'Actual'}`,
        medicoPrescriptor: medicamento.medicoPrescriptor,
        estado: medicamento.estado,
        motivo: medicamento.observaciones
      }))
    });

  } catch (error) {
    console.error('Error al obtener historial de medicamentos:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;