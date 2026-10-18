import { useEffect, useState } from "react";
import { Alert, Avatar, Badge, Button, Center, Container, Group, Loader, Paper, SimpleGrid, Tabs, Text, Title } from "@mantine/core";
import bookingService from "../../services/bookings";
import { mensajeError } from "../../services/http";
import type { EstadoPaseo, PaseoData } from "../../types/data";
import { formatearDuracion, formatearFecha, formatearPrecio } from "../../utils/formato";
import classes from "./GestionPaseos.module.css";

const ETIQUETA_ESTADO: Record<EstadoPaseo, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

const GestionPaseos = () => {
  const [paseos, setPaseos] = useState<PaseoData[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  useEffect(() => {
    bookingService
      .getAll()
      .then((data) => {
        setPaseos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener paseos:", err);
        setError(mensajeError(err, "No se pudieron cargar tus paseos."));
        setCargando(false);
      });
  }, []);

  const cambiarEstado = async (id: string, estado: EstadoPaseo) => {
    setErrorAccion(null);
    try {
      const nuevoEstado = await bookingService.updateStatus(id, estado);
      setPaseos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)));
    } catch (err) {
      setErrorAccion(mensajeError(err, "No se pudo actualizar el paseo."));
    }
  };

  const solicitudes = paseos.filter((p) => p.estado === "pending");
  const historial = paseos
    .filter((p) => p.estado !== "pending")
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <Container component="main" size={1200} py={36}>
      <Paper component="section" className={classes.panel}>
        <Group justify="space-between" className={classes.header}>
          <Title order={2} className={classes.titulo}>Mis paseos</Title>
          {solicitudes.length > 0 && (
            <Badge className={classes.contador}>
              {solicitudes.length} {solicitudes.length === 1 ? "solicitud nueva" : "solicitudes nuevas"}
            </Badge>
          )}
        </Group>

        {errorAccion && (
          <Alert color="red" mb="md" withCloseButton onClose={() => setErrorAccion(null)}>
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
                        <Badge variant="light" color="gray" className={classes.chip}>Dueño/a: {p.dueno}</Badge>
                      </Group>

                      <Group grow>
                        <Button onClick={() => cambiarEstado(p.id, "accepted")}>Aceptar</Button>
                        <Button variant="outline" color="red" onClick={() => cambiarEstado(p.id, "rejected")}>
                          Rechazar
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>
              )}

              <Title order={3} className={classes.subtitulo}>Historial reciente</Title>
              <HistorialLista items={historial.slice(0, 3)} onFinalizar={(id) => cambiarEstado(id, "completed")} />
            </Tabs.Panel>

            <Tabs.Panel value="historial">
              <HistorialLista items={historial} onFinalizar={(id) => cambiarEstado(id, "completed")} />
            </Tabs.Panel>
          </Tabs>
        )}
      </Paper>
    </Container>
  );
};

interface HistorialListaProps {
  items: PaseoData[];
  onFinalizar: (id: string) => void;
}

const HistorialLista = ({ items, onFinalizar }: HistorialListaProps) => {
  if (items.length === 0) {
    return <Text c="dimmed" size="sm">Aún no hay paseos en el historial.</Text>;
  }
  return (
    <div className={classes.historial}>
      {items.map((p) => (
        <Group key={p.id} className={classes.fila} wrap="nowrap">
          <Text fw={600} size="sm" c="#1e3a8a" w={140}>{p.mascota} · {p.raza}</Text>
          <Badge className={`${classes.estado} ${classes[p.estado]}`}>
            {ETIQUETA_ESTADO[p.estado]}
          </Badge>
          <Text size="sm" c="dimmed" style={{ flex: 1 }}>
            {formatearDuracion(p.duracionMin)} · {formatearPrecio(p.precio)}
          </Text>
          {p.estado === "accepted" && (
            <Button size="xs" variant="light" onClick={() => onFinalizar(p.id)}>
              Marcar como finalizado
            </Button>
          )}
          <Text size="xs" c="dimmed">{formatearFecha(p.fecha)}</Text>
        </Group>
      ))}
    </div>
  );
};

export default GestionPaseos;