import { useEffect } from "react";
import type { PaseadorData } from "../types/data";
import "./PaseadorPerfilModal.css";

interface PaseadorPerfilModalProps {
  paseador: PaseadorData | null;
  onClose: () => void;
}

const PaseadorPerfilModal = ({ paseador, onClose }: PaseadorPerfilModalProps) => {
  useEffect(() => {
    if (!paseador) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [paseador, onClose]);

  if (!paseador) return null;

  const inicial = paseador.nombre.charAt(0).toUpperCase();

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
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
          <div>
            <h2>{paseador.nombre}</h2>
            <p>Comuna base: {paseador.comuna}</p>
            <p>Tarifa: ${paseador.tarifa} por hora</p>
            <p>Calificación: {paseador.calificacion} / 5</p>
          </div>
        </header>

        <p className="modal-descripcion">{paseador.descripcion}</p>

        <section>
          <h3>Disponibilidad horaria</h3>
          <ul>
            {paseador.disponibilidad.map((bloque) => (
              <li key={bloque}>{bloque}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Zonas de cobertura</h3>
          <ul>
            {paseador.zonas.map((zona) => (
              <li key={zona}>{zona}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Contacto</h3>
          <p>Teléfono: {paseador.contacto.telefono}</p>
          <p>Email: {paseador.contacto.email}</p>
        </section>

        <section>
          <h3>Reseñas de clientes ({paseador.resenas.length})</h3>
          {paseador.resenas.length === 0 ? (
            <p>Este paseador aún no tiene reseñas.</p>
          ) : (
            <ul className="modal-resenas">
              {paseador.resenas.map((resena) => (
                <li key={resena.id}>
                  <strong>{resena.autor}</strong> — {resena.puntaje}/5
                  <br />
                  <span>{resena.comentario}</span>
                  <br />
                  <small>{resena.fecha}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default PaseadorPerfilModal;
