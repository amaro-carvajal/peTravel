import { useEffect, useState } from "react";
import { Alert, Avatar, Badge, Button, Center, Container, Group, Loader, Paper, Rating, Stack, Text, Textarea } from "@mantine/core";
import { Link, useNavigate, useParams } from "react-router-dom";
import bookingService from "../../services/bookings";
import reviewService from "../../services/reviews";
import { mensajeError } from "../../services/http";
import type { PaseoData } from "../../types/data";
import { formatearDuracion, formatearFecha } from "../../utils/formato";
import classes from "./FormularioResena.module.css";

const MAX_COMENTARIO = 500; // mismo límite que el modelo Review del backend

const FormularioResena = () => {
  const { id } = useParams<{ id: string }>(); // id de la reserva (booking)
  const navigate = useNavigate();

  const [paseo, setPaseo] = useState<PaseoData | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [puntaje, setPuntaje] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");
  const [enviando, setEnviando] = useState<boolean>(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    bookingService
      .getById(id)
      .then((data) => {
        setPaseo(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener el paseo:", err);
        setError(mensajeError(err, "No se pudo cargar el paseo."));
        setCargando(false);
      });
  }, [id]);

  if (cargando) {
    return (
      <Container component="main" size={560} py={36}>
        <Center py="xl"><Loader color="blue" /></Center>
      </Container>
    );
  }

  if (error || !paseo || paseo.estado !== "completed") {
    return (
      <Container component="main" size={560} py={36}>
        <Text ta="center" c="dimmed" mb="md">
          {error ?? "Este paseo no existe o aún no ha finalizado."}
        </Text>
        <Button component={Link} to="/" variant="subtle" fullWidth>
          Volver al inicio
        </Button>
      </Container>
    );
  }

  const puedeEnviar = puntaje > 0 && comentario.trim().length > 0 && !enviando;

  const handleSubmit = async () => {
    if (!puedeEnviar) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      await reviewService.create({ booking: paseo.id, rating: puntaje, comment: comentario.trim() });
      setEnviado(true);
    } catch (err) {
      setErrorEnvio(mensajeError(err, "No se pudo enviar la reseña."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Container component="main" size={560} py={36}>
      <Paper className={classes.tarjeta}>
        <Group component="header" wrap="nowrap" className={classes.header}>
          <Avatar size={64} color="blue" bg="white" c="#1e3a8a" fw={700}>
            {paseo.paseador.charAt(0)}
          </Avatar>
          <div>
            <Text className={classes.nombre}>{paseo.paseador}</Text>
            <Group gap="xs" mt={6}>
              <Badge className={classes.badge}>Paseo finalizado</Badge>
              <Badge className={classes.badge}>{formatearFecha(paseo.fecha)} · {paseo.hora}</Badge>
              <Badge className={classes.badge}>{paseo.mascota} · {formatearDuracion(paseo.duracionMin)}</Badge>
            </Group>
          </div>
        </Group>

        <Stack p="xl" gap="lg">
          {enviado ? (
            <>
              <Alert color="green" title="¡Gracias por tu reseña!">
                Tu opinión ayuda a otros dueños a elegir paseadores de confianza.
              </Alert>
              <Button onClick={() => navigate("/")}>Volver al inicio</Button>
            </>
          ) : (
            <>
              <Stack gap={6} align="center">
                <Text fw={700} size="sm">¿Cómo estuvo el paseo?</Text>
                <Rating value={puntaje} onChange={setPuntaje} size="xl" color="orange" />
                <Text size="xs" c="dimmed">
                  {puntaje === 0
                    ? "Toca una estrella para calificar"
                    : `Toca una estrella para calificar (${puntaje} de 5)`}
                </Text>
              </Stack>

              <Textarea
                label="Cuéntanos tu experiencia"
                placeholder="¿Fue puntual? ¿Cómo volvió tu mascota?"
                value={comentario}
                onChange={(e) => setComentario(e.currentTarget.value)}
                maxLength={MAX_COMENTARIO}
                minRows={3}
                autosize
              />

              {errorEnvio && <Alert color="red">{errorEnvio}</Alert>}

              <Group justify="flex-end">
                <Button component={Link} to="/mis-paseos" variant="outline">Cancelar</Button>
                <Button onClick={handleSubmit} disabled={!puedeEnviar} loading={enviando}>
                  Enviar reseña
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default FormularioResena;