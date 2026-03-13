const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const formatTime24h = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

export const timeStringToMinutes = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(TIME_PATTERN);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

export const isTimeWithinRange = (currentTime, rangeDown, rangeTop) => {
  const current = timeStringToMinutes(currentTime);
  const down = timeStringToMinutes(rangeDown);
  const top = timeStringToMinutes(rangeTop);

  if (current === null || down === null || top === null) {
    return false;
  }

  if (down <= top) {
    return current >= down && current <= top;
  }

  return current >= down || current <= top;
};

export const obtenerHoraActual = formatTime24h;
