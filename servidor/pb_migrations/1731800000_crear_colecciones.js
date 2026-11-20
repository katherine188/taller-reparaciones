/// <reference path="../pb_data/types.d.ts" />
// Esquema: clientes, ordenes y eventos (nombres exactos del enunciado).
// Regla "" = abierta a todos (no hay autenticación).
// Regla null = bloqueada para toda petición de la API.
migrate((app) => {
  const clientes = new Collection({
    type: "base",
    name: "clientes",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { type: "text", name: "nombre", required: true },
      { type: "text", name: "telefono", required: true },
    ],
  })
  app.save(clientes)

  const ordenes = new Collection({
    type: "base",
    name: "ordenes",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null, // nadie borra órdenes
    fields: [
      {
        type: "relation",
        name: "cliente",
        required: true,
        collectionId: clientes.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      { type: "text", name: "equipo", required: true },
      { type: "text", name: "problema", required: true },
      {
        type: "select",
        name: "estado",
        required: true,
        maxSelect: 1,
        values: [
          "solicitada", "en_diagnostico", "presupuestada", "aprobada",
          "rechazada", "en_reparacion", "lista", "entregada", "cancelada",
        ],
      },
      { type: "text", name: "diagnostico" },
      { type: "number", name: "manoObra", min: 0 },
      { type: "json", name: "piezas", maxSize: 200000 },
      {
        type: "file",
        name: "fotos",
        maxSelect: 3,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      },
      { type: "autodate", name: "created", onCreate: true },
    ],
  })
  app.save(ordenes)

  const eventos = new Collection({
    type: "base",
    name: "eventos",
    listRule: "",
    viewRule: "",
    createRule: null, // los crea el hook de ordenes
    updateRule: null, // nadie edita el historial
    deleteRule: null, // nadie lo borra
    fields: [
      {
        type: "relation",
        name: "orden",
        required: true,
        collectionId: ordenes.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      { type: "text", name: "de" },
      { type: "text", name: "a", required: true },
      { type: "autodate", name: "created", onCreate: true },
    ],
  })
  app.save(eventos)
}, (app) => {
  for (const nombre of ["eventos", "ordenes", "clientes"]) {
    app.delete(app.findCollectionByNameOrId(nombre))
  }
})
