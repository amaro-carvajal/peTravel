import { Button, Container, Group, Menu, Stack, Text, Title } from "@mantine/core";
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
          <Group gap="md" className={classes.accountActions}>
            <Text className={classes.userInfo}>
              {usuario.nombre}
              <span className={classes.userRole}>
                {usuario.rol === "owner" ? " · Dueño" : " · Paseador"}
              </span>
            </Text>

            <Menu shadow="md" width={210} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="subtle"
                  size="sm"
                  rightSection={<span className={classes.chevron} aria-hidden="true">▾</span>}
                  className={classes.menuButton}
                  aria-label="Abrir menú Mi espacio"
                >
                  Mi espacio
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>
                  {usuario.rol === "owner" ? "Cuenta de dueño" : "Cuenta de paseador"}
                </Menu.Label>
                {usuario.rol === "owner" && (
                  <Menu.Item component={Link} to="/mis-mascotas">
                    Mis mascotas
                  </Menu.Item>
                )}
                <Menu.Item component={Link} to="/mis-paseos">
                  Mis paseos
                </Menu.Item>
                {usuario.rol === "walker" && (
                  <Menu.Item component={Link} to="/mi-perfil">
                    Mi perfil
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>

            <Button
              variant="white"
              color="blue"
              size="sm"
              onClick={onLogout}
              className={classes.logoutButton}
            >
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
