const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { body, validationResult } = require('express-validator');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validatePatient = [
  body('nombres')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los nombres deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .withMessage('Los nombres solo pueden contener letras'),
  
  body('apellidos')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .withMessage('Los apellidos solo pueden contener letras'),
  
  body('documento')
    .isLength({ min: 5, max: 20 })
    .withMessage('El documento debe tener entre 5 y 20 caracteres')
    .matches(/^[0-9A-Za-z\-]+$/)
    .withMessage('Formato de documento inválido'),
  
  body('tipoDocumento')
    .isIn(['CC', 'TI', 'CE', 'PP', 'RC'])
    .withMessage('Tipo de documento inválido'),
  
  body('fechaNacimiento')
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      
      if (date > today || date < minDate) {
        throw new Error('Fecha de nacimiento inválida');
      }
      return true;
    }),
  
  body('email')
    .isEmail()
    .withMessage('Formato de email inválido')
    .normalizeEmail(),
  
  body('telefono')
    .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/)
    .withMessage('Formato de teléfono inválido'),
  
  body('genero')
    .isIn(['M', 'F', 'Otro'])
    .withMessage('Género inválido'),
  
  body('estadoCivil')
    .isIn(['soltero', 'casado', 'divorciado', 'viudo', 'union_libre'])
    .withMessage('Estado civil inválido'),
  
  // NUEVAS VALIDACIONES PARA CAMPOS ADICIONALES
  body('rut')
    .optional()
    .matches(/^[0-9]+[-][0-9kK]$/)
    .withMessage('Formato de RUT inválido (debe ser XXXXXXXX-X)'),
  
  body('ubicacion')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La ubicación no puede exceder 50 caracteres'),
  
  body('diagnostico')
    .optional()
    .isLength({ max: 200 })
    .withMessage('El diagnóstico no puede exceder 200 caracteres'),
  
  body('peso')
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('El peso debe estar entre 0.1 y 1000 kg'),
  
  body('altura')
    .optional()
    .isFloat({ min: 10, max: 300 })
    .withMessage('La altura debe estar entre 10 y 300 cm'),
  
  body('presionArterial')
    .optional()
    .matches(/^\d{2,3}\/\d{2,3}\s?(mmHg)?$/i)
    .withMessage('Formato de presión arterial inválido (ej: 120/80 mmHg)'),
  
  body('frecuenciaCardiaca')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('La frecuencia cardíaca debe estar entre 30 y 300'),
  
  body('temperatura')
    .optional()
    .isFloat({ min: 30, max: 50 })
    .withMessage('La temperatura debe estar entre 30 y 50°C')
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

// GET /api/patients - Obtener todos los pacientes con paginación y búsqueda
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    // Construir filtros
    let filter = {};
    
    if (status && status !== 'all') {
      if (status === 'active') filter.estado = 'activo';
      if (status === 'inactive') filter.estado = 'inactivo';
    }

    // Construir query
    let query;
    if (search.trim()) {
      // Búsqueda por texto en múltiples campos INCLUYENDO NUEVOS CAMPOS
      const searchRegex = new RegExp(search.trim().split(' ').join('|'), 'i');
      query = Patient.find({
        $and: [
          filter,
          {
            $or: [
              { nombres: searchRegex },
              { apellidos: searchRegex },
              { documento: searchRegex },
              { rut: searchRegex },
              { email: searchRegex },
              { diagnostico: searchRegex },
              { ubicacion: searchRegex }
            ]
          }
        ]
      });
    } else {
      query = Patient.find(filter);
    }

    // Ejecutar consultas en paralelo
    const [patients, total] = await Promise.all([
      query
        .sort({ fechaCreacion: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(search.trim() ? {
        $and: [
          filter,
          {
            $or: [
              { nombres: new RegExp(search.trim().split(' ').join('|'), 'i') },
              { apellidos: new RegExp(search.trim().split(' ').join('|'), 'i') },
              { documento: new RegExp(search.trim().split(' ').join('|'), 'i') },
              { rut: new RegExp(search.trim().split(' ').join('|'), 'i') },
              { email: new RegExp(search.trim().split(' ').join('|'), 'i') },
              { diagnostico: new RegExp(search.trim().split(' ').join('|'), 'i') },
              { ubicacion: new RegExp(search.trim().split(' ').join('|'), 'i') }
            ]
          }
        ]
      } : filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      patients: patients.map(patient => ({
        ...patient,
        id: patient._id,
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
        search,
        status
      }
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor al obtener pacientes'
    });
  }
});

// GET /api/patients/:id - Obtener un paciente por ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).lean();
    
    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      ...patient,
      id: patient._id,
      _id: undefined
    });

  } catch (error) {
    console.error('Error fetching patient:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'ID de paciente inválido'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/patients - Crear nuevo paciente
router.post('/', validatePatient, handleValidationErrors, async (req, res) => {
  try {
    // Verificar si ya existe un paciente con el mismo documento o email
    const existingPatient = await Patient.findOne({
      $or: [
        { documento: req.body.documento },
        { email: req.body.email }
      ]
    });

    if (existingPatient) {
      return res.status(409).json({
        error: true,
        message: 'Ya existe un paciente con ese documento o email'
      });
    }

    const patient = new Patient(req.body);
    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      patient: {
        ...patient.toObject(),
        id: patient._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error creating patient:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Datos de paciente inválidos',
        details: Object.values(error.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: true,
        message: 'Ya existe un paciente con ese documento o email'
      });
    }

    res.status(500).json({
      error: true,
      message: 'Error interno del servidor al crear paciente'
    });
  }
});

// PUT /api/patients/:id - Actualizar paciente
router.put('/:id', validatePatient, handleValidationErrors, async (req, res) => {
  try {
    // Verificar si otro paciente ya tiene el mismo documento o email
    const existingPatient = await Patient.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { documento: req.body.documento },
        { email: req.body.email }
      ]
    });

    if (existingPatient) {
      return res.status(409).json({
        error: true,
        message: 'Ya existe otro paciente con ese documento o email'
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      patient: {
        ...patient,
        id: patient._id,
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Error updating patient:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'ID de paciente inválido'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Datos de paciente inválidos',
        details: Object.values(error.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    res.status(500).json({
      error: true,
      message: 'Error interno del servidor al actualizar paciente'
    });
  }
});

// DELETE /api/patients/:id - Eliminar paciente (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { estado: 'inactivo', fechaActualizacion: new Date() },
      { new: true }
    ).lean();

    if (!patient) {
      return res.status(404).json({
        error: true,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Paciente marcado como inactivo exitosamente'
    });

  } catch (error) {
    console.error('Error deleting patient:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'ID de paciente inválido'
      });
    }

    res.status(500).json({
      error: true,
      message: 'Error interno del servidor al eliminar paciente'
    });
  }
});

// GET /api/patients/search/advanced - Búsqueda avanzada
router.get('/search/advanced', async (req, res) => {
  try {
    const { 
      q, 
      genero, 
      estadoCivil, 
      grupoSanguineo, 
      eps,
      edadMin,
      edadMax,
      estado = 'activo'
    } = req.query;

    let filter = {};
    
    // Filtro por estado
    if (estado !== 'all') {
      filter.estado = estado;
    }

    // Filtros específicos
    if (genero && genero !== 'all') filter.genero = genero;
    if (estadoCivil && estadoCivil !== 'all') filter.estadoCivil = estadoCivil;
    if (grupoSanguineo && grupoSanguineo !== 'all') filter.grupoSanguineo = grupoSanguineo;
    if (eps && eps !== 'all') filter.eps = new RegExp(eps, 'i');

    // Filtro por edad (requiere cálculo)
    if (edadMin || edadMax) {
      const today = new Date();
      
      if (edadMax) {
        const minBirthDate = new Date(today.getFullYear() - parseInt(edadMax) - 1, today.getMonth(), today.getDate());
        filter.fechaNacimiento = { $gte: minBirthDate };
      }
      
      if (edadMin) {
        const maxBirthDate = new Date(today.getFullYear() - parseInt(edadMin), today.getMonth(), today.getDate());
        filter.fechaNacimiento = { 
          ...filter.fechaNacimiento,
          $lte: maxBirthDate 
        };
      }
    }

    // Búsqueda por texto
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim().split(' ').join('|'), 'i');
      filter.$or = [
        { nombres: searchRegex },
        { apellidos: searchRegex },
        { documento: searchRegex },
        { email: searchRegex }
      ];
    }

    const patients = await Patient.find(filter)
      .sort({ fechaCreacion: -1 })
      .limit(100)
      .lean();

    res.json({
      patients: patients.map(patient => ({
        ...patient,
        id: patient._id,
        _id: undefined
      })),
      total: patients.length,
      filters: req.query
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({
      error: true,
      message: 'Error en búsqueda avanzada'
    });
  }
});

// GET /api/patients/stats/overview - Estadísticas generales
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalActivos,
      totalInactivos,
      totalConSeguro,
      totalPorGenero,
      totalPorGrupoSanguineo
    ] = await Promise.all([
      Patient.countDocuments({ estado: 'activo' }),
      Patient.countDocuments({ estado: 'inactivo' }),
      Patient.countDocuments({ 
        estado: 'activo',
        eps: { $exists: true, $ne: '' }
      }),
      Patient.aggregate([
        { $match: { estado: 'activo' } },
        { $group: { _id: '$genero', count: { $sum: 1 } } }
      ]),
      Patient.aggregate([
        { 
          $match: { 
            estado: 'activo',
            grupoSanguineo: { $exists: true, $ne: '' }
          }
        },
        { $group: { _id: '$grupoSanguineo', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      overview: {
        total: totalActivos + totalInactivos,
        activos: totalActivos,
        inactivos: totalInactivos,
        conSeguro: totalConSeguro,
        porcentajeActivos: totalActivos > 0 ? ((totalActivos / (totalActivos + totalInactivos)) * 100).toFixed(2) : 0
      },
      distribucion: {
        porGenero: totalPorGenero,
        porGrupoSanguineo: totalPorGrupoSanguineo
      }
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: true,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;