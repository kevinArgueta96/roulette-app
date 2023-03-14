
export const obtenerHoraActual = () => {
  const ahora = new Date();
  const hora = ahora.getHours();
  const minutos = ahora.getMinutes();

  // Formatear hora en formato 24 horas
  const hora24 = (hora < 10 ? "0" : "") + hora;
  const minutos24 = (minutos < 10 ? "0" : "") + minutos;

  return `${hora24}:${minutos24}`;
}