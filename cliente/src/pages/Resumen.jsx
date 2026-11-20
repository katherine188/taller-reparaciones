import { Link } from "react-router";
import useCarga from "../hooks/useCarga.js";
import { listarOrdenes } from "../lib/api.js";
import { ESTADOS, ETIQUETAS, FINALES } from "../lib/estados.js";
import FilaOrden from "../components/FilaOrden.jsx";
import { Cargando, ErrorMensaje } from "../components/Mensaje.jsx";

export default function Resumen() {
  const { datos, error, cargando } = useCarga(listarOrdenes, "resumen");

  if (error) return <ErrorMensaje texto={error} />;
  if (cargando && !datos) return <Cargando />;

  const ordenes = datos.items;
  const porEstado = Object.fromEntries(ESTADOS.map((e) => [e, 0]));
  for (const o of ordenes) porEstado[o.estado] += 1;
  const pendientes = ordenes.filter((o) => !FINALES.includes(o.estado));

  return (
    <>
      <section className="hero">
        <p className="sobretitulo">Panel del taller</p>
        <h2>Cada equipo, en su punto exacto del proceso</h2>
        <p className="hero-texto">
          {pendientes.length} trabajos en curso · {ordenes.length} órdenes registradas
        </p>
        <Link to="/ordenes/nueva" className="btn">Recibir un equipo</Link>
      </section>

      <h3 className="titulo-seccion">Trabajo por etapa</h3>
      <div className="tarjetas">
        {ESTADOS.map((estado) => (
          <Link key={estado} to={`/ordenes?estado=${estado}`} className={`tarjeta e-${estado}`}>
            <span className="numero">{porEstado[estado]}</span>
            <span>{ETIQUETAS[estado]}</span>
          </Link>
        ))}
      </div>

      <h3 className="titulo-seccion">Trabajo pendiente</h3>
      {pendientes.length === 0 ? (
        <p className="suave">No hay trabajos pendientes.</p>
      ) : (
        <ul className="filas">
          {pendientes.map((o) => (
            <FilaOrden key={o.id} orden={o} />
          ))}
        </ul>
      )}
    </>
  );
}
