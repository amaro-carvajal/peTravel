import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { mensajeError } from "../../services/http";
import {
  Alert,
  Button,
  Loader,
  Container,
  NativeSelect,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import petService from "../../services/pets";
import type { MascotaData, NuevaMascotaData } from "../../types/data";
import classes from "./RegistrarMascota.module.css";

type TamanoMascota = MascotaData["tamano"];

const TAMANOS: { value: TamanoMascota; label: string }[] = [
  { value: "small", label: "Pequeño (ej. Chihuahua, Pug)" },
  { value: "medium", label: "Mediano (ej. Beagle, Border Collie)" },
  { value: "large", label: "Grande (ej. Pastor Alemán, Golden Retriever)" },
];

const FormularioMascota = ({ mascota }: { mascota?: MascotaData }) => {
  const navigate = useNavigate();
  const activo = useRef(false);
  const [nombre, setNombre] = useState(mascota?.nombre ?? "");
  const [raza, setRaza] = useState(mascota?.raza ?? "");
  const [notas, setNotas] = useState(mascota?.notas ?? "");

  useEffect(() => {
    activo.current = true;
    return () => { activo.current = false; };
  }, []);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !raza.trim()) {
      setError("El nombre y la raza son obligatorios.");
      return;
    }

    if (notas.length > 500) {
      setError("Las notas no pueden superar los 500 caracteres.");
      return;
    }

    const tamano = new FormData(e.currentTarget).get("tamano");
    if (tamano !== "small" && tamano !== "medium" && tamano !== "large") {
      setError("Selecciona un tamaño válido.");
      return;
    }

    setCargando(true);

    try {
      const datos: NuevaMascotaData = { nombre: nombre.trim(), raza: raza.trim(), tamano, notas };
      const guardada = mascota
        ? await petService.update(mascota.id, datos)
        : await petService.create(datos);

      if (activo.current) {
        navigate("/mis-mascotas", {
          replace: true,
          state: { mensajeMascota: mascota ? `Cambios guardados para ${guardada.nombre}.` : `${guardada.nombre} ya está en tu lista de mascotas.` },
        });
      }
    } catch (err: unknown) {
      setError(mensajeError(err, "No se pudo guardar la mascota."));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Paper className={classes.card}>
      <Title order={2} className={classes.titulo}>
        {mascota ? "Editar mascota" : "🐶 Registrar a tu mascota"}
      </Title>
      <Text className={classes.subtitulo}>
        {mascota ? "Actualiza los datos y cuidados de tu mascota." : "Agrega los datos de tu perro para poder agendar paseos con nuestros paseadores."}
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && <div role="alert" className={classes.errorBox}>{error}</div>}

          <TextInput
            label="Nombre de la mascota"
            placeholder="Ej. Firulais, Luna..."
            required
            value={nombre}
            onChange={(e) => setNombre(e.currentTarget.value)}
          />

          <TextInput
            label="Raza"
            placeholder="Ej. Mestizo, Labrador, Poodle..."
            required
            value={raza}
            onChange={(e) => setRaza(e.currentTarget.value)}
          />

          <NativeSelect
            label="Tamaño"
            data={TAMANOS}
            name="tamano"
            defaultValue={mascota?.tamano ?? "medium"}
          />

          <Textarea
            label="Notas o cuidados especiales (opcional)"
            placeholder="Ej. Es muy tranquilo, usa arnés, le teme a las bicicletas..."
            maxLength={500}
            autosize
            minRows={3}
            value={notas}
            onChange={(e) => setNotas(e.currentTarget.value)}
          />

          <Button type="submit" fullWidth loading={cargando} mt="xs">
            {mascota ? "Guardar cambios" : "Guardar mascota"}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

const EditarMascota = ({ id }: { id: string }) => {
  const [mascota, setMascota] = useState<MascotaData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    petService.getById(id)
      .then((datos) => { if (activo) setMascota(datos); })
      .catch((err: unknown) => {
        if (activo) setError(mensajeError(err, "No se pudo cargar la mascota."));
      });
    return () => { activo = false; };
  }, [id]);

  if (error) return <Alert color="red" role="alert">{error}</Alert>;
  if (!mascota) return <Loader aria-label="Cargando mascota" />;
  return <FormularioMascota mascota={mascota} />;
};

const RegistrarMascota = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const agendamiento = !id && redirect && /^\/paseadores\/[a-f0-9]{24}\/agendar$/i.test(redirect);

  return (
    <Container component="main" size={1200} className={classes.wrapper}>
      <Button
        component={Link}
        to={agendamiento ? redirect : "/mis-mascotas"}
        variant="light"
        color="blue"
        radius="xl"
        leftSection="←"
        mb="md"
        className={classes.volver}
      >
        {agendamiento ? "Volver al agendamiento" : "Volver a mis mascotas"}
      </Button>

      {id ? <EditarMascota key={id} id={id} /> : <FormularioMascota />}
    </Container>
  );
};

export default RegistrarMascota;
