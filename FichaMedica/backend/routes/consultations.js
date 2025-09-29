const express = require('express');
const router = express.Router();
const MedicalConsultation = require('../models/MedicalConsultation');
const Patient = require('../models/Patient');
const { body, validationResult, param } = require('express-validator');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateConsultation = [
  body('patientId')
    .isMongoId()
    .withMessage('ID de paciente inválido'),
  
  body('fecha')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido'),
  
  body('hora')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora inválido (HH:MM)'),
  
  body('medico')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del médico debe tener entre 2 y 100 caracteres'),
  
  body('especialidad')
    .isLength({ min: 2, max: 100 })
    .withMessage('La especialidad debe tener entre 2 y 100 caracteres'),
  
  body('motivo')
    .isLength({ min: 5, max: 500 })
    .withMessage('El motivo debe tener entre 5 y 500 caracteres'),
  
  body('observaciones')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Las observaciones no pueden exceder 2000 caracteres'),
  
  body('signosVitales.presionArterial')
    .optional()
    .matches(/^\d{2,3}\/\d{2,3}\s?(mmHg)?$/i)
    .withMessage('Formato de presión arterial inválido'),
  
  body('signosVitales.frecuenciaCardiaca')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Frecuencia cardíaca debe estar entre 30 y 300'),
  
  body('signosVitales.temperatura')
    .optional()
    .isFloat({ min: 30, max: 50 })
    .withMessage('Temperatura debe estar entre 30 y 50°C'),
  
  body('signosVitales.peso')
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Peso debe estar entre 0.1 y 1000 kg')
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

// GET /api/patients/:patientId/consultas - Obtener consultas de un paciente
router.get('/:patientId/consultas', [
  param('patientId').isMongoId().withMessage('ID de paciente inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verificar que el paciente existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Paciente no encontrado'
      });
    }

    // Obtener consultas con paginación
    const [consultas, total] = await Promise.all([
      MedicalConsultation.find({ patientId })
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MedicalConsultation.countDocuments({ patientId })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      consultas: consultas.map(consulta => ({
        ...consulta,
        id: consulta._id,
        _id: undefined
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener consultas:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/patients/:patientId/consultas - Crear nueva consulta
router.post('/:patientId/consultas', [
  param('patientId').isMongoId().withMessage('ID de paciente inválido'),
  ...validateConsultation,
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

    // Crear nueva consulta
    const nuevaConsulta = new MedicalConsultation({
      ...req.body,
      patientId
    });

    const consultaGuardada = await nuevaConsulta.save();

    // Actualizar última visita del paciente
    await Patient.findByIdAndUpdate(patientId, {
      ultimaVisita: nuevaConsulta.fecha
    });

    res.status(201).json({
      success: true,
      message: 'Consulta creada exitosamente',
      consulta: {
        ...consultaGuardada.toObject(),
        id: consultaGuardada._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error al crear consulta:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Datos de consulta inválidos',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/consultas/:consultationId - Actualizar consulta
router.put('/consultas/:consultationId', [
  param('consultationId').isMongoId().withMessage('ID de consulta inválido'),
  ...validateConsultation,
  handleValidationErrors
], async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultaActualizada = await MedicalConsultation.findByIdAndUpdate(
      consultationId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!consultaActualizada) {
      return res.status(404).json({
        error: true,
        message: 'Consulta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Consulta actualizada exitosamente',
      consulta: {
        ...consultaActualizada.toObject(),
        id: consultaActualizada._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error al actualizar consulta:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/consultas/:consultationId - Eliminar consulta
router.delete('/consultas/:consultationId', [
  param('consultationId').isMongoId().withMessage('ID de consulta inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consulta = await MedicalConsultation.findByIdAndDelete(consultationId);

    if (!consulta) {
      return res.status(404).json({
        error: true,
        message: 'Consulta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Consulta eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar consulta:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/consultas/:consultationId - Obtener consulta específica
router.get('/consultas/:consultationId', [
  param('consultationId').isMongoId().withMessage('ID de consulta inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consulta = await MedicalConsultation.findById(consultationId)
      .populate('patientId', 'nombres apellidos documento')
      .lean();

    if (!consulta) {
      return res.status(404).json({
        error: true,
        message: 'Consulta no encontrada'
      });
    }

    res.json({
      success: true,
      consulta: {
        ...consulta,
        id: consulta._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error al obtener consulta:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;