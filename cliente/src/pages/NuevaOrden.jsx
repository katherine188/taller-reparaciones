import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import useCarga from "../hooks/useCarga.js";
import { crearCliente, crearOrden, listarClientes } from "../lib/api.js";

export default function NuevaOrden() {
  const navigate = useNavigate();
  const fotosRef = useRef(null); // el input de archivos no se controla con estado
  const clientes = useCarga(listarClientes, "clientes");

  const [clienteId, setClienteId] = useState(""); // "" = cliente nuevo
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [equipo, setEquipo] = useState("");
  const [problema, setProblema] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    const fotos = Array.from(fotosRef.current.files);
    if (fotos.length > 3) {
      setError("Máximo 3 fotos.");
      return;
    }
    setEnviando(true);
    try {
      const idCliente = clienteId || (await crearCliente({ nombre, telefono })).id;
      const form = new FormData();
      form.append("cliente", idCliente);
      form.append("equipo", equipo);
      form.append("problema", problema);
      form.append("estado", "solicitada");
      fotos.forEach((f) => form.append("fotos", f));
      const orden = await crearOrden(form);
      navigate(`/ordenes/${orden.id}`);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <>
      <h2 className="titulo-pagina">Recibir un equipo</h2>
      <form onSubmit={enviar} className="form panel form-ancho">
        <label>
          Cliente
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">— Cliente nuevo —</option>
            {clientes.datos?.items.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} ({c.telefono})</option>
            ))}
          </select>
        </label>

        {clienteId === "" && (
          <>
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label>
              Teléfono
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            </label>
          </>
        )}

        <label>
          Equipo
          <input value={equipo} onChange={(e) => setEquipo(e.target.value)}
            placeholder="Ej.: Laptop HP Pavilion" required />
        </label>
        <label>
          Problema
          <textarea value={problema} onChange={(e) => setProblema(e.target.value)} required />
        </label>
        <label>
          Fotos (hasta 3)
          <input type="file" accept="image/*" multiple ref={fotosRef} />
        </label>

        {error && <p className="aviso error">{error}</p>}
        <button type="submit" className="btn" disabled={enviando}>Registrar equipo</button>
      </form>
    </>
  );
}
