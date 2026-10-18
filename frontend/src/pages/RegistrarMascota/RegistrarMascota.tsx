import { useState, type SubmitEvent } from "react";
import axios from "axios";
import {
  Button,
  Container,
  NativeSelect,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { Link, useSearchParams } from "react-router-dom";
import petService from "../../services/pets";
import type { MascotaData } from "../../types/data";
import classes from "./RegistrarMascota.module.css";

type TamanoMascota = MascotaData["tamano"];

const TAMANOS: { value: TamanoMascota; label: string }[] = [
  { value: "small", label: "Pequeño (ej. Chihuahua, Pug)" },
  { value: "medium", label: "Mediano (ej. Beagle, Border Collie)" },
  { value: "large", label: "Grande (ej. Pastor Alemán, Golden Retriever)" },
];

interface RegistrarMascotaProps {
  onMascotaRegistrada: (mascota: MascotaData) => void;
}

const RegistrarMascota = ({ onMascotaRegistrada }: RegistrarMascotaProps) => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [nombre, setNombre] = useState("");
  const [raza, setRaza] = useState("");
  const [tamano, setTamano] = useState<TamanoMascota>("medium");
  const [notas, setNotas] = useState("");

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

    setCargando(true);

    try {
      const nueva = await petService.create({
        nombre: nombre.trim(),
        raza: raza.trim(),
        tamano,
        notas,
      });

      onMascotaRegistrada(nueva);
    } catch (err: unknown) {
      const mensaje =
        (axios.isAxiosError<{ error: string }>(err) && err.response?.data?.error) ||
        "No se pudo registrar la mascota.";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container size={1200} className={classes.wrapper}>
      <Button
        component={Link}
        to={redirectUrl || "/mis-mascotas"}
        variant="light"
        color="blue"
        radius="xl"
        leftSection="←"
        mb="md"
        className={classes.volver}
      >
        {redirectUrl ? "Volver al agendamiento" : "Volver a mis mascotas"}
      </Button>

      <Paper className={classes.card}>
        <Title order={2} className={classes.titulo}>
          🐶 Registrar a tu mascota
        </Title>
        <Text className={classes.subtitulo}>
          Agrega los datos de tu perro para poder agendar paseos con nuestros paseadores.
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && <div className={classes.errorBox}>{error}</div>}

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
              value={tamano}
              onChange={(e) => setTamano(e.currentTarget.value as TamanoMascota)}
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
              Guardar mascota
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default RegistrarMascota;
