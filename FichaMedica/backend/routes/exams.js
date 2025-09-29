const express = require('express');
const router = express.Router();
const MedicalExam = require('../models/MedicalExam');
const Patient = require('../models/Patient');
const { body, validationResult, param } = require('express-validator');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateExam = [
  body('patientId')
    .isMongoId()
    .withMessage('ID de paciente inválido'),
  
  body('nombre')
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre del examen debe tener entre 2 y 200 caracteres'),
  
  body('fecha')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido'),
  
  body('resultado')
    .isLength({ min: 1, max: 1000 })
    .withMessage('El resultado debe tener entre 1 y 1000 caracteres'),
  
  body('estado')
    .isIn(['normal', 'atencion', 'critico', 'pendiente'])
    .withMessage('Estado inválido'),
  
  body('valorReferencia')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El valor de referencia no puede exceder 500 caracteres'),
  
  body('detalle')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('El detalle no puede exceder 2000 caracteres'),
  
  body('laboratorio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('El laboratorio no puede exceder 200 caracteres'),
  
  body('medico')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El médico no puede exceder 100 caracteres'),
  
  body('tipoExamen')
    .optional()
    .isIn(['laboratorio', 'imagen', 'funcional', 'biopsia', 'otros'])
    .withMessage('Tipo de examen inválido')
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

// GET /api/patients/:patientId/examenes - Obtener exámenes de un paciente
router.get('/:patientId/examenes', [
  param('patientId').isMongoId().withMessage('ID de paciente inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const estado = req.query.estado;
    const tipoExamen = req.query.tipoExamen;
    const skip = (page - 1) * limit;

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
    if (tipoExamen) filter.tipoExamen = tipoExamen;

    // Obtener exámenes con paginación
    const [examenes, total] = await Promise.all([
      MedicalExam.find(filter)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MedicalExam.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      examenes: examenes.map(examen => ({
        ...examen,
        id: examen._id,
        _id: undefined
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        estado: estado || '',
        tipoExamen: tipoExamen || ''
      }
    });

  } catch (error) {
    console.error('Error al obtener exámenes:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/patients/:patientId/examenes - Crear nuevo examen
router.post('/:patientId/examenes', [
  param('patientId').isMongoId().withMessage('ID de paciente inválido'),
  ...validateExam,
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

    // Crear nuevo examen
    const nuevoExamen = new MedicalExam({
      ...req.body,
      patientId
    });

    const examenGuardado = await nuevoExamen.save();

    res.status(201).json({
      success: true,
      message: 'Examen creado exitosamente',
      examen: {
        ...examenGuardado.toObject(),
        id: examenGuardado._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error al crear examen:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Datos de examen inválidos',
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/examenes/:examId - Actualizar examen
router.put('/examenes/:examId', [
  param('examId').isMongoId().withMessage('ID de examen inválido'),
  ...validateExam,
  handleValidationErrors
], async (req, res) => {
  try {
    const { examId } = req.params;

    const examenActualizado = await MedicalExam.findByIdAndUpdate(
      examId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!examenActualizado) {
      return res.status(404).json({
        error: true,
        message: 'Examen no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Examen actualizado exitosamente',
      examen: {
        ...examenActualizado.toObject(),
        id: examenActualizado._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error al actualizar examen:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/examenes/:examId - Eliminar examen
router.delete('/examenes/:examId', [
  param('examId').isMongoId().withMessage('ID de examen inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { examId } = req.params;

    const examen = await MedicalExam.findByIdAndDelete(examId);

    if (!examen) {
      return res.status(404).json({
        error: true,
        message: 'Examen no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Examen eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar examen:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/examenes/:examId - Obtener examen específico
router.get('/examenes/:examId', [
  param('examId').isMongoId().withMessage('ID de examen inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { examId } = req.params;

    const examen = await MedicalExam.findById(examId)
      .populate('patientId', 'nombres apellidos documento')
      .lean();

    if (!examen) {
      return res.status(404).json({
        error: true,
        message: 'Examen no encontrado'
      });
    }

    res.json({
      success: true,
      examen: {
        ...examen,
        id: examen._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error al obtener examen:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/examenes/alerts - Obtener exámenes que requieren atención
router.get('/examenes/alerts', async (req, res) => {
  try {
    const examenes = await MedicalExam.findAlertsExams();

    res.json({
      success: true,
      examenes: examenes.map(examen => ({
        ...examen.toObject(),
        id: examen._id,
        _id: undefined,
        paciente: {
          id: examen.patientId._id,
          nombre: `${examen.patientId.nombres} ${examen.patientId.apellidos}`,
          documento: examen.patientId.documento
        },
        patientId: undefined
      }))
    });

  } catch (error) {
    console.error('Error al obtener alertas de exámenes:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;