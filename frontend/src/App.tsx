import { useState } from "react";
import { Badge, Container, Group, Paper, Text, Title } from "@mantine/core";
import { paseadores } from "./data/paseadores";
import type { PaseadorData } from "./types/data";
import { PaseadorCard } from "./components/PaseadorCard";
import { PaseadorPerfilModal } from "./components/PaseadorPerfilModal";
import { FiltrosPaseadores, type FiltrosState } from "./components/FiltrosPaseadores";
import { Navbar }  from "./components/Navbar";
import classes from "./App.module.css";

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
    <>
      <Navbar />
      <Container component="main" size={1200} className={classes.main}>
        <FiltrosPaseadores filtros={filtros} onFiltroChange={handleFiltroChange} />

        <Paper component="section" className={classes.panel}>
          <Group justify="space-between" className={classes.header}>
            <Title order={2} className={classes.titulo}>
              Paseadores disponibles
            </Title>
            <Badge className={classes.contador}>{paseadoresAMostrar.length} disponibles</Badge>
          </Group>

          {paseadoresAMostrar.length > 0 ? (
            <div className={classes.grid}>
              {paseadoresAMostrar.map((paseador) => (
                <PaseadorCard
                  key={paseador.id}
                  paseador={paseador}
                  onVerPerfil={setPaseadorSeleccionado}
                />
              ))}
            </div>
          ) : (
            <Text ta="center" c="dimmed">
              No se encontraron paseadores con esos filtros.
            </Text>
          )}
        </Paper>
      </Container>

      <PaseadorPerfilModal
        paseador={paseadorSeleccionado}
        onClose={() => setPaseadorSeleccionado(null)}
      />
    </>
  );
};

export default App;