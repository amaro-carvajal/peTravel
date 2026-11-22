import { create } from "zustand";
import bookingService from "../services/booking";
import bookingsService, { adaptBooking } from "../services/bookings";
import { mensajeError } from "../services/http";
import type { EstadoPaseo, MascotaData, NuevaReservaData, PaseoData } from "../types/data";

type AccionReserva = "crear" | "actualizar";

interface BookingsStore {
  paseos: PaseoData[];
  cargando: boolean;
  accion: AccionReserva | null;
  error: string | null;
  errorAccion: { tipo: AccionReserva; mensaje: string } | null;
  notificacionDescartada: boolean;
  cargar: () => Promise<void>;
  crear: (reserva: NuevaReservaData, mascota: MascotaData, paseador: string) => Promise<boolean | null>;
  cambiarEstado: (id: string, estado: EstadoPaseo) => Promise<void>;
  marcarResenado: (id: string) => void;
  descartarNotificacion: () => void;
  limpiarErrorAccion: () => void;
  limpiar: () => void;
}

const estadoInicial = {
  paseos: [],
  cargando: false,
  accion: null,
  error: null,
  errorAccion: null,
  notificacionDescartada: false,
};

export const useBookingsStore = create<BookingsStore>((set, get) => {
  let sesion = 0;
  let revision = 0;

  const modificar = async (
    tipo: AccionReserva,
    operacion: () => Promise<(paseos: PaseoData[]) => PaseoData[]>,
    mensaje: string,
  ): Promise<boolean | null> => {
    if (get().accion) return null;
    const sesionActual = sesion;
    set({ accion: tipo, errorAccion: null });
    try {
      const actualizar = await operacion();
      if (sesionActual !== sesion) return null;
      revision += 1;
      set(({ paseos }) => ({ paseos: actualizar(paseos) }));
      return true;
    } catch (err: unknown) {
      if (sesionActual !== sesion) return null;
      set({ errorAccion: { tipo, mensaje: mensajeError(err, mensaje) } });
      return false;
    } finally {
      if (sesionActual === sesion) set({ accion: null });
    }
  };

  return {
    ...estadoInicial,
    cargar: async () => {
      if (get().cargando) return;
      const sesionActual = sesion;
      const revisionActual = revision;
      set({ cargando: true, error: null });
      try {
        const paseos = await bookingsService.getAll();
        if (sesionActual !== sesion) return;
        // Un GET iniciado antes de una mutación podría traer una lista anterior.
        if (revisionActual === revision) set({ paseos });
      } catch (err: unknown) {
        if (sesionActual === sesion && revisionActual === revision) {
          set({ error: mensajeError(err, "No se pudieron cargar tus paseos.") });
        }
      } finally {
        if (sesionActual === sesion) {
          set({ cargando: false });
          if (revisionActual !== revision) void get().cargar();
        }
      }
    },
    crear: (reserva, mascota, paseador) => modificar("crear", async () => {
      const creada = await bookingService.create(reserva);
      const paseo = adaptBooking(creada, {
        name: mascota.nombre, breed: mascota.raza, size: mascota.tamano,
      }, undefined, paseador);
      return (paseos) => [...paseos.filter(({ id }) => id !== paseo.id), paseo];
    }, "No se pudo enviar la solicitud de paseo."),
    cambiarEstado: async (id, estado) => {
      await modificar("actualizar", async () => {
        const confirmada = await bookingsService.updateStatus(id, estado);
        return (paseos) => paseos.map((paseo) =>
          paseo.id === id ? { ...paseo, estado: confirmada } : paseo);
      }, "No se pudo actualizar el paseo.");
    },
    limpiarErrorAccion: () => set({ errorAccion: null }),
    marcarResenado: (id) =>
      set(({ paseos }) => ({
        paseos: paseos.map((paseo) => (paseo.id === id ? { ...paseo, resenado: true } : paseo)),
      })),
    descartarNotificacion: () => set({ notificacionDescartada: true }),
    limpiar: () => {
      sesion += 1;
      set(estadoInicial);
    },
  };
});
