export function getDefaultRange(year: number): { start: number; end: number } {
  let half: number;
  if (year < -1000) half = 150;
  else if (year < -500) half = 75;
  else if (year < 500) half = 50;
  else if (year < 1500) half = 30;
  else if (year < 1800) half = 15;
  else half = 10;
  return { start: year - half, end: year + half };
}
