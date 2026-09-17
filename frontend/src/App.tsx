import { useState } from "react";
import { paseadores } from "./data/paseadores";
import PaseadorCard from "./components/PaseadorCard";

const App = () => {
  const [comunaSeleccionada, setComunaSeleccionada] =
    useState<string>("Todas");

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
        />
      ))}
    </div>
  );
};

export default App;