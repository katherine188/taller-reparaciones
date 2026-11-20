import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import Layout from "./components/Layout.jsx";
import Resumen from "./pages/Resumen.jsx";
import ListaOrdenes from "./pages/ListaOrdenes.jsx";
import NuevaOrden from "./pages/NuevaOrden.jsx";
import DetalleOrden from "./pages/DetalleOrden.jsx";
import NoEncontrada from "./pages/NoEncontrada.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Resumen />} />
          <Route path="ordenes" element={<ListaOrdenes />} />
          <Route path="ordenes/nueva" element={<NuevaOrden />} />
          <Route path="ordenes/:id" element={<DetalleOrden />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
