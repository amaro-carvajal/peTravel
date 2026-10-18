import { useEffect, useState, type SubmitEvent } from "react";
import { Alert, Button, Center, Container, Group, Loader, NativeSelect, Paper, Stack, Text, Textarea, TextInput, Title } from "@mantine/core";
import { Link, useLocation, useParams } from "react-router-dom";
import bookingService from "../../services/booking";
import { mensajeError } from "../../services/http";
import petService from "../../services/pets";
import walkerService from "../../services/walkers";
import type { MascotaData, NuevaReservaData, PaseadorData } from "../../types/data";
import { formatearPrecio } from "../../utils/formato";
import classes from "./AgendarPaseo.module.css";

const DURACIONES = [
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1 hora y 30 minutos" },
  { value: "120", label: "2 horas" },
];

const fechaLocalDeHoy = () => {
  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  return hoy.toISOString().slice(0, 10);
};

const AgendarPaseo = () => {
  const { id } = useParams<{ id: string }>();
  const [paseador, setPaseador] = useState<PaseadorData | null>(null);
  const [mascotas, setMascotas] = useState<MascotaData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [mascotaId, setMascotaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [duracion, setDuracion] = useState("60");
  const [direccionRetiro, setDireccionRetiro] = useState("");
  const [notas, setNotas] = useState("");
  const location = useLocation();
  const origen = (location.state as { from?: string } | null)?.from;
  const rutaVolver = origen || (paseador ? `/paseadores/${paseador.id}` : "/");
  const textoVolver = origen === "/" ? "Volver a paseadores" : "Volver al perfil";

  useEffect(() => {
    if (!id) {
      setError("No se indicó el paseador para esta solicitud.");
      setCargando(false);
      return;
    }

    let activo = true;
    Promise.all([walkerService.getById(id), petService.getAll()])
      .then(([paseadorData, mascotasData]) => {
        if (!activo) return;
        setPaseador(paseadorData);
        setMascotas(mascotasData);
        setMascotaId(mascotasData[0]?.id ?? "");
      })
      .catch((err: unknown) => {
        if (activo) setError(mensajeError(err, "No se pudo cargar la información para agendar."));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id]);

  const minutos = Number(duracion);
  const precioTotal = Math.round(((paseador?.tarifa ?? 0) * minutos) / 60);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!paseador || !mascotaId) {
      setError("Selecciona una mascota para continuar.");
      return;
    }

    if (notas.length > 500) {
      setError("Las notas no pueden superar los 500 caracteres.");
      return;
    }

    setEnviando(true);
    const reserva: NuevaReservaData = {
      mascotaId,
      paseadorId: paseador.id,
      fecha,
      horaInicio,
      duracionMinutos: minutos,
      direccionRetiro: direccionRetiro.trim(),
      notas,
      precioTotal,
    };

    try {
      await bookingService.create(reserva);
      setSolicitudEnviada(true);
    } catch (err: unknown) {
      setError(mensajeError(err, "No se pudo enviar la solicitud de paseo."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Container component="main" size={760} className={classes.wrapper}>
      <Button
        component={Link}
        to={rutaVolver}
        variant="light"
        color="blue"
        radius="xl"
        leftSection="←"
        mb="md"
        className={classes.volver}
      >
        {textoVolver}
      </Button>

      {cargando ? (
        <Center py="xl">
          <Loader color="blue" />
        </Center>
      ) : error && !paseador ? (
        <Alert color="red">{error}</Alert>
      ) : !paseador ? (
        <Alert color="red">No se encontró el paseador seleccionado.</Alert>
      ) : solicitudEnviada ? (
        <Paper className={classes.card}>
          <Alert color="green" title="¡Solicitud enviada correctamente!">
            El paseador recibirá tu solicitud y podrá revisarla en “Mis paseos”.
          </Alert>
          <Button component={Link} to="/mis-paseos" mt="md">
            Ver mis paseos
          </Button>
        </Paper>
      ) : mascotas.length === 0 ? (
        <Paper className={classes.card}>
          <Title order={2} className={classes.titulo}>Agenda un paseo con {paseador.nombre}</Title>
          <Text c="dimmed" mt="xs" mb="lg">
            Para solicitar un paseo, primero registra una mascota en tu cuenta.
          </Text>
          <Button component={Link} to="/mascotas/nueva">
            Registrar mascota
          </Button>
        </Paper>
      ) : (
        <Paper className={classes.card}>
          <Title order={2} className={classes.titulo}>Agenda un paseo con {paseador.nombre}</Title>
          <Text className={classes.subtitulo}>
            Completa los datos de la solicitud. El precio estimado se calcula según la tarifa del paseador.
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {error && <Alert color="red">{error}</Alert>}

              <NativeSelect
                label="Mascota"
                data={mascotas.map((mascota) => ({ value: mascota.id, label: `${mascota.nombre} · ${mascota.raza}` }))}
                value={mascotaId}
                onChange={(event) => setMascotaId(event.currentTarget.value)}
                required
              />

              <Group grow align="flex-start">
                <TextInput
                  label="Fecha del paseo"
                  type="date"
                  min={fechaLocalDeHoy()}
                  value={fecha}
                  onChange={(event) => setFecha(event.currentTarget.value)}
                  required
                />
                <TextInput
                  label="Hora de inicio"
                  type="time"
                  value={horaInicio}
                  onChange={(event) => setHoraInicio(event.currentTarget.value)}
                  required
                />
              </Group>

              <NativeSelect
                label="Duración"
                data={DURACIONES}
                value={duracion}
                onChange={(event) => setDuracion(event.currentTarget.value)}
                required
              />

              <TextInput
                label="Dirección de retiro"
                placeholder="Calle, número y comuna"
                value={direccionRetiro}
                onChange={(event) => setDireccionRetiro(event.currentTarget.value)}
                required
              />

              <Textarea
                label="Notas para el paseador (opcional)"
                placeholder="Indicaciones o cuidados especiales"
                maxLength={500}
                autosize
                minRows={3}
                value={notas}
                onChange={(event) => setNotas(event.currentTarget.value)}
              />

              <Group justify="space-between" className={classes.resumen}>
                <Text fw={600}>Precio estimado</Text>
                <Text fw={700} c="#1e3a8a">{formatearPrecio(precioTotal)}</Text>
              </Group>

              <Button type="submit" loading={enviando} fullWidth>
                Enviar solicitud de paseo
              </Button>
            </Stack>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default AgendarPaseo;
