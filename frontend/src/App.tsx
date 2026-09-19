import { useState } from "react";
import { paseadores } from "./data/paseadores";
import type { PaseadorData } from "./types/data";
import PaseadorCard from "./components/PaseadorCard";
import PaseadorPerfilModal from "./components/PaseadorPerfilModal";
import "./App.css";
import Navbar from "./components/Navbar";

const App = () => {
  const [comunaSeleccionada, setComunaSeleccionada] =
    useState<string>("Todas");
  const [paseadorSeleccionado, setPaseadorSeleccionado] =
    useState<PaseadorData | null>(null);

  const paseadoresAMostrar =
    comunaSeleccionada === "Todas"
      ? paseadores
      : paseadores.filter(
          (paseador) => paseador.comuna === comunaSeleccionada
        );

  return (
    <div className="app-layout">
      <Navbar />

      <main className="container">
        <div className="filtro">
          <label htmlFor="comuna-filtro">Filtrar por comuna:</label>
          <select
            id="comuna-filtro"
            value={comunaSeleccionada}
            onChange={(event) => setComunaSeleccionada(event.target.value)}
          >
            <option value="Todas">Todas las comunas</option>
            <option value="Providencia">Providencia</option>
            <option value="Ñuñoa">Ñuñoa</option>
            <option value="Quilicura">Quilicura</option>
          </select>
        </div>

        <section className="panel-paseadores">
          <div className="panel-header">
            <h2>Paseadores disponibles</h2>
            <span className="badge-contador">
              {paseadoresAMostrar.length} disponibles
            </span>
          </div>

          <div className="grid">
            {paseadoresAMostrar.map((paseador) => (
              <PaseadorCard
                key={paseador.id}
                paseador={paseador}
                onVerPerfil={setPaseadorSeleccionado}
              />
            ))}
          </div>
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
