import type { PaseadorData } from "../types/data";

interface PaseadorCardProps {
  paseador: PaseadorData;
}

const PaseadorCard = ({ paseador }: PaseadorCardProps) => {
  return (
    <div>
      <h3>{paseador.nombre}</h3>
      <p>Comuna: {paseador.comuna}</p>
      <p>Tarifa: ${paseador.tarifa} por hora</p>
      <p>Calificación: {paseador.calificacion}</p>
      <p>{paseador.descripcion}</p>
    </div>
  );
};

export default PaseadorCard;