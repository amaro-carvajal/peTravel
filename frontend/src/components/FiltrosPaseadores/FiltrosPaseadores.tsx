import { NativeSelect, Slider, TextInput } from "@mantine/core";
import classes from "./FiltrosPaseadores.module.css";

export interface FiltrosState {
  busqueda: string;
  comuna: string;
  calificacionMinima: number;
  tarifaMax: number;
}

interface FiltrosPaseadoresProps {
  filtros: FiltrosState;
  comunas: string[];
  onFiltroChange: (campo: keyof FiltrosState, valor: string | number) => void;
}

const ESTRELLAS = [
  { value: "0", label: "Cualquiera" },
  { value: "3", label: "3+ ⭐" },
  { value: "4", label: "4+ ⭐" },
  { value: "4.5", label: "4.5+ ⭐" },
];

const FiltrosPaseadores = ({ filtros, comunas, onFiltroChange }: FiltrosPaseadoresProps) => (
  <div className={classes.filtros}>
    <div className={classes.filtro}>
      <label htmlFor="busqueda">Buscar:</label>
      <TextInput
        id="busqueda"
        placeholder="Ej. Juan, perros grandes..."
        value={filtros.busqueda}
        onChange={(e) => onFiltroChange("busqueda", e.currentTarget.value)}
      />
    </div>

    <div className={classes.filtro}>
      <label htmlFor="comuna">Comuna:</label>
      <NativeSelect
        id="comuna"
        data={["Todas", ...comunas]}
        value={filtros.comuna}
        onChange={(e) => onFiltroChange("comuna", e.currentTarget.value)}
      />
    </div>

    <div className={classes.filtro}>
      <label htmlFor="calificacion">Estrellas:</label>
      <NativeSelect
        id="calificacion"
        data={ESTRELLAS}
        value={String(filtros.calificacionMinima)}
        onChange={(e) => onFiltroChange("calificacionMinima", Number(e.currentTarget.value))}
      />
    </div>

    <div className={`${classes.filtro} ${classes.filtroSlider}`}>
      <label>Max: ${filtros.tarifaMax.toLocaleString("es-CL")}</label>
      <Slider
        className={classes.slider}
        min={4000}
        max={20000}
        step={500}
        label={null}
        thumbLabel="Tarifa máxima"
        value={filtros.tarifaMax}
        onChange={(valor) => onFiltroChange("tarifaMax", valor)}
      />
    </div>
  </div>
);

export default FiltrosPaseadores;
