// Todas las peticiones al servidor usan fetch (sin SDK de PocketBase).
export const API = import.meta.env.VITE_PB_URL ?? "http://127.0.0.1:8090";

async function pedir(ruta, opciones = {}) {
  const res = await fetch(`${API}/api/${ruta}`, opciones);
  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const d = await res.json();
      mensaje = d.message || mensaje;
      // PocketBase devuelve el detalle por campo en d.data
      const campos = Object.entries(d.data ?? {}).map(([k, v]) => `${k}: ${v.message}`);
      if (campos.length) mensaje += ` (${campos.join("; ")})`;
    } catch {
      /* la respuesta no era JSON */
    }
    throw new Error(mensaje);
  }
  return res.status === 204 ? null : res.json();
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export const listarOrdenes = (signal) =>
  pedir(
    "collections/ordenes/records?" +
      new URLSearchParams({ expand: "cliente", sort: "-created", perPage: "200" }),
    { signal }
  );

export const obtenerOrden = (id, signal) =>
  pedir(`collections/ordenes/records/${id}?expand=cliente`, { signal });

export const listarEventos = (ordenId, signal) =>
  pedir(
    "collections/eventos/records?" +
      new URLSearchParams({ filter: `orden="${ordenId}"`, sort: "created", perPage: "200" }),
    { signal }
  );

export const listarClientes = (signal) =>
  pedir("collections/clientes/records?" + new URLSearchParams({ sort: "nombre", perPage: "200" }), {
    signal,
  });

export const crearCliente = (datos) =>
  pedir("collections/clientes/records", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  });

// formData porque lleva archivos (fotos)
export const crearOrden = (formData) =>
  pedir("collections/ordenes/records", { method: "POST", body: formData });

export const actualizarOrden = (id, datos) =>
  pedir(`collections/ordenes/records/${id}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  });

export const urlFoto = (orden, nombre) => `${API}/api/files/ordenes/${orden.id}/${nombre}`;
