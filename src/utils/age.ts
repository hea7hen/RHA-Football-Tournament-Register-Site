import { differenceInYears, parseISO } from "date-fns";

export function calculateAgeFromDobString(dobIsoString: string): number {
  try {
    const dobDate = parseISO(dobIsoString);
    const age = differenceInYears(new Date(), dobDate);
    return Math.max(age, 0);
  } catch {
    return 0;
  }
}

export function mean(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function mode(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const counts = new Map<number, number>();
  for (const n of numbers) {
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  let best = numbers[0];
  let bestCount = 0;
  counts.forEach((count, n) => {
    if (count > bestCount) {
      best = n;
      bestCount = count;
    }
  });
  return best;
}



