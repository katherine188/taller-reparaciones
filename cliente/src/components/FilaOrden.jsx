import { Link } from "react-router";
import { fecha } from "../lib/estados.js";
import EstadoBadge from "./EstadoBadge.jsx";

export default function FilaOrden({ orden }) {
  const cliente = orden.expand?.cliente;
  return (
    <li>
      <Link to={`/ordenes/${orden.id}`} className="fila">
        <div className="fila-principal">
          <strong>{orden.equipo}</strong>
          <span>{cliente?.nombre} · {cliente?.telefono}</span>
        </div>
        <div className="fila-meta">
          <EstadoBadge estado={orden.estado} />
          <small>{fecha(orden.created)}</small>
        </div>
      </Link>
    </li>
  );
}
