// Módulo compartido por los hooks. Se carga con require() DENTRO de cada handler,
// porque los handlers de PocketBase corren aislados y no ven variables ni
// funciones definidas fuera de ellos.

// Normaliza un valor JSON para poder comparar "lo mismo" aunque cambie el formato.
function normalizar(texto) {
  try {
    return JSON.stringify(JSON.parse(texto || "null"))
  } catch (err) {
    return texto
  }
}

module.exports = {
  normalizar,
  // Estado actual -> estados a los que se puede pasar. Lo que no está aquí no existe.
  // entregada, rechazada y cancelada no tienen salida: no cambian más.
  SIGUIENTE: {
    solicitada: ["en_diagnostico", "cancelada"],
    en_diagnostico: ["presupuestada"],
    presupuestada: ["aprobada", "rechazada"],
    aprobada: ["en_reparacion"],
    en_reparacion: ["lista"],
    lista: ["entregada"],
  },
}
