export type TimeLeft = { days: number; hours: number; minutes: number };

export function getTimeLeft(now: Date, target: Date): TimeLeft {
  const totalMinutes = Math.floor((target.getTime() - now.getTime()) / 60000);

  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}
