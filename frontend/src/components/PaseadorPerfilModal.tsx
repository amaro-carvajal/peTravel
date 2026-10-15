import { Avatar, Badge, Group, List, Modal, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import type { PaseadorData } from "../types/data";
import classes from "./PaseadorPerfilModal.module.css";

interface PaseadorPerfilModalProps {
  paseador: PaseadorData | null;
  onClose: () => void;
}

const PaseadorPerfilModal = ({ paseador, onClose }: PaseadorPerfilModalProps) => (
  <Modal.Root
    opened={paseador !== null}
    onClose={onClose}
    size={650}
    radius={16}
    padding={0}
    centered
    transitionProps={{ transition: "fade-up", duration: 300, exitDuration: 0 }}
  >
    <Modal.Overlay color="#0f172a" backgroundOpacity={0.6} blur={4} />
    <Modal.Content>
      {paseador && (
        <>
          <header className={classes.header}>
            <Modal.CloseButton className={classes.close} aria-label="Cerrar perfil" />
            <Avatar
              src={paseador.foto}
              alt={`Foto de ${paseador.nombre}`}
              size={80}
              variant="white"
              color="#0d47a1"
            >
              {paseador.nombre.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Modal.Title>{paseador.nombre}</Modal.Title>
              <Group gap="sm">
                <Badge className={classes.badge}>comuna: {paseador.comuna}</Badge>
                <Badge className={classes.badge}>
                  tarifa: ${paseador.tarifa.toLocaleString("es-CL")}/hr
                </Badge>
                <Badge className={classes.badge}>⭐ {paseador.calificacion}</Badge>
              </Group>
            </div>
          </header>

          <Stack gap="xl" className={classes.body}>
            <Text className={classes.descripcion}>"{paseador.descripcion}"</Text>

            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              <section>
                <h3>Disponibilidad</h3>
                <List listStyleType="none" spacing="xs" classNames={{ item: classes.caja }}>
                  {paseador.disponibilidad.map((bloque) => (
                    <List.Item key={bloque}>{bloque}</List.Item>
                  ))}
                </List>
              </section>

              <section>
                <h3>Zonas de cobertura</h3>
                <List listStyleType="none" spacing="xs" classNames={{ item: classes.caja }}>
                  {paseador.zonas.map((zona) => (
                    <List.Item key={zona}>{zona}</List.Item>
                  ))}
                </List>
              </section>
            </SimpleGrid>

            <section>
              <h3>Contacto Directo</h3>
              <Paper className={`${classes.caja} ${classes.contacto}`}>
                <p><b>Teléfono:</b> {paseador.contacto.telefono}</p>
                <p><b>Email:</b> {paseador.contacto.email}</p>
              </Paper>
            </section>

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
                        <b className={classes.puntaje}>⭐ {resena.puntaje}/5</b>
                      </Group>
                      <p>{resena.comentario}</p>
                      <small>{resena.fecha}</small>
                    </Paper>
                  ))}
                </Stack>
              )}
            </section>
          </Stack>
        </>
      )}
    </Modal.Content>
  </Modal.Root>
);

export default PaseadorPerfilModal;