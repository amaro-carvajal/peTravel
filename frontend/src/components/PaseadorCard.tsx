import type { PaseadorData } from "../types/data";

interface PaseadorCardProps {
  paseador: PaseadorData;
  onVerPerfil: (paseador: PaseadorData) => void;
}

const PaseadorCard = ({ paseador, onVerPerfil }: PaseadorCardProps) => {
  const inicial = paseador.nombre.charAt(0).toUpperCase();
  return (
    <div className="paseador-card">
      <div className="card-header">
        {paseador.foto ? (
          <img className="card-avatar-img" src={paseador.foto} alt={paseador.nombre} />
        ) : (
          <div className="card-avatar">{inicial}</div>
        )}
        <div className="card-title-group">
          <h3>{paseador.nombre}</h3>
          <p className="card-comuna">📍 {paseador.comuna}</p>
        </div>
      </div>

      <div className="card-badges">
        <span className="badge-light"> ${paseador.tarifa.toLocaleString('es-CL')}/hr</span>
        <span className="badge-light">⭐ {paseador.calificacion}</span>
      </div>

      <p className="card-descripcion">"{paseador.descripcion}"</p>

      <button 
        className="btn-ver-perfil" 
        type="button" 
        onClick={() => onVerPerfil(paseador)}
      >
        Ver perfil
      </button>
    </div>
  );
};

export default PaseadorCard;