import { useState } from "react";
import { paseadores } from "./data/paseadores";
import type { PaseadorData } from "./types/data";
import PaseadorCard from "./components/PaseadorCard";
import PaseadorPerfilModal from "./components/PaseadorPerfilModal";

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
    <div>
      <h1>peTravel</h1>

      <label>
        Filtrar por comuna:{" "}
        <select
          value={comunaSeleccionada}
          onChange={(event) => setComunaSeleccionada(event.target.value)}
        >
          <option value="Todas">Todas</option>
          <option value="Providencia">Providencia</option>
          <option value="Ñuñoa">Ñuñoa</option>
          <option value="Quilicura">Quilicura</option>
        </select>
      </label>

      <h2>Paseadores disponibles</h2>

      {paseadoresAMostrar.map((paseador) => (
        <PaseadorCard
          key={paseador.id}
          paseador={paseador}
          onVerPerfil={setPaseadorSeleccionado}
        />
      ))}

      <PaseadorPerfilModal
        paseador={paseadorSeleccionado}
        onClose={() => setPaseadorSeleccionado(null)}
      />
    </div>
  );
};

export default App;
