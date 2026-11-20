import { useState } from "react";
import { Link, useParams } from "react-router";
import useCarga from "../hooks/useCarga.js";
import { actualizarOrden, listarEventos, obtenerOrden, urlFoto } from "../lib/api.js";
import { ACCIONES, fecha } from "../lib/estados.js";
import EstadoBadge from "../components/EstadoBadge.jsx";
import Historial from "../components/Historial.jsx";
import Presupuesto from "../components/Presupuesto.jsx";
import FormPresupuesto from "../components/FormPresupuesto.jsx";
import { Cargando, ErrorMensaje } from "../components/Mensaje.jsx";

export default function DetalleOrden() {
  const { id } = useParams();
  // Tras cada acción se sube la versión y se vuelve a pedir TODO al servidor:
  // lo que se ve es siempre lo guardado, no una copia local.
  const [version, setVersion] = useState(0);
  const [errorAccion, setErrorAccion] = useState("");
  const [enviando, setEnviando] = useState(false);

  const orden = useCarga((s) => obtenerOrden(id, s), `${id}-${version}`);
  const eventos = useCarga((s) => listarEventos(id, s), `${id}-${version}`);

  async function cambiarEstado(estado, extra = {}) {
    setEnviando(true);
    setErrorAccion("");
    try {
      await actualizarOrden(id, { estado, ...extra });
      setVersion((v) => v + 1);
    } catch (err) {
      setErrorAccion(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (orden.error) return <ErrorMensaje texto={orden.error} />;
  if (!orden.datos) return <Cargando />;

  const o = orden.datos;
  const acciones = ACCIONES[o.estado] ?? [];
  const tienePresupuesto =
    o.estado !== "solicitada" && o.estado !== "en_diagnostico" && o.estado !== "cancelada";

  return (
    <>
      <Link to="/ordenes" className="volver">← Volver a órdenes</Link>

      <div className="encabezado-orden">
        <h2 className="titulo-pagina">{o.equipo}</h2>
        <EstadoBadge estado={o.estado} />
      </div>

      <div className="detalle">
        <div className="columna">
          <section className="panel">
            <h3>Datos del equipo</h3>
            <p><span className="suave">Cliente</span><br />
              {o.expand?.cliente?.nombre} · {o.expand?.cliente?.telefono}</p>
            <p><span className="suave">Problema</span><br />{o.problema}</p>
            <p><span className="suave">Recibido</span><br />{fecha(o.created)}</p>
            {o.fotos?.length > 0 && (
              <div className="fotos">
                {o.fotos.map((nombre) => (
                  <img key={nombre} src={urlFoto(o, nombre)} alt={`Foto de ${o.equipo}`} />
                ))}
              </div>
            )}
          </section>

          {tienePresupuesto && <Presupuesto orden={o} />}

          {o.estado === "en_diagnostico" && (
            <FormPresupuesto
              enviando={enviando}
              onGuardar={(datos) => cambiarEstado("presupuestada", datos)}
            />
          )}

          {errorAccion && <ErrorMensaje texto={errorAccion} />}

          {acciones.length > 0 && (
            <div className="acciones">
              {acciones.map((ac) => (
                <button
                  key={ac.a}
                  disabled={enviando}
                  className={ac.peligro ? "btn btn-peligro" : "btn"}
                  onClick={() => cambiarEstado(ac.a)}
                >
                  {ac.texto}
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="panel">
          <h3>Historial</h3>
          {eventos.error ? (
            <ErrorMensaje texto={eventos.error} />
          ) : eventos.datos ? (
            <Historial eventos={eventos.datos.items} />
          ) : (
            <Cargando />
          )}
        </aside>
      </div>
    </>
  );
}
