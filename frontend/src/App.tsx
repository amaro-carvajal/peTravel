import { useState } from "react";
import { paseadores } from "./data/paseadores";
import type { PaseadorData } from "./types/data";
import PaseadorCard from "./components/PaseadorCard";
import PaseadorPerfilModal from "./components/PaseadorPerfilModal";
import FiltrosPaseadores, { type FiltrosState } from "./components/FiltrosPaseadores";
import Navbar from "./components/Navbar";
import "./App.css";

const App = () => {
  const [filtros, setFiltros] = useState<FiltrosState>({
    busqueda: "",
    comuna: "Todas",
    calificacionMinima: 0,
    tarifaMax: 20000,
  });

  const [paseadorSeleccionado, setPaseadorSeleccionado] = useState<PaseadorData | null>(null);

  const handleFiltroChange = (campo: keyof FiltrosState, valor: string | number) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const paseadoresAMostrar = paseadores.filter((paseador) => {
    const coincideComuna = filtros.comuna === "Todas" || paseador.comuna === filtros.comuna;
    const termino = filtros.busqueda.toLowerCase();
    const coincideTexto =
      paseador.nombre.toLowerCase().includes(termino) ||
      paseador.descripcion.toLowerCase().includes(termino);
    const coincideCalificacion = paseador.calificacion >= filtros.calificacionMinima;
    const coincideTarifa = paseador.tarifa <= filtros.tarifaMax;

    return coincideComuna && coincideTexto && coincideCalificacion && coincideTarifa;
  });

  return (
    <div className="app-layout">
      <Navbar />
      <main className="container">
        <FiltrosPaseadores filtros={filtros} onFiltroChange={handleFiltroChange} />

        <section className="panel-paseadores">
          <div className="panel-header">
            <h2>Paseadores disponibles</h2>
            <span className="badge-contador">
              {paseadoresAMostrar.length} disponibles
            </span>
          </div>

          {paseadoresAMostrar.length > 0 ? (
            <div className="grid">
              {paseadoresAMostrar.map((paseador) => (
                <PaseadorCard
                  key={paseador.id}
                  paseador={paseador}
                  onVerPerfil={setPaseadorSeleccionado}
                />
              ))}
            </div>
          ) : (
            <p className="sin-resultados">
              No se encontraron paseadores con esos filtros.
            </p>
          )}
        </section>
      </main>

      <PaseadorPerfilModal
        paseador={paseadorSeleccionado}
        onClose={() => setPaseadorSeleccionado(null)}
      />
    </div>
  );
};

export default App;