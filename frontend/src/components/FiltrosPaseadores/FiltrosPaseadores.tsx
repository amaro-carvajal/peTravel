import type { ReactNode } from "react";
import { Group, NativeSelect, Paper, Slider, Text, TextInput } from "@mantine/core";
import classes from "./FiltrosPaseadores.module.css";

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

const COMUNAS = ["Todas", "Providencia", "Ñuñoa", "Quilicura", "Santiago Centro", "Las Condes"];

const ESTRELLAS = [
  { value: "0", label: "Cualquiera" },
  { value: "3", label: "3+ ⭐" },
  { value: "4", label: "4+ ⭐" },
  { value: "4.5", label: "4.5+ ⭐" },
];

const Filtro = ({ children }: { children: ReactNode }) => (
  <Paper px="md" py="sm" radius={12} shadow="xs" bd="1px solid #dbeafe">
    <Group gap="sm" wrap="nowrap">
      {children}
    </Group>
  </Paper>
);

const Etiqueta = ({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) => (
  <Text component="label" htmlFor={htmlFor} fw={600} fz="sm" c="#1e3a8a" style={{ whiteSpace: "nowrap" }}>
    {children}
  </Text>
);

const FiltrosPaseadores = ({ filtros, onFiltroChange }: FiltrosPaseadoresProps) => {
  return (
    <Group gap="md" my="lg">
      <Filtro>
        <Etiqueta htmlFor="busqueda">Buscar:</Etiqueta>
        <TextInput
          id="busqueda"
          placeholder="Ej. Juan, perros grandes..."
          radius="md"
          classNames={{ input: classes.input }}
          value={filtros.busqueda}
          onChange={(e) => onFiltroChange("busqueda", e.currentTarget.value)}
        />
      </Filtro>

      <Filtro>
        <Etiqueta htmlFor="comuna">Comuna:</Etiqueta>
        <NativeSelect
          id="comuna"
          data={COMUNAS}
          radius="md"
          classNames={{ input: classes.input }}
          value={filtros.comuna}
          onChange={(e) => onFiltroChange("comuna", e.currentTarget.value)}
        />
      </Filtro>

      <Filtro>
        <Etiqueta htmlFor="calificacion">Estrellas:</Etiqueta>
        <NativeSelect
          id="calificacion"
          data={ESTRELLAS}
          radius="md"
          classNames={{ input: classes.input }}
          value={String(filtros.calificacionMinima)}
          onChange={(e) => onFiltroChange("calificacionMinima", Number(e.currentTarget.value))}
        />
      </Filtro>

      <Filtro>
        <Etiqueta>Max: ${filtros.tarifaMax.toLocaleString("es-CL")}</Etiqueta>
        <Slider
          w={140}
          min={4000}
          max={20000}
          step={500}
          color="#1d4ed8"
          label={null}
          thumbLabel="Tarifa máxima"
          value={filtros.tarifaMax}
          onChange={(valor) => onFiltroChange("tarifaMax", valor)}
        />
      </Filtro>
    </Group>
  );
};

export default FiltrosPaseadores;