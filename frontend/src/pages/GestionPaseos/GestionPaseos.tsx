import { useEffect } from "react";
import { Alert, Avatar, Badge, Button, Center, Container, Group, Loader, Paper, SimpleGrid, Tabs, Text, Title } from "@mantine/core";
import { useAuthStore } from "../../stores/authStore";
import { useBookingsStore } from "../../stores/bookingsStore";
import type { EstadoPaseo, PaseoData } from "../../types/data";
import { formatearDuracion, formatearFecha, formatearPrecio } from "../../utils/formato";
import classes from "./GestionPaseos.module.css";
import { Link } from "react-router-dom";

const ETIQUETA_ESTADO: Record<EstadoPaseo, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

const GestionPaseos = () => {
  const esWalker = useAuthStore((state) => state.usuario?.rol === "walker");
  const paseos = useBookingsStore((state) => state.paseos);
  const cargando = useBookingsStore((state) => state.cargando);
  const error = useBookingsStore((state) => state.error);
  const errorAccion = useBookingsStore((state) =>
    state.errorAccion?.tipo === "actualizar" ? state.errorAccion.mensaje : null);
  const modificando = useBookingsStore((state) => state.accion !== null);
  const cargar = useBookingsStore((state) => state.cargar);
  const cambiarEstado = useBookingsStore((state) => state.cambiarEstado);
  const limpiarErrorAccion = useBookingsStore((state) => state.limpiarErrorAccion);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const solicitudes = paseos
    .filter((p) => p.estado === "pending")
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  const agendados = paseos
    .filter((p) => p.estado === "accepted")
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  const historialFinalizados = paseos
    .filter((p) => p.estado !== "pending" && p.estado !== "accepted")
    .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
  const historialCompleto = [...agendados, ...historialFinalizados];

  return (
    <Container component="main" size={1200} py={36}>
      <Paper component="section" className={classes.panel}>
        <Group justify="space-between" className={classes.header}>
          <Title order={2} className={classes.titulo}>Mis paseos</Title>
          <Group gap="xs">
            {solicitudes.length > 0 && (
              <Badge className={classes.contador}>
                {solicitudes.length} {solicitudes.length === 1 ? "solicitud nueva" : "solicitudes nuevas"}
              </Badge>
            )}
            {agendados.length > 0 && (
              <Badge className={`${classes.estado} ${classes.accepted}`}>
                {agendados.length} {agendados.length === 1 ? "paseo agendado" : "paseos agendados"}
              </Badge>
            )}
          </Group>
        </Group>

        {errorAccion && (
          <Alert color="red" mb="md" withCloseButton onClose={limpiarErrorAccion}>
            {errorAccion}
          </Alert>
        )}

        {cargando ? (
          <Center py="xl">
            <Loader color="blue" />
          </Center>
        ) : error ? (
          <Text ta="center" c="red" py="md">{error}</Text>
        ) : (
          <Tabs defaultValue="solicitudes">
            <Tabs.List mb="lg">
              <Tabs.Tab value="solicitudes">Solicitudes ({solicitudes.length})</Tabs.Tab>
              <Tabs.Tab value="historial">Historial</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="solicitudes">
              {solicitudes.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">No tienes solicitudes pendientes.</Text>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                  {solicitudes.map((p) => (
                    <Paper key={p.id} className={classes.tarjeta}>
                      <Group wrap="nowrap" mb="sm">
                        <Avatar color="blue" size={44}>{p.mascota.charAt(0)}</Avatar>
                        <div>
                          <Text fw={700} c="#1e3a8a">{p.mascota}</Text>
                          <Text size="xs" c="dimmed">{p.raza} · {p.tamano}</Text>
                        </div>
                      </Group>

                      <Text size="sm" className={classes.dato}>📅 {formatearFecha(p.fecha)} · {p.hora}</Text>
                      <Text size="sm" className={classes.dato}>📍 {p.direccion} · {formatearDuracion(p.duracionMin)}</Text>

                      <Group gap="xs" my="sm">
                        <Badge variant="light" color="gray" className={classes.chip}>{formatearPrecio(p.precio)}</Badge>
                        <Badge variant="light" color="gray" className={classes.chip}>{esWalker ? `Dueño/a: ${p.dueno}` : `Paseador: ${p.paseador || "Asignado"}`}</Badge>
                      </Group>

                      {esWalker ? (
                        <Group grow>
                          <Button disabled={modificando} onClick={() => cambiarEstado(p.id, "accepted")}>Aceptar</Button>
                          <Button variant="outline" color="red" disabled={modificando} onClick={() => cambiarEstado(p.id, "rejected")}>
                            Rechazar
                          </Button>
                        </Group>
                      ) : (
                        <Button fullWidth variant="outline" color="red" disabled={modificando} onClick={() => cambiarEstado(p.id, "cancelled")}>
                          Cancelar solicitud
                        </Button>
                      )}
                    </Paper>
                  ))}
                </SimpleGrid>
              )}

              {agendados.length > 0 && (
                <>
                  <Title order={3} className={classes.subtitulo}>
                    Paseos agendados ({agendados.length})
                  </Title>
                  <HistorialLista
                    items={agendados}
                    esWalker={esWalker}
                    onFinalizar={(id) => cambiarEstado(id, "completed")}
                    onCancelar={(id) => cambiarEstado(id, "cancelled")}
                  />
                </>
              )}

              <Title order={3} className={classes.subtitulo}>Historial reciente</Title>
              <HistorialLista items={historialFinalizados.slice(0, 3)} esWalker={esWalker} onFinalizar={(id) => cambiarEstado(id, "completed")} onCancelar={(id) => cambiarEstado(id, "cancelled")} />
            </Tabs.Panel>

            <Tabs.Panel value="historial">
              <HistorialLista items={historialCompleto} esWalker={esWalker} onFinalizar={(id) => cambiarEstado(id, "completed")} onCancelar={(id) => cambiarEstado(id, "cancelled")} />
            </Tabs.Panel>
          </Tabs>
        )}
      </Paper>
    </Container>
  );
};

interface HistorialListaProps {
  items: PaseoData[];
  esWalker: boolean;
  onFinalizar: (id: string) => void;
  onCancelar: (id: string) => void;
}

const HistorialLista = ({ items, esWalker, onFinalizar, onCancelar }: HistorialListaProps) => {
  const modificando = useBookingsStore((state) => state.accion !== null);

  if (items.length === 0) {
    return <Text c="dimmed" size="sm">Aún no hay paseos en el historial.</Text>;
  }
  return (
    <div className={classes.historial}>
      {items.map((p) => (
        <Group key={p.id} className={classes.fila} justify="space-between" align="center" gap="xs" wrap="wrap">
          <Group gap="xs" wrap="wrap" className={classes.filaInfo}>
            <Text fw={600} size="sm" c="#1e3a8a" className={classes.filaMascota}>
              {p.mascota} · {p.raza}
            </Text>
            <Badge className={`${classes.estado} ${classes[p.estado]}`}>
              {ETIQUETA_ESTADO[p.estado]}
            </Badge>
            <Text size="sm" c="dimmed">
              {formatearDuracion(p.duracionMin)} · {formatearPrecio(p.precio)}
            </Text>
          </Group>

          <Group gap="xs" wrap="wrap" className={classes.filaAcciones}>
            {p.estado === "accepted" && esWalker && (
              <Button size="xs" variant="light" disabled={modificando} onClick={() => onFinalizar(p.id)}>
                Marcar como finalizado
              </Button>
            )}

            {p.estado === "accepted" && !esWalker && (
              <Button size="xs" variant="outline" color="red" disabled={modificando} onClick={() => onCancelar(p.id)}>
                Cancelar paseo
              </Button>
            )}

            {p.estado === "completed" && !esWalker && (
              p.resenado ? (
                <Badge variant="light" color="teal" className={classes.estado}>
                  Reseña enviada
                </Badge>
              ) : (
                <Button
                  component={Link}
                  to={`/paseos/${p.id}/resena`}
                  size="xs"
                  variant="light"
                  color="teal"
                >
                  Dejar reseña
                </Button>
              )
            )}

            <Text size="xs" c="dimmed">{formatearFecha(p.fecha)} · {p.hora}</Text>
          </Group>
        </Group>
      ))}
    </div>
  );
};

export default GestionPaseos;