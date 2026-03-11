export type StatItem = {
  key: string;
  description: string;
  result: { counted: number }[] | { date: string; counted: number }[];
};

export type StatsData = StatItem[];

export function getStatByKey(
  stats: StatsData,
  key: string
): StatItem | undefined {
  return stats.find((item) => item.key === key);
}

export function getCount(stats: StatsData, key: string): number {
  const item = getStatByKey(stats, key);
  if (!item || !item.result || item.result.length === 0) return 0;
  const first = item.result[0];
  if ('date' in first) return 0;
  return first.counted ?? 0;
}

export function getTimeSeries(
  stats: StatsData,
  key: string
): { date: string; counted: number }[] {
  const item = getStatByKey(stats, key);
  if (!item || !item.result || item.result.length === 0) return [];
  const first = item.result[0];
  if (!('date' in first)) return [];
  return item.result as { date: string; counted: number }[];
}
