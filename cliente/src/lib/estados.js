export const ESTADOS = [
  "solicitada", "en_diagnostico", "presupuestada", "aprobada",
  "en_reparacion", "lista", "entregada", "rechazada", "cancelada",
];

// Estados sin salida: la orden ya no cambia.
export const FINALES = ["entregada", "rechazada", "cancelada"];

export const ETIQUETAS = {
  solicitada: "Solicitada",
  en_diagnostico: "En diagnóstico",
  presupuestada: "Presupuestada",
  aprobada: "Aprobada",
  en_reparacion: "En reparación",
  lista: "Lista",
  entregada: "Entregada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

// Acciones que ofrece la interfaz. La garantía real está en el hook del servidor;
// esto solo evita mostrar botones que el servidor rechazaría.
// en_diagnostico no está: se resuelve con el formulario de presupuesto.
export const ACCIONES = {
  solicitada: [
    { a: "en_diagnostico", texto: "Iniciar diagnóstico" },
    { a: "cancelada", texto: "Cancelar orden", peligro: true },
  ],
  presupuestada: [
    { a: "aprobada", texto: "El cliente aprueba" },
    { a: "rechazada", texto: "El cliente rechaza", peligro: true },
  ],
  aprobada: [{ a: "en_reparacion", texto: "Iniciar reparación" }],
  en_reparacion: [{ a: "lista", texto: "Reparación terminada" }],
  lista: [{ a: "entregada", texto: "Entregar equipo" }],
};

// El total se calcula siempre, nunca se guarda.
export function calcularTotal(orden) {
  const piezas = Array.isArray(orden.piezas) ? orden.piezas : [];
  const suma = piezas.reduce((acc, p) => acc + Number(p.cantidad) * Number(p.precio), 0);
  return Number(orden.manoObra || 0) + suma;
}

export const descripcionPieza = (p) => p.descripcion ?? p["descripción"] ?? "";

export const dinero = (n) =>
  Number(n).toLocaleString("es", { style: "currency", currency: "USD" });

export const fecha = (texto) =>
  new Date(texto.replace(" ", "T")).toLocaleString("es", {
    dateStyle: "medium",
    timeStyle: "short",
  });
