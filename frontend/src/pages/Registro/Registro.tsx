import { useState, type FormEvent } from "react";
import { Button, Container, NativeSelect, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth";
import type { RolUsuario, UsuarioData } from "../../types/data";
import classes from "../Login/Login.module.css";

interface RegistroProps {
  onLoginSuccess: (usuario: UsuarioData) => void;
}

const ROLES = [
  { value: "owner", label: "Dueño de mascota (Busco paseador)" },
  { value: "walker", label: "Paseador (Ofrezco servicios de paseo)" },
];

const Registro = ({ onLoginSuccess }: RegistroProps) => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>("owner");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setCargando(true);

    try {
      await authService.register(nombre, email, password, rol);
      const usuarioLogueado = await authService.login(email, password);
      onLoginSuccess(usuarioLogueado);
      navigate("/");
    } catch (err: any) {
      const mensaje = err.response?.data?.error || "No se pudo completar el registro.";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

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
            {error && <div className={classes.errorBox}>{error}</div>}

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
              <Link to="/login" className={classes.link}>
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