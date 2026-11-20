/// <reference path="../pb_data/types.d.ts" />

// OJO: cada handler corre aislado y no ve nada de este archivo.
// Lo compartido vive en transiciones.js y se carga con require dentro del handler.

// 1) CREAR: una orden solo puede nacer solicitada y sin presupuesto.
onRecordCreateRequest((e) => {
  const { normalizar } = require(`${__hooks}/transiciones.js`)
  const r = e.record
  const estado = r.getString("estado")
  if (estado !== "" && estado !== "solicitada") {
    throw new BadRequestError("Una orden nueva solo puede nacer en estado 'solicitada'.")
  }
  const piezas = normalizar(r.getString("piezas"))
  const hayPiezas = piezas !== "null" && piezas !== "[]" && piezas !== ""
  if (r.getString("diagnostico") !== "" || r.getFloat("manoObra") !== 0 || hayPiezas) {
    throw new BadRequestError("El presupuesto se registra al presupuestar, no al crear la orden.")
  }
  r.set("estado", "solicitada")
  e.next()
}, "ordenes")

// 2) ACTUALIZAR: valida etapas, estados finales e inmutabilidad del presupuesto,
// y deja el evento del historial cuando cambia la etapa.
onRecordUpdateRequest((e) => {
  const { SIGUIENTE, normalizar } = require(`${__hooks}/transiciones.js`)
  const nueva = e.record
  // Estado guardado en la base de datos (no el de la petición): es la verdad.
  const previa = e.app.findRecordById("ordenes", e.record.id)
  const antes = previa.getString("estado")
  const despues = nueva.getString("estado")

  // Estados finales: la orden no cambia más (ni estado ni ningún otro campo).
  if (!SIGUIENTE[antes]) {
    throw new BadRequestError(`La orden está '${antes}' y no puede cambiar más.`)
  }

  // Solo se puede pasar a la etapa permitida desde la actual.
  if (despues !== antes && !SIGUIENTE[antes].includes(despues)) {
    throw new BadRequestError(`Cambio no permitido: '${antes}' -> '${despues}'.`)
  }

  const presupuestando = antes === "en_diagnostico" && despues === "presupuestada"

  if (presupuestando) {
    // El presupuesto se registra aquí, completo y válido.
    if (nueva.getString("diagnostico").trim() === "") {
      throw new BadRequestError("El diagnóstico es obligatorio para presupuestar.")
    }
    const manoObra = nueva.getFloat("manoObra")
    if (!(manoObra >= 0)) {
      throw new BadRequestError("La mano de obra debe ser un número mayor o igual a 0.")
    }
    let piezas
    try {
      piezas = JSON.parse(nueva.getString("piezas") || "[]")
    } catch (err) {
      throw new BadRequestError("El campo piezas no es un JSON válido.")
    }
    if (piezas === null) piezas = []
    if (!Array.isArray(piezas)) {
      throw new BadRequestError("piezas debe ser una lista.")
    }
    piezas.forEach((p) => {
      const cantidad = p ? Number(p.cantidad) : NaN
      const precio = p ? Number(p.precio) : NaN
      const descripcion = p ? (p.descripcion !== undefined ? p.descripcion : p["descripción"]) : undefined
      const descripcionOk = typeof descripcion === "string" && descripcion.trim() !== ""
      if (!descripcionOk || !Number.isInteger(cantidad) || cantidad < 1 || !(precio >= 0)) {
        throw new BadRequestError(
          "Cada pieza necesita descripcion, cantidad entera >= 1 y precio >= 0."
        )
      }
    })
  } else {
    // En cualquier otro cambio, el presupuesto no se toca.
    const cambio =
      nueva.getString("diagnostico") !== previa.getString("diagnostico") ||
      nueva.getFloat("manoObra") !== previa.getFloat("manoObra") ||
      normalizar(nueva.getString("piezas")) !== normalizar(previa.getString("piezas"))
    if (cambio) {
      throw new BadRequestError("El presupuesto no se puede modificar después de registrarlo.")
    }
  }

  // Guarda el cambio en la base de datos.
  e.next()

  // Historial: un evento por cada cambio de etapa, con la fecha automática.
  if (antes !== despues) {
    try {
      const evento = new Record(e.app.findCollectionByNameOrId("eventos"))
      evento.set("orden", e.record.id)
      evento.set("de", antes)
      evento.set("a", despues)
      e.app.save(evento)
    } catch (err) {
      e.app.logger().error("No se pudo registrar el evento", "orden", e.record.id, "error", String(err))
    }
  }
}, "ordenes")
