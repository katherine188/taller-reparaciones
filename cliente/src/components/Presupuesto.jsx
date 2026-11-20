import { calcularTotal, descripcionPieza, dinero } from "../lib/estados.js";

export default function Presupuesto({ orden }) {
  const piezas = Array.isArray(orden.piezas) ? orden.piezas : [];
  return (
    <section className="panel">
      <h3>Presupuesto</h3>
      <p><span className="suave">Diagnóstico</span><br />{orden.diagnostico}</p>
      <div className="tabla-scroll">
        <table>
          <thead>
            <tr><th>Concepto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Mano de obra</td><td>—</td><td>—</td><td>{dinero(orden.manoObra || 0)}</td>
            </tr>
            {piezas.map((p, i) => (
              <tr key={`${i}-${descripcionPieza(p)}`}>
                <td>{descripcionPieza(p)}</td>
                <td>{p.cantidad}</td>
                <td>{dinero(p.precio)}</td>
                <td>{dinero(p.cantidad * p.precio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="total">Total <strong>{dinero(calcularTotal(orden))}</strong></p>
    </section>
  );
}
