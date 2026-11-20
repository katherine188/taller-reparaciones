/// <reference path="../pb_data/types.d.ts" />
// Datos de prueba: 2 clientes y 3 órdenes (de ambos clientes), en etapas
// distintas y con fechas y horas distintas (también en su historial).
migrate((app) => {
  const col = (nombre) => app.findCollectionByNameOrId(nombre)

  // La fecha automática de "created" se pisa con una fecha fija de ejemplo.
  const fijarFecha = (tabla, id, fecha) => {
    app.db()
      .newQuery(`UPDATE ${tabla} SET created = {:fecha} WHERE id = {:id}`)
      .bind({ fecha, id })
      .execute()
  }

  const crear = (tabla, datos, fecha) => {
    const r = new Record(col(tabla))
    for (const k in datos) r.set(k, datos[k])
    app.save(r)
    if (fecha) fijarFecha(tabla, r.id, fecha)
    return r
  }

  // Cada paso es [estado al que pasa, fecha]; "de" se encadena desde solicitada.
  const historial = (orden, pasos) => {
    let de = "solicitada"
    for (const [a, fecha] of pasos) {
      crear("eventos", { orden: orden.id, de, a }, fecha)
      de = a
    }
  }

  const ana = crear("clientes", { nombre: "Ana Pérez", telefono: "555-0101" })
  const luis = crear("clientes", { nombre: "Luis Gómez", telefono: "555-0202" })

  // 1) solicitada
  crear("ordenes", {
    cliente: ana.id,
    equipo: "Teléfono Samsung Galaxy A54",
    problema: "No enciende después de una caída",
    estado: "solicitada",
  }, "2026-11-19 16:40:00.000Z")

  // 2) presupuestada
  const laptop = crear("ordenes", {
    cliente: luis.id,
    equipo: "Laptop Lenovo IdeaPad 3",
    problema: "La pantalla se rompió y no se ve nada",
    estado: "presupuestada",
    diagnostico: "Panel LCD roto; el resto del equipo funciona con normalidad.",
    manoObra: 40,
    piezas: [{ descripcion: "Pantalla 15.6 pulgadas", cantidad: 1, precio: 85 }],
  }, "2026-11-17 09:15:00.000Z")
  historial(laptop, [
    ["en_diagnostico", "2026-11-17 11:30:00.000Z"],
    ["presupuestada", "2026-11-18 10:05:00.000Z"],
  ])

  // 3) en_reparacion
  const tv = crear("ordenes", {
    cliente: ana.id,
    equipo: "Televisor LG 43 pulgadas",
    problema: "Se ve la imagen pero no hay sonido",
    estado: "en_reparacion",
    diagnostico: "Falla en la placa de audio y condensadores dañados.",
    manoObra: 25,
    piezas: [
      { descripcion: "Placa de audio", cantidad: 1, precio: 30 },
      { descripcion: "Condensador", cantidad: 2, precio: 1.5 },
    ],
  }, "2026-11-16 14:20:00.000Z")
  historial(tv, [
    ["en_diagnostico", "2026-11-16 15:45:00.000Z"],
    ["presupuestada", "2026-11-17 08:50:00.000Z"],
    ["aprobada", "2026-11-17 17:10:00.000Z"],
    ["en_reparacion", "2026-11-18 09:30:00.000Z"],
  ])
}, (app) => {})
