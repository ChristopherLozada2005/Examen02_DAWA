import DetalleOrdenCompra from "../models/detalleordencompra.js"
import Medicamento from "../models/medicamento.js"

export const createDetalle = async (req, res) => {
  try {
    const { CodMedicamento, cantidad, precio, ...data } = req.body

    const medicamento = await Medicamento.findByPk(CodMedicamento)
    if (!medicamento) {
      return res.status(404).json({ error: "Medicamento no encontrado" })
    }

    const montouni = cantidad * precio

    const detalle = await DetalleOrdenCompra.create({
      ...data,
      CodMedicamento,
      cantidad,
      precio,
      montouni,
    })

    res.status(201).json(detalle)
  } catch (error) {
    res.status(500).json({
      error: "Error al crear detalle",
      details: error.message,
    })
  }
}

export const getAllDetalles = async (req, res) => {
  try {
    const detalles = await DetalleOrdenCompra.findAll({
      include: Medicamento,
    })

    // Verificar si la solicitud viene de la API o de una vista
    if (req.originalUrl.startsWith("/api/")) {
      res.status(200).json(detalles)
    } else {
      res.render("detalles/index", {
        detalles,
        message: req.query.created
          ? "Detalle creado exitosamente"
          : req.query.updated
            ? "Detalle actualizado exitosamente"
            : req.query.deleted
              ? "Detalle eliminado exitosamente"
              : null,
      })
    }
  } catch (error) {
    if (req.originalUrl.startsWith("/api/")) {
      res.status(500).json({
        error: "Error al obtener los detalles",
        details: error.message,
      })
    } else {
      res.render("error", {
        message: "Error al obtener detalles",
        error: error.message,
      })
    }
  }
}

export const getDetalleById = async (req, res) => {
  try {
    const detalle = await DetalleOrdenCompra.findByPk(req.params.id, {
      include: Medicamento,
    })

    if (!detalle) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(404).json({ error: "Detalle no encontrado" })
      } else {
        return res.render("error", {
          message: "Detalle no encontrado",
          error: "El detalle solicitado no existe",
        })
      }
    }

    if (req.originalUrl.startsWith("/api/")) {
      res.status(200).json(detalle)
    } else {
      res.render("detalles/show", { detalle })
    }
  } catch (error) {
    if (req.originalUrl.startsWith("/api/")) {
      res.status(500).json({
        error: "Error al buscar detalle",
        details: error.message,
      })
    } else {
      res.render("error", {
        message: "Error al buscar detalle",
        error: error.message,
      })
    }
  }
}

export const getDetallesByMedicamento = async (req, res) => {
  try {
    const medicamento = await Medicamento.findByPk(req.params.medicamentoId)

    if (!medicamento) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(404).json({ error: "Medicamento no encontrado" })
      } else {
        return res.render("error", {
          message: "Medicamento no encontrado",
          error: "El medicamento solicitado no existe",
        })
      }
    }

    const detalles = await DetalleOrdenCompra.findAll({
      where: { CodMedicamento: req.params.medicamentoId },
      include: Medicamento,
    })

    if (req.originalUrl.startsWith("/api/")) {
      res.status(200).json(detalles)
    } else {
      res.render("detalles/by-medicamento", {
        detalles,
        medicamento,
      })
    }
  } catch (error) {
    if (req.originalUrl.startsWith("/api/")) {
      res.status(500).json({
        error: "Error al buscar detalles",
        details: error.message,
      })
    } else {
      res.render("error", {
        message: "Error al buscar detalles",
        error: error.message,
      })
    }
  }
}

export const updateDetalle = async (req, res) => {
  try {
    const { cantidad, precio, ...data } = req.body

    // Recalcular montouni si se actualizan cantidad o precio
    const updateData = { ...data }
    if (cantidad !== undefined && precio !== undefined) {
      updateData.cantidad = cantidad
      updateData.precio = precio
      updateData.montouni = cantidad * precio
    } else if (cantidad !== undefined && req.body.precio === undefined) {
      const detalle = await DetalleOrdenCompra.findByPk(req.params.id)
      if (detalle) {
        updateData.cantidad = cantidad
        updateData.montouni = cantidad * detalle.precio
      }
    } else if (precio !== undefined && req.body.cantidad === undefined) {
      const detalle = await DetalleOrdenCompra.findByPk(req.params.id)
      if (detalle) {
        updateData.precio = precio
        updateData.montouni = detalle.cantidad * precio
      }
    }

    const [updated] = await DetalleOrdenCompra.update(updateData, {
      where: { id: req.params.id },
    })

    if (updated === 0) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(404).json({ error: "Detalle no encontrado" })
      } else {
        return res.render("error", {
          message: "Detalle no encontrado",
          error: "El detalle solicitado no existe",
        })
      }
    }

    if (req.originalUrl.startsWith("/api/")) {
      const detalleActualizado = await DetalleOrdenCompra.findByPk(req.params.id)
      res.status(200).json(detalleActualizado)
    } else {
      res.redirect("/detalles?updated=true")
    }
  } catch (error) {
    if (req.originalUrl.startsWith("/api/")) {
      res.status(500).json({
        error: "Error al actualizar detalle",
        details: error.message,
      })
    } else {
      res.render("error", {
        message: "Error al actualizar detalle",
        error: error.message,
      })
    }
  }
}

export const deleteDetalle = async (req, res) => {
  try {
    const deleted = await DetalleOrdenCompra.destroy({
      where: { id: req.params.id },
    })

    if (deleted === 0) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(404).json({ error: "Detalle no encontrado" })
      } else {
        return res.render("error", {
          message: "Detalle no encontrado",
          error: "El detalle solicitado no existe",
        })
      }
    }

    if (req.originalUrl.startsWith("/api/")) {
      res.status(204).end()
    } else {
      res.redirect("/detalles?deleted=true")
    }
  } catch (error) {
    if (req.originalUrl.startsWith("/api/")) {
      res.status(500).json({
        error: "Error al eliminar detalle",
        details: error.message,
      })
    } else {
      res.render("error", {
        message: "Error al eliminar detalle",
        error: error.message,
      })
    }
  }
}

export const getEditDetalle = async (req, res) => {
  try {
    const detalle = await DetalleOrdenCompra.findByPk(req.params.id)

    if (!detalle) {
      return res.render("error", {
        message: "Detalle no encontrado",
        error: "El detalle solicitado no existe",
      })
    }

    const medicamentos = await Medicamento.findAll()

    res.render("detalles/edit", {
      detalle,
      medicamentos,
    })
  } catch (error) {
    res.render("error", {
      message: "Error al buscar detalle",
      error: error.message,
    })
  }
}

export const getCreateDetalle = async (req, res) => {
  try {
    const medicamentos = await Medicamento.findAll()
    res.render("detalles/create", {
      detalle: {},
      medicamentos,
    })
  } catch (error) {
    res.render("error", {
      message: "Error al cargar formulario",
      error: error.message,
    })
  }
}

export const realizarCompra = async (req, res) => {
  try {
    const { CodMedicamento, cantidad } = req.body

    // Verificar que el medicamento existe
    const medicamento = await Medicamento.findByPk(CodMedicamento)
    if (!medicamento) {
      return res.render("compras/realizar", {
        error: "Medicamento no encontrado",
        compra: req.body,
        medicamentos: await Medicamento.findAll(),
      })
    }

    // Verificar stock
    if (medicamento.stock < cantidad) {
      return res.render("compras/realizar", {
        error: "Stock insuficiente",
        compra: req.body,
        medicamentos: await Medicamento.findAll(),
      })
    }

    // Crear número de orden (puedes implementar una lógica más compleja)
    const NroOrdenC = Math.floor(Date.now() / 1000)

    // Crear detalle de compra
    const detalle = await DetalleOrdenCompra.create({
      NroOrdenC,
      CodMedicamento,
      cantidad,
      precio: medicamento.precioVentaUni,
      montouni: cantidad * medicamento.precioVentaUni,
      descripcion: `Compra de ${medicamento.descripcionMed}`,
    })

    // Actualizar stock
    medicamento.stock -= cantidad
    await medicamento.save()

    // Redirigir a confirmación
    res.redirect(`/compras/confirmacion/${detalle.id}`)
  } catch (error) {
    const medicamentos = await Medicamento.findAll()
    res.render("compras/realizar", {
      error: "Error al realizar la compra: " + error.message,
      compra: req.body,
      medicamentos,
    })
  }
}

export const confirmarCompra = async (req, res) => {
  try {
    const detalle = await DetalleOrdenCompra.findByPk(req.params.id, {
      include: Medicamento,
    })

    if (!detalle) {
      return res.render("error", {
        message: "Compra no encontrada",
        error: "La compra solicitada no existe",
      })
    }

    res.render("compras/confirmacion", { detalle })
  } catch (error) {
    res.render("error", {
      message: "Error al confirmar compra",
      error: error.message,
    })
  }
}
