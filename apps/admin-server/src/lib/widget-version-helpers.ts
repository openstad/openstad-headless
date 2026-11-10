import {
  INTERNAL_FIELDS,
  isInternalField,
} from '../components/audit-log-field-config';
import { fieldLabel } from '../components/audit-log-format';
import type { WidgetVersion } from '../hooks/use-widget-versions';

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function versionLabel(
  version: Pick<WidgetVersion, 'name' | 'createdAt'>
) {
  return version.name || formatDate(version.createdAt);
}

export type IdEntity = 'tag' | 'status' | 'resource' | 'choiceguide' | 'area';

const ID_FIELDS: Record<string, IdEntity> = {
  onlyIncludeTagIds: 'tag',
  onlyShowTheseTagIds: 'tag',
  onlyIncludeOrExcludeTagIds: 'tag',
  defaultTags: 'tag',
  defaultAddedTags: 'tag',
  onlyIncludeStatusIds: 'status',
  resourceId: 'resource',
  choiceguideWidgetId: 'choiceguide',
  areaId: 'area',
};

export function idsFromValue(value: any): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === 'number') return [String(value)];
  if (typeof value === 'string')
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

export function resolveIds(
  config: any,
  maps: Record<IdEntity, Map<string, string>>
): any {
  if (Array.isArray(config)) return config.map((c) => resolveIds(c, maps));
  if (!config || typeof config !== 'object') return config;
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(config)) {
    if (key in ID_FIELDS) {
      const ids = idsFromValue(value);
      if (ids.length > 0) {
        const map = maps[ID_FIELDS[key]];
        out[key] = ids
          .map((id) => map.get(id) || `#${id}`)
          .sort()
          .join(', ');
        continue;
      }
    }
    out[key] =
      value && typeof value === 'object' ? resolveIds(value, maps) : value;
  }
  return out;
}

export function summarizeChanges(
  prevRaw: any,
  nextRaw: any,
  widgetType?: string
): string | null {
  const prev = stripSystemFields(prevRaw, true);
  const next = stripSystemFields(nextRaw, true);
  const pObj = prev && typeof prev === 'object' ? prev : {};
  const nObj = next && typeof next === 'object' ? next : {};

  const keys = Array.from(
    new Set([...Object.keys(pObj), ...Object.keys(nObj)])
  );
  const labels: string[] = [];
  for (const key of keys) {
    if (isInternalField(key)) continue;
    if (JSON.stringify(pObj[key]) === JSON.stringify(nObj[key])) continue;
    labels.push(fieldLabel(key, widgetType));
  }

  if (labels.length === 0) return null;
  const MAX = 4;
  if (labels.length <= MAX) return labels.join(', ');
  return `${labels.slice(0, MAX).join(', ')} +${labels.length - MAX} meer`;
}

const ALWAYS_STRIP = new Set(
  Array.from(INTERNAL_FIELDS).filter(
    (k) => !['id', 'trigger', 'key'].includes(k)
  )
);
const STABLE_KEYS = ['fieldKey', 'trigger', 'key'];

export function stripSystemFields(value: any, isTop = false): any {
  if (Array.isArray(value)) return value.map((v) => stripSystemFields(v));
  if (value && typeof value === 'object') {
    const hasStableKey = STABLE_KEYS.some((k) => k in value);
    const canDropId = isTop || hasStableKey;
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (ALWAYS_STRIP.has(key)) continue;
      if (key === 'id' && canDropId) continue;
      out[key] = stripSystemFields(val);
    }
    return out;
  }
  return value;
}
