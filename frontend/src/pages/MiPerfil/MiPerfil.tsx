import { Center, Container, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import axios from "axios";
import walkerService, { type PerfilPaseadorData } from "../../services/walkers";
import FormularioPerfil from "./FormularioPerfil";
import PaseadorPerfil from "../PaseadorPerfil/PaseadorPerfil";

const MiPerfil = () => {
  const [perfil, setPerfil] = useState<PerfilPaseadorData | null>(null);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    walkerService
      .getMe()
      .then((data) => {
        setPerfil(data);
        setCargando(false);
      })
      .catch((err: unknown) => {
        if (!axios.isAxiosError(err) || err.response?.status !== 404) {
          console.error("Error al obtener tu perfil de paseador:", err);
          setError("No se pudo cargar tu perfil. Intenta nuevamente.");
        }
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <Center py="xl" mih="60vh">
        <Loader color="blue" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size={1200} py={36}>
        <Text ta="center" c="red">
          {error}
        </Text>
      </Container>
    );
  }

  if (perfil && !editando) {
    return <PaseadorPerfil perfil={perfil} onEditar={() => setEditando(true)} />;
  }

  return (
    <FormularioPerfil
      key={perfil?.id ?? "nuevo"}
      perfil={perfil}
      onGuardado={(guardado) => {
        setPerfil(guardado);
        setEditando(false);
      }}
      onCancelar={perfil ? () => setEditando(false) : undefined}
    />
  );
};

export default MiPerfil;
