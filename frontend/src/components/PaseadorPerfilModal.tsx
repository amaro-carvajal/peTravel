import type { PaseadorData } from "../types/data";
import "./PaseadorPerfilModal.css";

interface PaseadorPerfilModalProps {
  paseador: PaseadorData | null;
  onClose: () => void;
}

const PaseadorPerfilModal = ({
  paseador,
  onClose,
}: PaseadorPerfilModalProps) => {
  if (!paseador) return null;

  const inicial = paseador.nombre.charAt(0).toUpperCase();

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="modal-contenido"
        role="dialog"
        aria-modal="true"
        aria-label={`Perfil de ${paseador.nombre}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-cerrar"
          onClick={onClose}
          aria-label="Cerrar perfil"
          type="button"
          autoFocus
        >
          ✕
        </button>

        <header className="modal-header">
          {paseador.foto ? (
            <img
              className="modal-foto"
              src={paseador.foto}
              alt={`Foto de ${paseador.nombre}`}
            />
          ) : (
            <div className="modal-avatar" aria-hidden="true">
              {inicial}
            </div>
          )}
          <div className="modal-header-info">
            <h2>{paseador.nombre}</h2>
            <div className="modal-badges">
              <span className="badge">comuna: {paseador.comuna}</span>
              <span className="badge">tarifa: ${paseador.tarifa.toLocaleString('es-CL')}/hr</span>
              <span className="badge">⭐ {paseador.calificacion}</span>
            </div>
          </div>
        </header>

        <div className="modal-body">
          <p className="modal-descripcion">"{paseador.descripcion}"</p>

          <div className="modal-grid-info">
            <section>
              <h3> Disponibilidad</h3>
              <ul>
                {paseador.disponibilidad.map((bloque) => (
                  <li key={bloque}>{bloque}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3> Zonas de cobertura</h3>
              <ul>
                {paseador.zonas.map((zona) => (
                  <li key={zona}>{zona}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="modal-contacto">
            <h3> Contacto Directo</h3>
            <div className="contacto-box">
              <p><strong>Teléfono:</strong> {paseador.contacto.telefono}</p>
              <p><strong>Email:</strong> {paseador.contacto.email}</p>
            </div>
          </section>

          <section>
            <h3>💬 Reseñas de clientes ({paseador.resenas.length})</h3>
            {paseador.resenas.length === 0 ? (
              <p className="sin-resenas">Este paseador aún no tiene reseñas.</p>
            ) : (
              <div className="modal-resenas">
                {paseador.resenas.map((resena) => (
                  <div key={resena.id} className="resena-card">
                    <div className="resena-header">
                      <span>{resena.autor}</span>
                      <span className="resena-puntaje">⭐ {resena.puntaje}/5</span>
                    </div>
                    <p className="resena-comentario">{resena.comentario}</p>
                    <small className="resena-fecha">{resena.fecha}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PaseadorPerfilModal;