import { Badge, Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import type { UsuarioData } from "../../types/data";
import classes from "./Navbar.module.css";

interface NavbarProps {
  usuario: UsuarioData | null;
  onLogout: () => void;
}

const Navbar = ({ usuario, onLogout }: NavbarProps) => (
  <nav className={classes.navbar}>
    <Container size={1200}>
      <Group justify="space-between" align="center">
        <Stack gap={4}>
          <Link to="/" className={classes.brandLink}>
            <Title order={1} className={classes.titulo}>
              <span className={classes.paw}>🐾</span>
              pe<span className={classes.travel}>Travel</span>
            </Title>
          </Link>
          <Text className={classes.subtitulo}>
            Encuentra paseadores de confianza para tu mascota
          </Text>
        </Stack>

        {usuario ? (
          <Group gap="sm">
            <Badge className={classes.rolBadge} size="lg">
              {usuario.rol === "owner" ? "Dueño" : "Paseador"}
            </Badge>
            <Text className={classes.userInfo}>{usuario.nombre}</Text>

            {usuario.rol === "owner" && (
              <Button
                component={Link}
                to="/mis-mascotas"
                variant="light"
                color="blue"
                size="sm"
              >
                Mis mascotas
              </Button>
            )}

            <Button
              component={Link}
              to="/mis-paseos"
              variant="subtle"
              color="gray.0"
              size="sm"
            > 
              Mis paseos
            </Button>

            {usuario.rol === "walker" && (
              <Button
                component={Link}
                to="/mi-perfil"
                variant="light"
                color="blue"
                size="sm"
              >
                Ver mi perfil
              </Button>
            )}
            <Button variant="white" color="blue" size="sm" onClick={onLogout}>
              Cerrar sesión
            </Button>
          </Group>
        ) : (
          <Group gap="sm">
            <Button
              component={Link}
              to="/login"
              variant="subtle"
              color="gray.0"
              size="sm"
            >
              Iniciar sesión
            </Button>
            <Button
              component={Link}
              to="/registro"
              variant="filled"
              color="blue"
              size="sm"
            >
              Registrarse
            </Button>
          </Group>
        )}
      </Group>
    </Container>
  </nav>
);

export default Navbar;
