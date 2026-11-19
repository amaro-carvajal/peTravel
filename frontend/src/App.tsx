import { useEffect, useState } from "react";
import { Badge, Button, Center, Container, Group, Loader, Paper, Text, Title } from "@mantine/core";
import type { PaseadorData } from "./types/data";
import walkerService from "./services/walkers";
import { useAuthStore } from "./stores/authStore";
import petService from "./services/pets";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { PaseadorCard } from "./components/PaseadorCard";
import PaseadorPerfil from "./pages/PaseadorPerfil/PaseadorPerfil";
import MiPerfil from "./pages/MiPerfil/MiPerfil";
import MisMascotas from "./pages/MisMascotas/MisMascotas";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import GestionPaseos from "./pages/GestionPaseos/GestionPaseos";
import FormularioResena from "./pages/FormularioResena/FormularioResena";
import AgendarPaseo from "./pages/AgendarPaseo/AgendarPaseo";
import { FiltrosPaseadores, type FiltrosState } from "./components/FiltrosPaseadores";
import RegistrarMascota from "./pages/RegistrarMascota/RegistrarMascota";
import { Navbar } from "./components/Navbar";
import NotFound from "./pages/NotFound/NotFound";
import { GuestRoute, ProtectedRoute } from "./routes/ProtectedRoute";
import { rutasProtegidas } from "./routes/rutasProtegidas";
import classes from "./App.module.css";

const App = () => {
  const location = useLocation();
  const usuario = useAuthStore((state) => state.usuario);
  const autenticando = useAuthStore((state) => state.inicializando);
  const restaurarSesion = useAuthStore((state) => state.restaurarSesion);
  const [cantidadMascotas, setCantidadMascotas] = useState(0);
  const [estadoMascotas, setEstadoMascotas] = useState<"idle" | "loading" | "loaded" | "error">("idle");
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
    void restaurarSesion();
  }, [restaurarSesion]);

  useEffect(() => {
    if (autenticando || location.pathname !== "/") return;

    if (!usuario || usuario.rol !== "owner") {
      setCantidadMascotas(0);
      setEstadoMascotas("idle");
      return;
    }

    let cancelado = false;
    setEstadoMascotas("loading");

    petService
      .getAll()
      .then((mascotas) => {
        if (cancelado) return;
        setCantidadMascotas(mascotas.length);
        setEstadoMascotas("loaded");
      })
      .catch(() => {
        if (cancelado) return;
        setEstadoMascotas("error");
      });

    return () => {
      cancelado = true;
    };
  }, [autenticando, usuario, location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") return;

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
  }, [location.pathname]);

  const handleFiltroChange = (campo: keyof FiltrosState, valor: string | number) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const comunas = [...new Set(paseadores.flatMap((paseador) => paseador.zonas))];

  const paseadoresAMostrar = paseadores.filter((paseador) => {
    const coincideComuna = filtros.comuna === "Todas" || paseador.zonas.includes(filtros.comuna);
    const termino = filtros.busqueda.toLowerCase();
    const coincideTexto =
      paseador.nombre.toLowerCase().includes(termino) ||
      paseador.descripcion.toLowerCase().includes(termino);
    const coincideCalificacion = paseador.calificacion >= filtros.calificacionMinima;
    const coincideTarifa = paseador.tarifa <= filtros.tarifaMax;

    return coincideComuna && coincideTexto && coincideCalificacion && coincideTarifa;
  });

  const paginasProtegidas = [
    { ...rutasProtegidas.agendar, element: <AgendarPaseo /> },
    { ...rutasProtegidas.perfil, element: <MiPerfil /> },
    { ...rutasProtegidas.registrarMascota, element: <RegistrarMascota /> },
    { ...rutasProtegidas.editarMascota, element: <RegistrarMascota /> },
    { ...rutasProtegidas.mascotas, element: <MisMascotas /> },
    { ...rutasProtegidas.paseos, element: <GestionPaseos /> },
    { ...rutasProtegidas.resena, element: <FormularioResena /> },
  ];

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <Container component="main" size={1200} className={classes.main}>
              {!autenticando &&
                (!usuario ||
                  (usuario.rol === "owner" &&
                    estadoMascotas === "loaded" &&
                    cantidadMascotas === 0)) && (
                <Paper className={classes.mascotaBanner}>
                  <Group justify="space-between" align="center">
                    <div>
                      <div className={classes.bannerTitulo}>
                       ¿Buscas un paseo para tu perro?
                      </div>
                      <Text className={classes.bannerTexto}>
                        Registra a tu mascota en tu cuenta para agendar paseos con cualquiera de nuestros paseadores.
                      </Text>
                    </div>
                    <Button
                      component={Link}
                      to={usuario ? "/mascotas/nueva" : "/login"}
                      size="md"
                      color="blue"
                    >
                      Registrar mi mascota
                    </Button>
                  </Group>
                </Paper>
              )}
              <FiltrosPaseadores filtros={filtros} comunas={comunas} onFiltroChange={handleFiltroChange} />

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
                      <PaseadorCard key={paseador.id} paseador={paseador} />
                    ))}
                  </div>
                ) : (
                  <Text ta="center" c="dimmed">
                    No se encontraron paseadores con esos filtros.
                  </Text>
                )}
              </Paper>
            </Container>
          }
        />
        <Route path="/paseadores/:id" element={<PaseadorPerfil />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/registro" element={<GuestRoute><Registro /></GuestRoute>} />
        {paginasProtegidas.map(({ path, roles, element }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute roles={roles}>{element}</ProtectedRoute>}
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
