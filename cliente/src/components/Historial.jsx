import { ETIQUETAS, fecha } from "../lib/estados.js";

export default function Historial({ eventos }) {
  if (eventos.length === 0) return <p className="suave">Aún no hay cambios de etapa.</p>;
  return (
    <ol className="historial">
      {eventos.map((ev) => (
        <li key={ev.id}>
          <span className="historial-texto">
            {ETIQUETAS[ev.de] ?? ev.de} → <strong>{ETIQUETAS[ev.a] ?? ev.a}</strong>
          </span>
          <small>{fecha(ev.created)}</small>
        </li>
      ))}
    </ol>
  );
}
