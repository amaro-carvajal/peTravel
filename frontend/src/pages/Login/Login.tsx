import { useEffect, useState, type SyntheticEvent } from "react";
import { Button, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import classes from "./Login.module.css";

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const cargando = useAuthStore((state) => state.cargando);
  const errorSesion = useAuthStore((state) =>
    state.error?.accion === "login" ? state.error.mensaje : null);
  const limpiarError = useAuthStore((state) => state.limpiarError);

  useEffect(() => () => limpiarError("login"), [limpiarError]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <Container size={1200} className={classes.wrapper}>
      <Paper className={classes.card}>
        <Title order={2} className={classes.titulo}>
          Iniciar sesión
        </Title>
        <Text className={classes.subtitulo}>
          Ingresa a tu cuenta de peTravel
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {errorSesion && <div className={classes.errorBox}>{errorSesion}</div>}

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
              placeholder="Tu contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />

            <Button type="submit" fullWidth loading={cargando} mt="sm">
              Ingresar
            </Button>

            <Text ta="center" size="sm" c="dimmed">
              ¿Aún no tienes cuenta?{" "}
              <Link to="/registro" className={classes.link}>
                Regístrate aquí
              </Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;