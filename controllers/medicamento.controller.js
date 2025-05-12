import Medicamento from "../models/medicamento.js"
import DetalleOrdenCompra from "../models/detalleordencompra.js"
import { Op } from "sequelize"

export const createMedicamento = async (req, res) => {
  try {
    const medicamento = await Medicamento.create(req.body)
    
    if (req.originalUrl.startsWith('/api/')) {
      res.status(201).json(medicamento)
    } else {
      res.redirect('/medicamentos?created=true')
    }
  } catch (error) {
    if (req.originalUrl.startsWith('/api/')) {
      res.status(500).json({
        error: "Error al crear medicamento",
        details: error.message,
      })
    } else {
      res.render('medicamentos/create', { 
        error: "Error al crear medicamento: " + error.message,
        medicamento: req.body
      })
    }
  }
}

export const getAllMedicamentos = async (req, res) => {
  try {
    const medicamentos = await Medicamento.findAll()
    
    if (req.originalUrl.startsWith('/api/')) {
      res.status(200).json(medicamentos)
    } else {
      res.render('medicamentos/index', { 
        medicamentos,
        message: req.query.created ? "Medicamento creado exitosamente" : 
                 req.query.updated ? "Medicamento actualizado exitosamente" : 
                 req.query.deleted ? "Medicamento eliminado exitosamente" : null
      })
    }
  } catch (error) {
    if (req.originalUrl.startsWith('/api/')) {
      res.status(500).json({
        error: "Error al obtener medicamentos",
        details: error.message,
      })
    } else {
      res.render('error', { 
        message: 'Error al obtener medicamentos', 
        error: error.message 
      })
    }
  }
}

export const getMedicamentoById = async (req, res) => {
  try {
    const medicamento = await Medicamento.findByPk(req.params.id, {
      include: DetalleOrdenCompra,
    })

    if (!medicamento) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ error: "Medicamento no encontrado" })
      } else {
        return res.render('error', { 
          message: 'Medicamento no encontrado', 
          error: 'El medicamento solicitado no existe' 
        })
      }
    }

    if (req.originalUrl.startsWith('/api/')) {
      res.status(200).json(medicamento)
    } else {
      res.render('medicamentos/show', { medicamento })
    }
  } catch (error) {
    if (req.originalUrl.startsWith('/api/')) {
      res.status(500).json({
        error: "Error al buscar medicamento",
        details: error.message,
      })
    } else {
      res.render('error', { 
        message: 'Error al buscar medicamento', 
        error: error.message 
      })
    }
  }
}

export const getEditMedicamento = async (req, res) => {
  try {
    const medicamento = await Medicamento.findByPk(req.params.id)

    if (!medicamento) {
      return res.render('error', { 
        message: 'Medicamento no encontrado', 
        error: 'El medicamento solicitado no existe' 
      })
    }

    res.render('medicamentos/edit', { medicamento })
  } catch (error) {
    res.render('error', { 
      message: 'Error al buscar medicamento', 
      error: error.message 
    })
  }
}

export const searchMedicamentos = async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({ error: "Se requiere un término de búsqueda" })
      } else {
        return res.redirect('/medicamentos')
      }
    }

    const medicamentos = await Medicamento.findAll({
      where: {
        [Op.or]: [
          { descripcionMed: { [Op.like]: `%${query}%` } }, 
          { Marca: { [Op.like]: `%${query}%` } }
        ],
      },
    })

    if (req.originalUrl.startsWith('/api/')) {
      res.status(200).json(medicamentos)
    } else {
      res.render('medicamentos/index', { 
        medicamentos,
        searchQuery: query
      })
    }
  } catch (error) {
    if (req.originalUrl.startsWith('/api/')) {
      res.status(500).json({
        error: "Error al buscar medicamentos",
        details: error.message,
      })
    } else {
      res.render('error', { 
        message: 'Error al buscar medicamentos', 
        error: error.message 
      })
    }
  }
}

export const updateMedicamento = async (req, res) => {
  try {
    const [updated] = await Medicamento.update(req.body, {
      where: { id: req.params.id },
    })

    if (updated === 0) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ error: "Medicamento no encontrado" })
      } else {
        return res.render('error', { 
          message: 'Medicamento no encontrado', 
          error: 'El medicamento solicitado no existe' 
        })
      }
    }

    if (req.originalUrl.startsWith('/api/')) {
      const medicamentoActualizado = await Medicamento.findByPk(req.params.id)
      res.status(200).json(medicamentoActualizado)
    } else {
      res.redirect('/medicamentos?updated=true')
    }
  } catch (error) {
    if (req.originalUrl.startsWith('/api/')) {
      res.status(500).json({
        error: "Error al actualizar medicamento",
        details: error.message,
      })
    } else {
      const medicamento = await Medicamento.findByPk(req.params.id)
      res.render('medicamentos/edit', { 
        medicamento: {...medicamento.toJSON(), ...req.body},
        error: "Error al actualizar: " + error.message
      })
    }
  }
}

export const deleteMedicamento = async (req, res) => {
  try {
    const detalles = await DetalleOrdenCompra.findAll({
      where: { CodMedicamento: req.params.id },
    })

    if (detalles.length > 0) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          error: "No se puede eliminar: tiene detalles asociados",
        })
      } else {
        return res.render('error', { 
          message: 'No se puede eliminar', 
          error: 'El medicamento tiene detalles de compra asociados' 
        })
      }
    }

    const deleted = await Medicamento.destroy({
      where: { id: req.params.id },
    })

    if (deleted === 0) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ error: "Medicamento no encontrado" })
      } else {
        return res.render('error', { 
          message: 'Medicamento no encontrado', 
          error: 'El medicamento solicitado no existe' 
        })
      }
    }

    if (req.originalUrl.startsWith('/api/')) {
      res.status(204).end()
    } else {
      res.redirect('/medicamentos?deleted=true')
    }
  } catch (error) {
    if (req.originalUrl.startsWith('/api/')) {
      res.status(500).json({
        error: "Error al eliminar medicamento",
        details: error.message,
      })
    } else {
      res.render('error', { 
        message: 'Error al eliminar medicamento', 
        error: error.message 
      })
    }
  }
}
