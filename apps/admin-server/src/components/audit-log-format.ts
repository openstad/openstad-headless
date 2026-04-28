import {
  FIELD_LABELS,
  VALUE_LABELS,
} from '@/components/audit-log-field-config';

export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] || key;
}

export function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nee';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return stripHtml(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    const names = value.map(optionLabel).filter(Boolean);
    return names.length > 0
      ? names.join(', ')
      : `${value.length} item${value.length !== 1 ? 's' : ''}`;
  }

  if (typeof value === 'object') {
    if (value.lat !== undefined && value.lng !== undefined)
      return `${value.lat}, ${value.lng}`;

    if (value.rows && value.columns)
      return `Rijen: ${formatValue(value.rows)} / Kolommen: ${formatValue(value.columns)}`;

    if (
      Object.values(value).some(
        (v: any) => v?.weightX !== undefined || v?.weightAB !== undefined
      )
    )
      return Object.entries(value)
        .map(([k, w]: [string, any]) => {
          const p = [];
          if (w.weightX !== undefined) p.push(`X: ${w.weightX}`);
          if (w.weightY !== undefined) p.push(`Y: ${w.weightY}`);
          if (w.weightAB) p.push(`A/B: ${w.weightAB}`);
          return `${k}: ${p.join(', ')}`;
        })
        .join(' | ');

    if (value.name || value.title) return value.name || value.title;
    if (value.url) return value.url;
    return Object.keys(value).length === 0
      ? ''
      : `${Object.keys(value).length} velden`;
  }

  return String(value);
}

export function formatFieldValue(key: string, value: any): string {
  return VALUE_LABELS[key]?.[String(value)] || formatValue(value);
}

export function optionLabel(v: any): string | null {
  if (!v || typeof v !== 'object') return null;

  const t = v?.titles?.[0];
  if (t) {
    const parts: string[] = [];
    parts.push(stripHtml(t.key || '') || '(geen tekst)');
    if (t.isOtherOption) parts.push('(anders)');
    if (t.defaultValue) parts.push('(standaard)');
    if (t.image) parts.push('(afbeelding)');
    if (t.description) parts.push(`- ${stripHtml(t.description)}`);
    if (t.key_b) {
      parts.push(`/ ${stripHtml(t.key_b)}`);
      if (t.image_b) parts.push('(afbeelding B)');
    }
    if (v.images?.length > 0) parts.push('(afbeelding)');
    return parts.join(' ');
  }

  if (v.text) return v.text;
  return v.name || (v.title && stripHtml(v.title)) || v.label || v.key || null;
}

export function getItemLabel(item: any, index: number): string {
  return (
    (item?.title && stripHtml(item.title)) ||
    item?.fieldKey ||
    item?.name ||
    item?.label ||
    `#${index + 1}`
  );
}

export function getItemId(item: any): string | null {
  if (!item || typeof item !== 'object') return null;
  return item.trigger || item.fieldKey || item.id || null;
}
