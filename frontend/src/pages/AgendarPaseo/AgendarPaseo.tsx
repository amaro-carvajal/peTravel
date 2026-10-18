import { useEffect, useState, type SubmitEvent } from "react";
import { Alert, Button, Center, Container, Group, Loader, NativeSelect, Paper, Stack, Text, Textarea, TextInput, Title } from "@mantine/core";
import { Link, useLocation, useParams } from "react-router-dom";
import bookingService from "../../services/booking";
import { mensajeError } from "../../services/http";
import petService from "../../services/pets";
import walkerService, { type PerfilPaseadorData } from "../../services/walkers";
import type { HorarioOcupado, MascotaData, NuevaReservaData } from "../../types/data";
import { generarHorasDisponibles } from "../../utils/disponibilidad";
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

const DIAS_SEMANA = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const fechaUTC = (fecha: string) => new Date(`${fecha}T00:00:00.000Z`);
const formatoFecha = new Intl.DateTimeFormat("es-CL", {
  weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
});
const formatoMes = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "UTC" });

const AgendarPaseo = () => {
  const { id } = useParams<{ id: string }>();
  const [paseador, setPaseador] = useState<PerfilPaseadorData | null>(null);
  const [ocupacion, setOcupacion] = useState<{ walker: string; fecha: string; horarios: HorarioOcupado[] } | null>(null);
  const [consultandoHorarios, setConsultandoHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState<string | null>(null);
  const hoy = fechaLocalDeHoy();
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(() => fechaLocalDeHoy().slice(0, 7));
  const [proximasOcupaciones, setProximasOcupaciones] = useState<{
    walker: string; desde: string; fechas: Record<string, HorarioOcupado[]>;
  } | null>(null);
  const [errorFechas, setErrorFechas] = useState<string | null>(null);
  const [revisionHorarios, setRevisionHorarios] = useState(0);
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

  useEffect(() => {
    setProximasOcupaciones(null);
    setErrorFechas(null);
    if (!id || !paseador) return;
    let activo = true;
    const fechas = Array.from({ length: 28 }, (_, indice) => {
      const dia = fechaUTC(hoy);
      dia.setUTCDate(dia.getUTCDate() + indice);
      return dia.toISOString().slice(0, 10);
    }).filter((dia) => generarHorasDisponibles(paseador.horarios, dia, 30, []).length > 0);
    Promise.all(fechas.map(async (dia) => [dia, await bookingService.getOccupied(id, dia)] as const))
      .then((resultados) => {
        if (activo) setProximasOcupaciones({ walker: id, desde: hoy, fechas: Object.fromEntries(resultados) });
      })
      .catch((err: unknown) => {
        if (activo) setErrorFechas(mensajeError(err, "No se pudieron consultar las próximas fechas disponibles."));
      });
    return () => { activo = false; };
  }, [id, paseador, hoy, revisionHorarios]);

  useEffect(() => {
    setHoraInicio("");
    setOcupacion(null);
    setErrorHorarios(null);
    if (!id || !fecha || fecha < hoy) return;
    const horariosGuardados = proximasOcupaciones?.walker === id && proximasOcupaciones.desde === hoy
      ? proximasOcupaciones.fechas[fecha]
      : undefined;
    if (horariosGuardados) {
      setOcupacion({ walker: id, fecha, horarios: horariosGuardados });
      setConsultandoHorarios(false);
      return;
    }
    let activo = true;
    setConsultandoHorarios(true);
    bookingService.getOccupied(id, fecha)
      .then((horarios) => {
        if (activo) setOcupacion({ walker: id, fecha, horarios });
      })
      .catch((err: unknown) => {
        if (activo) setErrorHorarios(mensajeError(err, "No se pudieron consultar los horarios disponibles."));
      })
      .finally(() => {
        if (activo) setConsultandoHorarios(false);
      });
    return () => { activo = false; };
  }, [id, fecha, hoy, revisionHorarios, proximasOcupaciones]);

  const minutos = Number(duracion);
  const horariosListos = fecha >= hoy && !consultandoHorarios && ocupacion !== null && ocupacion.walker === id && ocupacion.fecha === fecha;
  const horasDisponibles = horariosListos && paseador && ocupacion
    ? generarHorasDisponibles(paseador.horarios, fecha, minutos, ocupacion.horarios)
    : [];
  const fechasListas = proximasOcupaciones !== null && proximasOcupaciones.walker === id && proximasOcupaciones.desde === hoy;
  const fechasDisponibles = fechasListas && paseador && proximasOcupaciones
    ? Object.entries(proximasOcupaciones.fechas)
      .filter(([dia, ocupados]) => generarHorasDisponibles(paseador.horarios, dia, minutos, ocupados).length > 0)
      .map(([dia]) => dia)
    : [];
  const resumenSemanal = DIAS_SEMANA.map((dia) => ({
    ...dia,
    bloques: [...new Set((paseador?.horarios ?? [])
      .filter((bloque) => bloque.days.includes(dia.value))
      .map((bloque) => `${bloque.startTime}–${bloque.endTime}`))].sort(),
  })).filter((dia) => dia.bloques.length > 0);

  const inicioMes = fechaUTC(`${mesCalendario}-01`);
  const huecosCalendario = (inicioMes.getUTCDay() + 6) % 7;
  const finMes = new Date(Date.UTC(inicioMes.getUTCFullYear(), inicioMes.getUTCMonth() + 1, 0)).getUTCDate();
  const cambiarMes = (desplazamiento: number) => {
    const mes = new Date(Date.UTC(inicioMes.getUTCFullYear(), inicioMes.getUTCMonth() + desplazamiento, 1));
    setMesCalendario(mes.toISOString().slice(0, 7));
  };
  const seleccionarFecha = (dia: string) => {
    if (dia < hoy) return;
    setFecha(dia);
    setHoraInicio("");
  };

  const precioTotal = Math.round(((paseador?.tarifa ?? 0) * minutos) / 60);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!paseador || !mascotaId) {
      setError("Selecciona una mascota para continuar.");
      return;
    }

    if (!horariosListos || !horasDisponibles.includes(horaInicio)) {
      setError("Selecciona una hora disponible para la fecha y duración elegidas.");
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
      setHoraInicio("");
      setRevisionHorarios((revision) => revision + 1);
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

              <NativeSelect
                label="Duración"
                data={DURACIONES}
                value={duracion}
                onChange={(event) => {
                  setDuracion(event.currentTarget.value);
                  setHoraInicio("");
                }}
                required
              />

              <section className={classes.disponibilidad} aria-labelledby="disponibilidad-semanal">
                <Text id="disponibilidad-semanal" size="sm" fw={600}>Disponibilidad semanal del paseador</Text>
                {resumenSemanal.length === 0 ? (
                  <Text size="sm" c="dimmed">Este paseador aún no tiene disponibilidad semanal.</Text>
                ) : resumenSemanal.map((dia) => (
                  <Text key={dia.value} size="sm" c="dimmed">
                    <Text span fw={500} c="#1e3a8a">{dia.label}</Text> · {dia.bloques.join(" · ")}
                  </Text>
                ))}
              </section>

              <section aria-labelledby="proximas-fechas">
                <Text id="proximas-fechas" size="sm" fw={600} mb="xs">Próximas fechas disponibles</Text>
                {!fechasListas && !errorFechas && <Text size="sm" c="dimmed" role="status">Consultando las próximas cuatro semanas…</Text>}
                {fechasListas && fechasDisponibles.length === 0 && (
                  <Text size="sm" c="dimmed">No hay fechas disponibles en las próximas cuatro semanas para esta duración.</Text>
                )}
                <Group gap={6} role="group" aria-label="Fechas disponibles">
                  {fechasDisponibles.map((dia) => (
                    <Button
                      key={dia}
                      type="button"
                      size="compact-sm"
                      variant={fecha === dia ? "filled" : "light"}
                      aria-pressed={fecha === dia}
                      onClick={() => seleccionarFecha(dia)}
                    >
                      {formatoFecha.format(fechaUTC(dia))}
                    </Button>
                  ))}
                </Group>
                {errorFechas && (
                  <Alert color="red" mt="xs">
                    {errorFechas}
                    <Button type="button" variant="subtle" size="compact-xs" onClick={() => setRevisionHorarios((revision) => revision + 1)}>Reintentar</Button>
                  </Alert>
                )}
                <Button
                  type="button"
                  variant="subtle"
                  size="compact-xs"
                  mt="xs"
                  aria-expanded={mostrarCalendario}
                  aria-controls="calendario-fechas"
                  onClick={() => setMostrarCalendario((visible) => !visible)}
                >
                  {mostrarCalendario ? "Ocultar calendario" : "Ver más fechas"}
                </Button>
                {mostrarCalendario && (
                  <div id="calendario-fechas" className={classes.calendario}>
                    <Group justify="space-between" mb="xs">
                      <Button type="button" size="compact-xs" variant="subtle" aria-label="Mes anterior" disabled={mesCalendario <= hoy.slice(0, 7)} onClick={() => cambiarMes(-1)}>←</Button>
                      <Text size="sm" fw={500} aria-live="polite">{formatoMes.format(inicioMes)}</Text>
                      <Button type="button" size="compact-xs" variant="subtle" aria-label="Mes siguiente" onClick={() => cambiarMes(1)}>→</Button>
                    </Group>
                    <div className={classes.diasCalendario} role="group" aria-label="Seleccionar fecha del paseo">
                      {DIAS_SEMANA.map((dia) => <Text key={dia.value} size="xs" c="dimmed" ta="center" aria-label={dia.label}>{dia.label.slice(0, 2)}</Text>)}
                      {Array.from({ length: huecosCalendario }, (_, indice) => <span key={`hueco-${indice}`} />)}
                      {Array.from({ length: finMes }, (_, indice) => {
                        const dia = `${mesCalendario}-${String(indice + 1).padStart(2, "0")}`;
                        const ocupados = fechasListas ? proximasOcupaciones?.fechas[dia] : undefined;
                        const sinHorarios = !paseador || generarHorasDisponibles(paseador.horarios, dia, minutos, ocupados ?? []).length === 0;
                        return (
                          <Button
                            key={dia}
                            type="button"
                            size="compact-xs"
                            variant={fecha === dia ? "filled" : "subtle"}
                            aria-label={formatoFecha.format(fechaUTC(dia))}
                            aria-pressed={fecha === dia}
                            disabled={dia < hoy || sinHorarios}
                            onClick={() => seleccionarFecha(dia)}
                          >
                            {indice + 1}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              <section aria-labelledby="horas-disponibles">
                <Text id="horas-disponibles" size="sm" fw={600} mb="xs">
                  {fecha ? `Horarios para ${formatoFecha.format(fechaUTC(fecha))}` : "Horarios disponibles"}
                </Text>
                {!fecha && <Text size="sm" c="dimmed">Selecciona una fecha para ver los horarios.</Text>}
                {fecha && !horariosListos && !errorHorarios && <Text size="sm" c="dimmed" role="status">Consultando horarios…</Text>}
                <Group gap={6} role="group" aria-label="Horas de inicio disponibles">
                  {horasDisponibles.map((hora) => (
                    <Button
                      key={hora}
                      type="button"
                      size="compact-sm"
                      variant={horaInicio === hora ? "filled" : "light"}
                      aria-pressed={horaInicio === hora}
                      onClick={() => setHoraInicio(hora)}
                    >
                      {hora}
                    </Button>
                  ))}
                </Group>
                {errorHorarios && (
                  <Alert color="red">
                    {errorHorarios}
                    <Button type="button" variant="subtle" onClick={() => setRevisionHorarios((revision) => revision + 1)}>Reintentar</Button>
                  </Alert>
                )}
                {horariosListos && horasDisponibles.length === 0 && (
                  <Text size="sm" c="dimmed">No hay horarios disponibles para esta fecha.</Text>
                )}
              </section>

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

              <Button type="submit" loading={enviando} disabled={!horariosListos || !horasDisponibles.includes(horaInicio)} fullWidth>
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
