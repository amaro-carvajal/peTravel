import { useState, type SyntheticEvent } from "react";
import axios from "axios";
import { Button, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth";
import type { UsuarioData } from "../../types/data";
import classes from "./Login.module.css";

interface LoginProps {
  onLoginSuccess: (usuario: UsuarioData) => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const usuario = await authService.login(email, password);
      onLoginSuccess(usuario);
      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError<{ error: string }>(err)) {
        const mensaje = err.response?.data?.error || "Error al iniciar sesión. Verifica tus datos.";
        setError(mensaje);
      } else {
        setError("Error al iniciar sesión. Verifica tus datos.");
      }
    } finally {
      setCargando(false);
    }
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
            {error && <div className={classes.errorBox}>{error}</div>}

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