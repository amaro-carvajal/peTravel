import { Avatar, Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import type { PaseadorData } from "../types/data";
import classes from "./PaseadorCard.module.css";

interface PaseadorCardProps {
  paseador: PaseadorData;
  onVerPerfil: (paseador: PaseadorData) => void;
}

const PaseadorCard = ({ paseador, onVerPerfil }: PaseadorCardProps) => {
  const inicial = paseador.nombre.charAt(0).toUpperCase();

  return (
    <Card padding="md" radius={12} className={classes.card}>
      <Stack gap="md" h="100%">
        <Group wrap="nowrap">
          <Avatar
            src={paseador.foto}
            alt={paseador.nombre}
            size={50}
            color="blue"
            bd="2px solid #bfdbfe"
          >
            {inicial}
          </Avatar>
          <div>
            <Title order={3} fz="lg" c="#1e3a8a">
              {paseador.nombre}
            </Title>
            <Text size="sm" c="dimmed">
              📍 {paseador.comuna}
            </Text>
          </div>
        </Group>

        <Group gap="xs">
          <Badge variant="light" color="gray" size="lg" tt="none">
            ${paseador.tarifa.toLocaleString("es-CL")}/hr
          </Badge>
          <Badge variant="light" color="gray" size="lg" tt="none">
            ⭐ {paseador.calificacion}
          </Badge>
        </Group>

        <Text size="sm" c="slate.7" fs="italic" flex={1}>
          "{paseador.descripcion}"
        </Text>

        <Button fullWidth color="#1455b5" radius={4} onClick={() => onVerPerfil(paseador)}>
          Ver perfil
        </Button>
      </Stack>
    </Card>
  );
};

export default PaseadorCard;