import { useRef, useState } from "react";
import { calcularTotal, dinero } from "../lib/estados.js";

// Formulario controlado. Las piezas son una lista dinámica: cada una lleva una
// key propia (un contador en useRef) para que React no mezcle filas al borrar.
export default function FormPresupuesto({ onGuardar, enviando }) {
  const siguienteKey = useRef(1);
  const [diagnostico, setDiagnostico] = useState("");
  const [manoObra, setManoObra] = useState("");
  const [piezas, setPiezas] = useState([]);

  const agregarPieza = () =>
    setPiezas((ps) => [
      ...ps,
      { key: siguienteKey.current++, descripcion: "", cantidad: "1", precio: "" },
    ]);

  const cambiarPieza = (key, campo, valor) =>
    setPiezas((ps) => ps.map((p) => (p.key === key ? { ...p, [campo]: valor } : p)));

  const quitarPieza = (key) => setPiezas((ps) => ps.filter((p) => p.key !== key));

  const datos = {
    diagnostico: diagnostico.trim(),
    manoObra: Number(manoObra || 0),
    piezas: piezas.map(({ descripcion, cantidad, precio }) => ({
      descripcion: descripcion.trim(),
      cantidad: Number(cantidad),
      precio: Number(precio),
    })),
  };

  function enviar(e) {
    e.preventDefault();
    onGuardar(datos);
  }

  return (
    <form onSubmit={enviar} className="form panel">
      <h3>Registrar presupuesto</h3>
      <label>
        Diagnóstico
        <textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} required />
      </label>
      <label>
        Mano de obra
        <input type="number" min="0" step="0.01" value={manoObra}
          onChange={(e) => setManoObra(e.target.value)} required />
      </label>

      <h4>Piezas necesarias</h4>
      {piezas.map((p) => (
        <div className="fila-pieza" key={p.key}>
          <input placeholder="Descripción" value={p.descripcion} required
            onChange={(e) => cambiarPieza(p.key, "descripcion", e.target.value)} />
          <input type="number" min="1" step="1" value={p.cantidad} required
            onChange={(e) => cambiarPieza(p.key, "cantidad", e.target.value)} />
          <input type="number" min="0" step="0.01" placeholder="Precio" value={p.precio} required
            onChange={(e) => cambiarPieza(p.key, "precio", e.target.value)} />
          <button type="button" className="btn btn-ghost" onClick={() => quitarPieza(p.key)}>
            Quitar
          </button>
        </div>
      ))}
      <div>
        <button type="button" className="btn btn-ghost" onClick={agregarPieza}>
          + Agregar pieza
        </button>
      </div>

      <p className="total">Total <strong>{dinero(calcularTotal(datos))}</strong></p>
      <button type="submit" className="btn" disabled={enviando}>Guardar presupuesto</button>
    </form>
  );
}
