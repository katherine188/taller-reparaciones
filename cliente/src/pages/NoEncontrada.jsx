import { Link } from "react-router";

export default function NoEncontrada() {
  return (
    <section className="hero">
      <p className="sobretitulo">Error 404</p>
      <h2>Esta página no existe</h2>
      <p className="hero-texto">La ruta que buscas no está en el taller.</p>
      <Link to="/" className="btn">Volver al panel</Link>
    </section>
  );
}
