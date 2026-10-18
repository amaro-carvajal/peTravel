const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "2026-09-26" -> "Sáb 26 sep"
export const formatearFecha = (fecha: string): string => {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);
  const d = new Date(anio, mes - 1, dia);
  return `${DIAS[d.getDay()]} ${dia} ${MESES[mes - 1]}`;
};

// 60 -> "1 hora", 30 -> "30 min", 90 -> "1,5 horas"
export const formatearDuracion = (min: number): string => {
  if (min < 60) return `${min} min`;
  const horas = min / 60;
  if (horas === 1) return "1 hora";
  return `${String(horas).replace(".", ",")} horas`;
};

export const formatearPrecio = (valor: number): string =>
  `$${valor.toLocaleString("es-CL")}`;