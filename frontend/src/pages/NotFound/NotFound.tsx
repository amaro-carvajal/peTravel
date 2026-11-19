import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

const NotFound = () => (
  <Container component="main" size="sm" py={36}>
    <Paper withBorder p="xl">
      <Stack align="flex-start">
        <Title order={2}>Página no encontrada</Title>
        <Text c="dimmed">La dirección que ingresaste no corresponde a una página de peTravel.</Text>
        <Button component={Link} to="/" replace>Volver al inicio</Button>
      </Stack>
    </Paper>
  </Container>
);

export default NotFound;
