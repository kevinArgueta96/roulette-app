export const calculateIndex = (dataRoulette) => {
    const { startAngle, arc } = dataRoulette;

    const degrees = (startAngle * 180) / Math.PI + 90;
    const arcd = (arc * 180) / Math.PI;
    return Math.floor((360 - (degrees % 360)) / arcd);

}

export const calculateEaseOut = (dataRoulette) => {
    let spinTime = dataRoulette.spinTime;
    let spinTimeTotal = dataRoulette.spinTimeTotal;
    let b = dataRoulette.b;
    let spinArcStart = dataRoulette.spinArcStart;

    const ts = (spinTime /= spinTimeTotal) * spinTime;
    const tc = ts * spinTime;
    return b + spinArcStart * (tc + -2 * ts + 2 * spinTime);
}
