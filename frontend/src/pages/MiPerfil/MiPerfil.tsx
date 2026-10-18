import { Center, Container, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import axios from "axios";
import walkerService from "../../services/walkers";
import type { UsuarioData } from "../../types/data";
import PaseadorPerfil from "../PaseadorPerfil/PaseadorPerfil";
import FormularioPerfil from "./FormularioPerfil";

interface MiPerfilProps {
  usuario: UsuarioData | null;
}

const MiPerfil = ({ usuario }: MiPerfilProps) => {
  const [walkerId, setWalkerId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    walkerService
      .getMe()
      .then((data) => {
        setWalkerId(data.id);
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

  if (walkerId) {
    return <PaseadorPerfil id={walkerId} usuario={usuario} />;
  }

  return <FormularioPerfil usuario={usuario} onCreado={setWalkerId} />;
};

export default MiPerfil;
