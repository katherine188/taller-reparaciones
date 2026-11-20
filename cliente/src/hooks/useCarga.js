import { useEffect, useState } from "react";

// Carga datos del servidor. `clave` cambia cuando hay que volver a pedirlos
// (otro id, o una versión nueva tras una acción). La limpieza aborta la
// petición anterior para que una respuesta vieja no pise a la nueva.
export default function useCarga(cargar, clave) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true });

  useEffect(() => {
    const control = new AbortController();
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    cargar(control.signal)
      .then((datos) => setEstado({ datos, error: null, cargando: false }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setEstado({ datos: null, error: err.message, cargando: false });
        }
      });
    return () => control.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return estado;
}
