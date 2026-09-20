export interface FiltrosState {
  busqueda: string;
  comuna: string;
  calificacionMinima: number;
  tarifaMax: number;
}

interface FiltrosPaseadoresProps {
  filtros: FiltrosState;
  onFiltroChange: (campo: keyof FiltrosState, valor: string | number) => void;
}

const FiltrosPaseadores = ({ filtros, onFiltroChange }: FiltrosPaseadoresProps) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", margin: "24px 0" }}>
      <div className="filtro">
        <label htmlFor="busqueda">Buscar:</label>
        <input
          id="busqueda"
          type="text"
          placeholder="Ej. Juan, perros grandes..."
          value={filtros.busqueda}
          onChange={(e) => onFiltroChange("busqueda", e.target.value)}
        />
      </div>

      <div className="filtro">
        <label htmlFor="comuna">Comuna:</label>
        <select
          id="comuna"
          value={filtros.comuna}
          onChange={(e) => onFiltroChange("comuna", e.target.value)}
        >
          <option value="Todas">Todas</option>
          <option value="Providencia">Providencia</option>
          <option value="Ñuñoa">Ñuñoa</option>
          <option value="Quilicura">Quilicura</option>
          <option value="Santiago Centro">Santiago Centro</option>
          <option value="Las Condes">Las Condes</option>
        </select>
      </div>

      <div className="filtro">
        <label htmlFor="calificacion">Estrellas:</label>
        <select
          id="calificacion"
          value={filtros.calificacionMinima}
          onChange={(e) => onFiltroChange("calificacionMinima", Number(e.target.value))}
        >
          <option value={0}>Cualquiera</option>
          <option value={3}>3+ ⭐</option>
          <option value={4}>4+ ⭐</option>
          <option value={4.5}>4.5+ ⭐</option>
        </select>
      </div>

      <div className="filtro">
        <label htmlFor="tarifa">Max: ${filtros.tarifaMax.toLocaleString("es-CL")}</label>
        <input
          id="tarifa"
          type="range"
          min="4000"
          max="20000"  
          step="500"   
          value={filtros.tarifaMax}
          onChange={(e) => onFiltroChange("tarifaMax", Number(e.target.value))}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default FiltrosPaseadores;