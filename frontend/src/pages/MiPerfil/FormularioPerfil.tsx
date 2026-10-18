import {
  Button,
  Checkbox,
  Container,
  Group,
  NumberInput,
  Paper,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, type SubmitEvent } from "react";
import walkerService from "../../services/walkers";
import classes from "./FormularioPerfil.module.css";

interface FormularioPerfilProps {
  onCreado: (id: string) => void;
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

interface HorarioDia {
  activo: boolean;
  inicio: string;
  fin: string;
}

const HORARIOS_INICIALES: Record<string, HorarioDia> = Object.fromEntries(
  DIAS.map((dia) => [dia.value, { activo: false, inicio: "09:00", fin: "13:00" }])
);

const FormularioPerfil = ({ onCreado }: FormularioPerfilProps) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [zonas, setZonas] = useState<string[]>([]);
  const [tarifa, setTarifa] = useState<number | string>("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState("");
  const [horarios, setHorarios] = useState<Record<string, HorarioDia>>(HORARIOS_INICIALES);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const toggleDia = (dia: string) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], activo: !prev[dia].activo },
    }));
  };

  const cambiarHora = (dia: string, campo: "inicio" | "fin", valor: string) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor },
    }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (descripcion.trim().length === 0 || descripcion.length > 300) {
      setError("La descripción es obligatoria (máx. 300 caracteres).");
      return;
    }

    if (zonas.length === 0) {
      setError("Agrega al menos una comuna o zona de cobertura.");
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

    if (!EMAIL_REGEX.test(email)) {
      setError("El correo es inválido.");
      return;
    }

    const diasActivos = DIAS.filter((dia) => horarios[dia.value].activo);

    for (const dia of diasActivos) {
      const h = horarios[dia.value];
      if (!HORA_REGEX.test(h.inicio) || !HORA_REGEX.test(h.fin)) {
        setError(`Revisa el horario de ${dia.label}: usa el formato HH:MM.`);
        return;
      }
    }

    const grupos: Record<string, string[]> = {};

    for (const dia of diasActivos) {
      const h = horarios[dia.value];
      const clave = `${h.inicio}|${h.fin}`;
      (grupos[clave] ??= []).push(dia.value);
    }

    const availability = Object.entries(grupos).map(([clave, days]) => {
      const [startTime, endTime] = clave.split("|");
      return { days, startTime, endTime };
    });

    setCargando(true);

    try {
      const creado = await walkerService.create({
        name: nombre.trim(),
        description: descripcion.trim(),
        coverageAreas: zonas,
        hourlyRate: tarifaNumero,
        phone: telefono.trim(),
        email: email.trim().toLowerCase(),
        photo: foto.trim() || undefined,
        availability: availability.length > 0 ? availability : undefined,
      });
      onCreado(creado.id);
    } catch (err: any) {
      const mensaje =
        err.response?.data?.error || "No se pudo crear tu perfil.";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container size={1200} className={classes.wrapper}>
      <Paper className={classes.card}>
        <Title order={2} className={classes.titulo}>
          Crea tu perfil de paseador
        </Title>
        <Text className={classes.subtitulo}>
          Completa tus datos para aparecer en el listado de paseadores.
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && <div className={classes.errorBox}>{error}</div>}

            <TextInput
              label="Nombre visible"
              placeholder="Ej. Camila Rojas"
              required
              value={nombre}
              onChange={(e) => setNombre(e.currentTarget.value)}
            />

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

            <TagsInput
              label="Comunas o zonas de cobertura"
              placeholder="Escribe una zona y presiona Enter"
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
              label="Correo de contacto"
              placeholder="tu@correo.cl"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <TextInput
              label="Foto (URL, opcional)"
              placeholder="https://..."
              value={foto}
              onChange={(e) => setFoto(e.currentTarget.value)}
            />

            <div>
              <Text size="sm" fw={500} mb={4}>
                Disponibilidad (opcional)
              </Text>
              <Stack gap="xs" mt={4}>
                {DIAS.map((dia) => (
                  <Group key={dia.value} gap="sm" wrap="nowrap">
                    <Checkbox
                      checked={horarios[dia.value].activo}
                      onChange={() => toggleDia(dia.value)}
                      label={dia.label}
                      w={130}
                    />
                    {horarios[dia.value].activo && (
                      <Group gap="xs">
                        <TextInput
                          size="xs"
                          placeholder="09:00"
                          value={horarios[dia.value].inicio}
                          onChange={(e) =>
                            cambiarHora(dia.value, "inicio", e.currentTarget.value)
                          }
                          w={90}
                        />
                        <TextInput
                          size="xs"
                          placeholder="13:00"
                          value={horarios[dia.value].fin}
                          onChange={(e) =>
                            cambiarHora(dia.value, "fin", e.currentTarget.value)
                          }
                          w={90}
                        />
                      </Group>
                    )}
                  </Group>
                ))}
              </Stack>
            </div>

            <Button type="submit" fullWidth loading={cargando} mt="sm">
              Crear mi perfil
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default FormularioPerfil;
