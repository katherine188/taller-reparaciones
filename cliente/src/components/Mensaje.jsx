export function Cargando() {
  return <p className="aviso">Cargando…</p>;
}

export function ErrorMensaje({ texto }) {
  return <p className="aviso error">{texto}</p>;
}
