export const calculateIndex = ({ startAngle, arc }) => {
  const degrees = (startAngle * 180) / Math.PI + 90;
  const arcDegrees = (arc * 180) / Math.PI;

  return Math.floor((360 - (degrees % 360)) / arcDegrees);
};
