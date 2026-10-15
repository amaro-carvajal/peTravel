import { Container, Stack, Text, Title } from "@mantine/core";
import classes from "./Navbar.module.css";

const Navbar = () => (
  <nav className={classes.navbar}>
    <Container size={1200}>
      <Stack gap={8}>
        <Title order={1} className={classes.titulo}>
          <span className={classes.paw}>🐾</span>
          pe<span className={classes.travel}>Travel</span>
        </Title>
        <Text className={classes.subtitulo}>
          Encuentra paseadores de confianza para tu mascota
        </Text>
      </Stack>
    </Container>
  </nav>
);

export default Navbar;