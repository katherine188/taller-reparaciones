import { ETIQUETAS } from "../lib/estados.js";

export default function EstadoBadge({ estado }) {
  return <span className={`badge e-${estado}`}>{ETIQUETAS[estado] ?? estado}</span>;
}
