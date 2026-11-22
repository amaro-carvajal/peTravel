import { useEffect, useState, type SubmitEvent } from "react";
import { Alert, Button, Container, NativeSelect, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import type { RolUsuario } from "../../types/data";
import classes from "../Login/Login.module.css";

const ROLES = [
  { value: "owner", label: "Dueño de mascota (Busco paseador)" },
  { value: "walker", label: "Paseador (Ofrezco servicios de paseo)" },
];

const Registro = () => {
  const { search } = useLocation();
  const registro = useAuthStore((state) => state.registro);
  const cargando = useAuthStore((state) => state.cargando);
  const errorSesion = useAuthStore((state) =>
    state.error?.accion === "registro" ? state.error.mensaje : null);
  const limpiarError = useAuthStore((state) => state.limpiarError);

  useEffect(() => () => limpiarError("registro"), [limpiarError]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>("owner");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    limpiarError("registro");

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    await registro(nombre, email, password, rol);
  };

  const mensaje = error ?? errorSesion;

  return (
    <Container size={1200} className={classes.wrapper}>
      <Paper className={classes.card}>
        <Title order={2} className={classes.titulo}>
          Crear cuenta
        </Title>
        <Text className={classes.subtitulo}>
          Únete a la comunidad de peTravel
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {mensaje && <Alert color="red" variant="light" role="alert">{mensaje}</Alert>}

            <TextInput
              label="Nombre completo"
              placeholder="Ej. Camila Rojas"
              required
              value={nombre}
              onChange={(e) => setNombre(e.currentTarget.value)}
            />

            <TextInput
              label="Correo electrónico"
              placeholder="tu@correo.cl"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <PasswordInput
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />

            <NativeSelect
              label="Tipo de cuenta"
              data={ROLES}
              value={rol}
              onChange={(e) => setRol(e.currentTarget.value as RolUsuario)}
            />

            <Button type="submit" fullWidth loading={cargando} mt="sm">
              Registrarme
            </Button>

            <Text ta="center" size="sm" c="dimmed">
              ¿Ya tienes una cuenta?{" "}
              <Link to={{ pathname: "/login", search }} className={classes.link}>
                Inicia sesión
              </Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Registro;