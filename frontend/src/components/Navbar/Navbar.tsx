import { Button, Container, Group, Menu, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import classes from "./Navbar.module.css";

const Navbar = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const cargando = useAuthStore((state) => state.cargando);
  const error = useAuthStore((state) =>
    state.error?.accion === "logout" || state.error?.accion === "restaurar" ? state.error.mensaje : null);

  return (
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
                onClick={logout}
                loading={cargando}
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
        {error && <Text role="alert" size="sm" c="white" ta="right">{error}</Text>}
      </Container>
    </nav>
  );
};

export default Navbar;
