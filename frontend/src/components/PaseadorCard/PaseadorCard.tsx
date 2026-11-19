import { Avatar, Badge, Button, Card, Group, Stack } from "@mantine/core";
import { Link } from "react-router-dom";
import type { PaseadorData } from "../../types/data";
import { useAuthStore } from "../../stores/authStore";
import classes from "./PaseadorCard.module.css";

interface PaseadorCardProps {
  paseador: PaseadorData;
}

const PaseadorCard = ({ paseador }: PaseadorCardProps) => {
  const rol = useAuthStore((state) => state.usuario?.rol);

  return (
    <Card className={classes.card}>
      <Group wrap="nowrap">
        <Avatar src={paseador.foto} alt={paseador.nombre} size={50}>
          {paseador.nombre.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <h3>{paseador.nombre}</h3>
          <small>📍 {paseador.zonas.join(", ") || "Sin comuna"}</small>
        </div>
      </Group>

      <Group gap="xs" className={classes.badges}>
        <Badge variant="light" color="gray" size="lg">
          ${paseador.tarifa.toLocaleString("es-CL")}/hr
        </Badge>
        <Badge variant="light" color="gray" size="lg">
          ⭐ {paseador.calificacion}
        </Badge>
      </Group>

      <p>"{paseador.descripcion}"</p>

      <Stack gap="xs">
        <Button
          fullWidth
          component={Link}
          to={`/paseadores/${paseador.id}`}
          variant="outline"
          color="dark"
          className={classes.verPerfil}
        >
          Ver perfil
        </Button>
        {rol !== "walker" && (
          <Button
            fullWidth
            component={Link}
            to={`/paseadores/${paseador.id}/agendar`}
            state={{ from: "/" }}
            className={classes.agendar}
          >
            Agendar paseo
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default PaseadorCard;
