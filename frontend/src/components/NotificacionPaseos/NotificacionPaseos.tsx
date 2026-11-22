import { useEffect } from "react";
import { Alert, Button, Container, Group, Stack, Text } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useBookingsStore } from "../../stores/bookingsStore";
import { formatearFecha } from "../../utils/formato";
import classes from "./NotificacionPaseos.module.css";

const NotificacionPaseos = () => {
  const { pathname } = useLocation();
  const usuario = useAuthStore((state) => state.usuario);
  const inicializando = useAuthStore((state) => state.inicializando);
  const paseos = useBookingsStore((state) => state.paseos);
  const cargar = useBookingsStore((state) => state.cargar);
  const notificacionDescartada = useBookingsStore((state) => state.notificacionDescartada);
  const descartarNotificacion = useBookingsStore((state) => state.descartarNotificacion);

  const usuarioId = usuario?.id;

  useEffect(() => {
    if (!inicializando && usuarioId) {
      void cargar();
    }
  }, [inicializando, usuarioId, cargar]);

  if (!usuario || notificacionDescartada || pathname === "/mis-paseos") {
    return null;
  }

  if (usuario.rol === "owner") {
    if (/^\/paseos\/[^/]+\/resena$/.test(pathname)) {
      return null;
    }

    const resenasPendientes = paseos.filter((p) => p.estado === "completed" && !p.resenado);
    if (resenasPendientes.length === 0) {
      return null;
    }

    const [primera] = [...resenasPendientes].sort((a, b) =>
      `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`)
    );

    const titulo =
      resenasPendientes.length === 1
        ? "Tienes una reseña pendiente"
        : "Tienes reseñas pendientes";
    const resumen =
      resenasPendientes.length === 1
        ? "Tienes 1 paseo finalizado pendiente de calificar."
        : `Tienes ${resenasPendientes.length} paseos finalizados pendientes de calificar.`;
    const destino =
      resenasPendientes.length === 1 && primera ? `/paseos/${primera.id}/resena` : "/mis-paseos";

    return (
      <Container size={1200} className={classes.wrapper}>
        <Alert
          variant="light"
          color="teal"
          radius="md"
          role="status"
          withCloseButton
          closeButtonLabel="Cerrar notificación de reseñas"
          onClose={descartarNotificacion}
          title={titulo}
          className={classes.alerta}
        >
          <Group justify="space-between" align="center" gap="md" wrap="wrap">
            <Stack gap={2}>
              <Text size="sm">{resumen}</Text>
              {primera && (
                <Text size="xs" c="dimmed">
                  Paseo: {primera.mascota} · {formatearFecha(primera.fecha)} a las {primera.hora}
                </Text>
              )}
            </Stack>
            <Button component={Link} to={destino} size="xs" color="teal">
              Dejar reseña
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  if (usuario.rol !== "walker") {
    return null;
  }

  const pendientes = paseos.filter((p) => p.estado === "pending");
  const agendados = paseos.filter((p) => p.estado === "accepted");

  if (pendientes.length + agendados.length === 0) {
    return null;
  }

  const textoPendientes =
    pendientes.length === 1 ? "1 solicitud pendiente" : `${pendientes.length} solicitudes pendientes`;
  const textoAgendados =
    agendados.length === 1 ? "1 paseo agendado" : `${agendados.length} paseos agendados`;

  let titulo: string;
  let resumen: string;
  if (pendientes.length > 0 && agendados.length > 0) {
    titulo = "Tienes paseos por gestionar";
    resumen = `Tienes ${textoPendientes} y ${textoAgendados}.`;
  } else if (pendientes.length > 0) {
    titulo =
      pendientes.length === 1
        ? "Tienes una solicitud de paseo pendiente"
        : "Tienes solicitudes de paseo pendientes";
    resumen = `Tienes ${textoPendientes} por responder.`;
  } else {
    titulo = agendados.length === 1 ? "Tienes un paseo agendado" : "Tienes paseos agendados";
    resumen = `Tienes ${textoAgendados} por realizar.`;
  }

  const [proximo] = [...pendientes, ...agendados].sort((a, b) =>
    `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)
  );

  const color = pendientes.length > 0 ? "orange" : "blue";

  return (
    <Container size={1200} className={classes.wrapper}>
      <Alert
        variant="light"
        color={color}
        radius="md"
        role="status"
        withCloseButton
        closeButtonLabel="Cerrar notificación de paseos"
        onClose={descartarNotificacion}
        title={titulo}
        className={classes.alerta}
      >
        <Group justify="space-between" align="center" gap="md" wrap="wrap">
          <Stack gap={2}>
            <Text size="sm">{resumen}</Text>
            {proximo && (
              <Text size="xs" c="dimmed">
                Próximo: {proximo.mascota} · {formatearFecha(proximo.fecha)} a las {proximo.hora} (
                {proximo.estado === "pending" ? "Pendiente" : "Agendado"})
              </Text>
            )}
          </Stack>
          <Button component={Link} to="/mis-paseos" size="xs" color={color}>
            Ver mis paseos
          </Button>
        </Group>
      </Alert>
    </Container>
  );
};

export default NotificacionPaseos;
