import {
  ActionIcon,
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  MultiSelect,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, type SubmitEvent } from "react";
import axios from "axios";
import walkerService, { type ActualizarPaseadorData, type PerfilPaseadorData } from "../../services/walkers";
import { COMUNAS_CHILE } from "../../data/comunasChile";
import type { BackendAvailability, UsuarioData } from "../../types/data";
import classes from "./FormularioPerfil.module.css";

interface FormularioPerfilProps {
  usuario: UsuarioData | null;
  perfil: PerfilPaseadorData | null;
  onGuardado: (perfil: PerfilPaseadorData) => void;
  onCancelar?: () => void;
}

const DIAS = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const HORA_REGEX = /^([01]\d|2[0-3]):(00|30)$/;
const HORAS = Array.from({ length: 48 }, (_, indice) =>
  `${String(Math.floor(indice / 2)).padStart(2, "0")}:${indice % 2 === 0 ? "00" : "30"}`
);

interface BloqueHorario {
  inicio: string;
  fin: string;
}

const validarBloque = (bloque: BloqueHorario): string | null => {
  if (!HORA_REGEX.test(bloque.inicio) || !HORA_REGEX.test(bloque.fin)) {
    return "Selecciona ambas horas en intervalos de 30 minutos.";
  }
  if (bloque.fin <= bloque.inicio) {
    return "La hora final debe ser posterior a la hora inicial.";
  }
  return null;
};

const FormularioPerfil = ({ usuario, perfil, onGuardado, onCancelar }: FormularioPerfilProps) => {
  const [descripcion, setDescripcion] = useState(perfil?.descripcion ?? "");
  const [zonas, setZonas] = useState<string[]>(perfil?.zonas ?? []);
  const [tarifa, setTarifa] = useState<number | string>(perfil?.tarifa ?? "");
  const [telefono, setTelefono] = useState(perfil?.contacto.telefono ?? "");
  const [foto, setFoto] = useState(perfil?.foto ?? "");
  const [horarios, setHorarios] = useState<Record<string, BloqueHorario[]>>(() => {
    const iniciales: Record<string, BloqueHorario[]> = Object.fromEntries(
      DIAS.map((dia) => [dia.value, []])
    );
    for (const horario of perfil?.horarios ?? []) {
      for (const dia of horario.days) {
        iniciales[dia]?.push({ inicio: horario.startTime, fin: horario.endTime });
      }
    }
    return iniciales;
  });
  const comunasDisponibles = [...new Set([...COMUNAS_CHILE, ...(perfil?.zonas ?? [])])];
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const hayBloquesInvalidos = Object.values(horarios).some((bloques) =>
    bloques.some((bloque) => validarBloque(bloque) !== null)
  );

  const agregarBloque = (dia: string) => {
    setHorarios((prev) => ({ ...prev, [dia]: [...prev[dia], { inicio: "", fin: "" }] }));
  };

  const eliminarBloque = (dia: string, indice: number) => {
    setHorarios((prev) => ({ ...prev, [dia]: prev[dia].filter((_, i) => i !== indice) }));
  };

  const cambiarHora = (dia: string, indice: number, campo: keyof BloqueHorario, valor: string) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: prev[dia].map((bloque, i) => i === indice ? { ...bloque, [campo]: valor } : bloque),
    }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!usuario) {
      setError("Debes iniciar sesión para guardar tu perfil.");
      return;
    }

    if (descripcion.trim().length === 0 || descripcion.length > 300) {
      setError("La descripción es obligatoria (máx. 300 caracteres).");
      return;
    }

    if (zonas.length === 0) {
      setError("Selecciona al menos una comuna de cobertura.");
      return;
    }

    if (zonas.some((zona) => !comunasDisponibles.includes(zona))) {
      setError("Selecciona comunas del listado.");
      return;
    }

    const tarifaNumero = typeof tarifa === "number" ? tarifa : Number(tarifa);

    if (Number.isNaN(tarifaNumero) || tarifaNumero < 0) {
      setError("Ingresa una tarifa por hora válida.");
      return;
    }

    if (telefono.trim().length === 0) {
      setError("El teléfono es obligatorio.");
      return;
    }

    const availability: BackendAvailability[] = [];
    for (const dia of DIAS) {
      for (const bloque of horarios[dia.value]) {
        const errorBloque = validarBloque(bloque);
        if (errorBloque) {
          setError(`${dia.label}: ${errorBloque}`);
          return;
        }
        availability.push({ days: [dia.value], startTime: bloque.inicio, endTime: bloque.fin });
      }
    }

    setCargando(true);

    try {
      const datos: ActualizarPaseadorData = {
        description: descripcion.trim(),
        coverageAreas: zonas,
        hourlyRate: tarifaNumero,
        phone: telefono.trim(),
        photo: foto.trim(),
        availability,
      };
      const resultado = perfil
        ? await walkerService.update(perfil.id, datos)
        : await walkerService.create({ ...datos, name: usuario.nombre, email: usuario.email });
      onGuardado(resultado);
    } catch (err: unknown) {
      const mensaje =
        (axios.isAxiosError<{ error: string }>(err) && err.response?.data?.error) ||
        "No se pudo guardar tu perfil.";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container size={1200} className={classes.wrapper}>
      <Paper className={classes.card}>
        <Title order={2} className={classes.titulo}>
          {perfil ? "Edita tu perfil de paseador" : "Crea tu perfil de paseador"}
        </Title>
        <Text className={classes.subtitulo}>
          {perfil ? "Actualiza los datos de tu servicio." : "Completa tus datos para aparecer en el listado de paseadores."}
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && <div className={classes.errorBox}>{error}</div>}

            <Paper className={classes.cuenta}>
              <Text size="sm" c="dimmed">
                Se usarán los datos de tu cuenta:
              </Text>
              <Text size="sm">
                <b>{usuario?.nombre}</b> · {usuario?.email}
              </Text>
            </Paper>

            <Textarea
              label="Descripción"
              placeholder="Cuéntales a los dueños sobre tu servicio"
              required
              maxLength={300}
              autosize
              minRows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.currentTarget.value)}
            />

            <MultiSelect
              label="Comunas de cobertura"
              placeholder="Selecciona una o más comunas"
              data={comunasDisponibles}
              searchable
              nothingFoundMessage="No se encontraron comunas"
              required
              value={zonas}
              onChange={setZonas}
            />

            <NumberInput
              label="Tarifa por hora (CLP)"
              placeholder="Ej. 5000"
              required
              min={0}
              value={tarifa}
              onChange={setTarifa}
            />

            <TextInput
              label="Teléfono"
              placeholder="+56 9 1234 5678"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.currentTarget.value)}
            />

            <TextInput
              label="Foto (URL, opcional)"
              placeholder="https://..."
              value={foto}
              onChange={(e) => setFoto(e.currentTarget.value)}
            />

            <section aria-labelledby="disponibilidad-titulo">
              <Text id="disponibilidad-titulo" size="sm" fw={600}>
                Disponibilidad semanal
              </Text>
              <Text size="xs" c="dimmed" mt={2} mb="sm">
                Define los días y horarios en que pueden agendar paseos contigo.
              </Text>
              <div className={classes.semana}>
                {DIAS.map((dia) => (
                  <div key={dia.value} className={classes.dia}>
                    <Text size="sm" fw={500} className={classes.nombreDia}>{dia.label}</Text>
                    {horarios[dia.value].length === 0 ? (
                      <Group justify="space-between" gap="xs" wrap="nowrap">
                        <Text size="xs" c="dimmed">Sin disponibilidad</Text>
                        <Button type="button" variant="subtle" size="compact-xs" onClick={() => agregarBloque(dia.value)}>
                          + Agregar
                        </Button>
                      </Group>
                    ) : (
                      <Stack gap={6}>
                        {horarios[dia.value].map((bloque, indice) => (
                          <div key={indice} className={classes.bloque}>
                            <Select
                              size="xs"
                              aria-label={`${dia.label}, bloque ${indice + 1}, desde`}
                              data={HORAS}
                              placeholder="Inicio"
                              required
                              value={HORAS.includes(bloque.inicio) ? bloque.inicio : null}
                              onChange={(valor) => cambiarHora(dia.value, indice, "inicio", valor ?? "")}
                            />
                            <Text size="sm" c="dimmed" className={classes.separador} aria-hidden="true">—</Text>
                            <Select
                              size="xs"
                              error={bloque.inicio && bloque.fin ? validarBloque(bloque) : undefined}
                              aria-label={`${dia.label}, bloque ${indice + 1}, hasta`}
                              data={HORAS}
                              placeholder="Fin"
                              required
                              value={HORAS.includes(bloque.fin) ? bloque.fin : null}
                              onChange={(valor) => cambiarHora(dia.value, indice, "fin", valor ?? "")}
                            />
                            <ActionIcon
                              type="button"
                              variant="subtle"
                              color="gray"
                              size="sm"
                              mt={4}
                              aria-label={`Eliminar bloque ${indice + 1} de ${dia.label}`}
                              title="Eliminar bloque"
                              onClick={() => eliminarBloque(dia.value, indice)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
                              </svg>
                            </ActionIcon>
                          </div>
                        ))}
                        <Button type="button" variant="subtle" size="compact-xs" className={classes.agregarBloque} onClick={() => agregarBloque(dia.value)}>
                          + Agregar bloque
                        </Button>
                      </Stack>
                    )}
                  </div>
                ))}
              </div>
              <Text size="xs" c="dimmed" mt="xs">
                Mientras no tengas horarios disponibles, no podrán agendar paseos contigo.
              </Text>
            </section>

            <Button type="submit" fullWidth loading={cargando} disabled={hayBloquesInvalidos} mt="sm">
              {perfil ? "Guardar cambios" : "Crear mi perfil"}
            </Button>
            {perfil && onCancelar && (
              <Button type="button" variant="default" disabled={cargando} onClick={onCancelar}>
                Cancelar
              </Button>
            )}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default FormularioPerfil;
