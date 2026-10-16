import { useEffect, useState } from "react";
import { Badge, Center, Container, Group, Loader, Paper, Text, Title } from "@mantine/core";
import type { PaseadorData } from "./types/data";
import walkerService from "./services/walkers";
import { Route, Routes } from "react-router-dom";
import { PaseadorCard } from "./components/PaseadorCard";
import PaseadorPerfil from "./pages/PaseadorPerfil/PaseadorPerfil";
import { FiltrosPaseadores, type FiltrosState } from "./components/FiltrosPaseadores";
import { Navbar }  from "./components/Navbar";
import classes from "./App.module.css";

const App = () => {
  const [paseadores, setPaseadores] = useState<PaseadorData[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosState>({
    busqueda: "",
    comuna: "Todas",
    calificacionMinima: 0,
    tarifaMax: 20000,
  });
  
  useEffect(() => {
    walkerService
      .getAll()
      .then((data) => {
        setPaseadores(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener paseadores:", err);
        setError("No se pudo conectar con el servidor para cargar los paseadores.");
        setCargando(false);
      });
  }, []);

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
      <Routes>
        <Route path="/" element={
          <Container component="main" size={1200} className={classes.main}>
            <FiltrosPaseadores filtros={filtros} onFiltroChange={handleFiltroChange} />

            <Paper component="section" className={classes.panel}>
              <Group justify="space-between" className={classes.header}>
                <Title order={2} className={classes.titulo}>
                  Paseadores disponibles
                </Title>
                <Badge className={classes.contador}>{paseadoresAMostrar.length} disponibles</Badge>
              </Group>

              {cargando ? (
                <Center py="xl">
                  <Loader color="blue" />
                </Center>
              ) : error ? (
                <Text ta="center" c="red" py="md">
                  {error}
                </Text>
              ) : paseadoresAMostrar.length > 0 ? (
                <div className={classes.grid}>
                  {paseadoresAMostrar.map((paseador) => (
                    <PaseadorCard
                      key={paseador.id}
                      paseador={paseador}
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
        } />
        <Route path="/paseadores/:id" element={<PaseadorPerfil />} />
      </Routes>
    </>
  );
};

export default App;
