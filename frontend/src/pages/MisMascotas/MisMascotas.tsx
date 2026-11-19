import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Modal,
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
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [mascotaAEliminar, setMascotaAEliminar] = useState<MascotaData | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const state = location.state as { mensajeMascota?: string } | null;
    if (!state?.mensajeMascota) return;

    setMensaje(state.mensajeMascota);
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

  const eliminarMascota = async () => {
    if (!mascotaAEliminar || eliminando) return;

    setEliminando(true);
    setErrorEliminar(null);
    setMensaje(null);
    try {
      await petService.remove(mascotaAEliminar.id);
      setMascotas((actuales) => actuales.filter(({ id }) => id !== mascotaAEliminar.id));
      setMensaje(`${mascotaAEliminar.nombre} se eliminó correctamente.`);
    } catch (err: unknown) {
      setErrorEliminar(mensajeError(err, "No se pudo eliminar la mascota."));
    } finally {
      setEliminando(false);
      setMascotaAEliminar(null);
    }
  };

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

        {mensaje && (
          <Alert color="green" role="status" withCloseButton closeButtonLabel="Cerrar mensaje"
            onClose={() => setMensaje(null)} mb="md">
            {mensaje}
          </Alert>
        )}
        {errorEliminar && <Alert color="red" role="alert" mb="md">{errorEliminar}</Alert>}

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
                <Group mt="md" gap="xs">
                  <Button component={Link} to={`/mascotas/${mascota.id}/editar`}
                    variant="light" size="xs" aria-label={`Editar a ${mascota.nombre}`}>
                    Editar
                  </Button>
                  <Button variant="outline" color="red" size="xs"
                    aria-label={`Eliminar a ${mascota.nombre}`}
                    onClick={() => setMascotaAEliminar(mascota)}>
                    Eliminar
                  </Button>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Paper>

      <Modal
        opened={mascotaAEliminar !== null}
        onClose={() => setMascotaAEliminar(null)}
        title="Eliminar mascota"
        centered
        withCloseButton={false}
        closeOnClickOutside={!eliminando}
        closeOnEscape={!eliminando}
      >
        <Text>¿Quieres eliminar a {mascotaAEliminar?.nombre} de tu lista?</Text>
        <Group justify="flex-end" mt="md">
          <Button data-autofocus variant="default" disabled={eliminando}
            onClick={() => setMascotaAEliminar(null)}>
            Cancelar
          </Button>
          <Button color="red" loading={eliminando} onClick={eliminarMascota}>
            Confirmar eliminación
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default MisMascotas;
