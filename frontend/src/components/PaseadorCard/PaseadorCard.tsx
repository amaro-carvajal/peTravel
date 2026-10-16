import { Avatar, Badge, Button, Card, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import type { PaseadorData } from "../../types/data";
import classes from "./PaseadorCard.module.css";

interface PaseadorCardProps {
  paseador: PaseadorData;
}

const PaseadorCard = ({ paseador }: PaseadorCardProps) => (
  <Card className={classes.card}>
    <Group wrap="nowrap">
      <Avatar src={paseador.foto} alt={paseador.nombre} size={50}>
        {paseador.nombre.charAt(0).toUpperCase()}
      </Avatar>
      <div>
        <h3>{paseador.nombre}</h3>
        <small>📍 {paseador.comuna}</small>
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

    <Button fullWidth component={Link} to={`/paseadores/${paseador.id}`}>
      Ver perfil
    </Button>
  </Card>
);

export default PaseadorCard;