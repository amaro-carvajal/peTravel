import type { PaseadorData } from "../types/data";

interface PaseadorCardProps {
  paseador: PaseadorData;
  onVerPerfil: (paseador: PaseadorData) => void;
}

const PaseadorCard = ({ paseador, onVerPerfil }: PaseadorCardProps) => {
  return (
    <div>
      <h3>{paseador.nombre}</h3>
      <p>Comuna: {paseador.comuna}</p>
      <p>Tarifa: ${paseador.tarifa} por hora</p>
      <p>Calificación: {paseador.calificacion}</p>
      <p>{paseador.descripcion}</p>
      <button type="button" onClick={() => onVerPerfil(paseador)}>
        Ver perfil
      </button>
    </div>
  );
};

export default PaseadorCard;