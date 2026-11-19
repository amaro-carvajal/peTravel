import { Avatar, Badge, Button, Center, Container, Group, List, Loader, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import type { PaseadorData } from "../../types/data";
import { useAuthStore } from "../../stores/authStore";
import classes from "./PaseadorPerfil.module.css";
import { useEffect, useState } from "react";
import walkerService from "../../services/walkers";

const listProps = { listStyleType: "none", spacing: "xs", classNames: { item: classes.caja } } as const;

interface PaseadorPerfilProps {
  id?: string;
  perfil?: PaseadorData;
  onEditar?: () => void;
}

const PaseadorPerfil = ({ id: idProp, perfil, onEditar }: PaseadorPerfilProps = {}) => {
  const rol = useAuthStore((state) => state.usuario?.rol);
  const { id: idParam } = useParams<{ id: string }>();
  const id = idProp ?? idParam;
  const [paseadorCargado, setPaseador] = useState<PaseadorData | null>(null);
  const paseador = perfil ?? paseadorCargado;
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (perfil || !id) return;

    walkerService
      .getById(id)
      .then((data) => {
        setPaseador(data);
        setCargando(false);
      })
      .catch((err: unknown) => {
        console.error("Error al obtener detalle del paseador:", err);
        setError("No se pudo encontrar la información del paseador.");
        setCargando(false);
      });
  }, [id, perfil]);

  return (
    <Container component="main" size={1200} py={36}>
      <Button
        component={Link}
        to="/"
        variant="light"
        color="blue"
        radius="xl"
        leftSection="←"
        mb="md"
        className={classes.volver}
      >
        Volver a paseadores
      </Button>
      {onEditar && (
        <Button onClick={onEditar} mb="md" ml="md">
          Editar perfil
        </Button>
      )}
      {!perfil && cargando ? (
        <Center py="xl">
          <Loader color="blue" />
        </Center>
      ) : error || !paseador ? (
        <Text ta="center" c="dimmed">
          { error || "Paseador no encontrado" }
        </Text>
      ) : (
        <Paper radius={16} className={classes.perfil}>
          <Group component="header" className={classes.header}>
            <Avatar src={paseador.foto} alt={`Foto de ${paseador.nombre}`} size={80} variant="white" color="#0d47a1">
              {paseador.nombre.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Title order={2}>{paseador.nombre}</Title>
              <Group gap="sm">
                <Badge className={classes.badge}>comuna: {paseador.comuna}</Badge>
                <Badge className={classes.badge}>
                  tarifa: ${paseador.tarifa.toLocaleString("es-CL")}/hr
                </Badge>
                <Badge className={classes.badge}>⭐ {paseador.calificacion}</Badge>
              </Group>
            </div>
          </Group>

          <Stack gap="xl" p="xl" className={classes.body}>
            {rol !== "walker" && (
              <Group justify="flex-end">
                <Button component={Link} to={`/paseadores/${paseador.id}/agendar`}
                state={{ from: `/paseadores/${paseador.id}/agendar` }}
                >
                  Agendar paseo
                </Button>
              </Group>
            )}

            <Text className={classes.descripcion}>"{paseador.descripcion}"</Text>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              <section>
                <h3>Disponibilidad</h3>
                <List {...listProps}>
                  {paseador.disponibilidad.map((bloque) => (
                    <List.Item key={bloque}>{bloque}</List.Item>
                  ))}
                </List>
              </section>

              <section>
                <h3>Zonas de cobertura</h3>
                <List {...listProps}>
                  {paseador.zonas.map((zona) => (
                    <List.Item key={zona}>{zona}</List.Item>
                  ))}
                </List>
              </section>

              <section>
                <h3>Contacto Directo</h3>
                <Paper className={`${classes.caja} ${classes.contacto}`}>
                  <p><b>Teléfono:</b> {paseador.contacto.telefono}</p>
                  <p><b>Email:</b> {paseador.contacto.email}</p>
                </Paper>
              </section>
            </SimpleGrid>

            <section>
              <h3>💬 Reseñas de clientes ({paseador.resenas.length})</h3>
              {paseador.resenas.length === 0 ? (
                <Text c="dimmed">Este paseador aún no tiene reseñas.</Text>
              ) : (
                <Stack>
                  {paseador.resenas.map((resena) => (
                    <Paper key={resena.id} className={`${classes.caja} ${classes.resena}`}>
                      <Group justify="space-between">
                        <b>{resena.autor}</b>
                        <b>⭐ {resena.puntaje}/5</b>
                      </Group>
                      <p>{resena.comentario}</p>
                      <small>{resena.fecha}</small>
                    </Paper>
                  ))}
                </Stack>
              )}
            </section>
          </Stack>
        </Paper>
      )}
    </Container>
  );
};

export default PaseadorPerfil;
