import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link, useLocation, useNavigate } from "react-router-dom";
import petService from "../../services/pets";
import { mensajeError } from "../../services/http";
import type { MascotaData } from "../../types/data";
import classes from "./MisMascotas.module.css";

const ETIQUETA_TAMANO: Record<MascotaData["tamano"], string> = {
  small: "Pequeño",
  medium: "Mediano",
  large: "Grande",
};

const MisMascotas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState<MascotaData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mascotaRegistrada, setMascotaRegistrada] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { mascotaRegistrada?: string } | null;
    if (!state?.mascotaRegistrada) return;

    setMascotaRegistrada(state.mascotaRegistrada);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    let activo = true;

    petService
      .getAll()
      .then((data) => {
        if (activo) setMascotas(data);
      })
      .catch((err: unknown) => {
        if (activo) setError(mensajeError(err, "No se pudieron cargar tus mascotas."));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <Container component="main" size={1000} className={classes.wrapper}>
      <Paper className={classes.panel}>
        <Group justify="space-between" align="center" className={classes.header}>
          <div>
            <Title order={2} className={classes.titulo}>
              Mis mascotas
            </Title>
            <Text c="dimmed" size="sm">
              Administra los datos de las mascotas de tu cuenta.
            </Text>
          </div>
          <Button component={Link} to="/mascotas/nueva">
            Registrar mascota
          </Button>
        </Group>

        {mascotaRegistrada && (
          <Alert
            color="green"
            title="¡Mascota registrada correctamente!"
            withCloseButton
            onClose={() => setMascotaRegistrada(null)}
            mb="md"
          >
            {mascotaRegistrada} ya está en tu lista de mascotas.
          </Alert>
        )}

        {cargando ? (
          <Center py="xl">
            <Loader color="blue" />
          </Center>
        ) : error ? (
          <Alert color="red">{error}</Alert>
        ) : mascotas.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Aún no tienes mascotas registradas.
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {mascotas.map((mascota) => (
              <Paper key={mascota.id} className={classes.mascotaCard}>
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={4}>
                    <Text className={classes.nombre}>🐾 {mascota.nombre}</Text>
                    <Text size="sm" c="dimmed">
                      {mascota.raza}
                    </Text>
                  </Stack>
                  <Badge variant="light" color="blue">
                    {ETIQUETA_TAMANO[mascota.tamano]}
                  </Badge>
                </Group>
                {mascota.notas && (
                  <Text size="sm" mt="md" className={classes.notas}>
                    {mascota.notas}
                  </Text>
                )}
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Paper>
    </Container>
  );
};

export default MisMascotas;
