export function scaleScoreTo10(rawScore: number, maxScore: number = 100): number {
  if (maxScore <= 0) return 0;
  const scaled = (rawScore / maxScore) * 10;
  return Math.round(scaled);
}
