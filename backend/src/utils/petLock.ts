const operaciones = new Map<string, Promise<void>>();

// Serializa la creación de reservas y el borrado para la misma mascota en este proceso.
export const withPetLock = async (id: string, operar: () => Promise<void>): Promise<void> => {
  const clave = id.toLowerCase();
  const anterior = operaciones.get(clave);
  let liberar!: () => void;
  const turno = new Promise<void>((resolve) => { liberar = resolve; });
  operaciones.set(clave, turno);

  await anterior;
  try {
    await operar();
  } finally {
    if (operaciones.get(clave) === turno) operaciones.delete(clave);
    liberar();
  }
};
