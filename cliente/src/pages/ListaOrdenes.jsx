import { useState } from "react";
import { useSearchParams } from "react-router";
import useCarga from "../hooks/useCarga.js";
import { listarOrdenes } from "../lib/api.js";
import { ESTADOS, ETIQUETAS } from "../lib/estados.js";
import FilaOrden from "../components/FilaOrden.jsx";
import { Cargando, ErrorMensaje } from "../components/Mensaje.jsx";

export default function ListaOrdenes() {
  const [params, setParams] = useSearchParams();
  const estado = params.get("estado") ?? "";
  const [busqueda, setBusqueda] = useState("");
  const { datos, error, cargando } = useCarga(listarOrdenes, "lista");

  if (error) return <ErrorMensaje texto={error} />;
  if (cargando && !datos) return <Cargando />;

  const texto = busqueda.trim().toLowerCase();
  const visibles = datos.items.filter((o) => {
    if (estado && o.estado !== estado) return false;
    if (!texto) return true;
    const c = o.expand?.cliente;
    return [o.equipo, c?.nombre, c?.telefono].some((v) => v?.toLowerCase().includes(texto));
  });

  return (
    <>
      <h2 className="titulo-pagina">Órdenes</h2>

      <div className="filtros">
        <label>
          Etapa
          <select
            value={estado}
            onChange={(e) => setParams(e.target.value ? { estado: e.target.value } : {})}
          >
            <option value="">Todas</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>{ETIQUETAS[s]}</option>
            ))}
          </select>
        </label>
        <label>
          Buscar
          <input
            value={busqueda}
            placeholder="Cliente, teléfono o equipo"
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
      </div>

      {visibles.length === 0 ? (
        <p className="suave">No hay órdenes que coincidan.</p>
      ) : (
        <ul className="filas">
          {visibles.map((o) => (
            <FilaOrden key={o.id} orden={o} />
          ))}
        </ul>
      )}
    </>
  );
}
