import { getItemDisplayFields } from '@/components/audit-log-field-config';
import {
  type AuditValue,
  fieldLabel,
  formatFieldValue,
  formatValue,
  getItemId,
  getItemLabel,
} from '@/components/audit-log-format';
import React from 'react';

function getRelevantKeys(item: AuditValue): string[] {
  if (typeof item !== 'object') return [];
  return getItemDisplayFields(item);
}

function FieldDiff({
  label,
  oldVal,
  newVal,
}: {
  label: string;
  oldVal?: AuditValue;
  newVal?: AuditValue;
}) {
  const o = label ? formatFieldValue(label, oldVal) : formatValue(oldVal);
  const n = label ? formatFieldValue(label, newVal) : formatValue(newVal);
  if (o === n) return null;

  return (
    <div className="py-0.5">
      {label && <span className="font-medium">{fieldLabel(label)}: </span>}
      {oldVal !== undefined && oldVal !== null && (
        <>
          <span className="text-red-600 line-through">{o}</span>
          {' → '}
        </>
      )}
      <span className="text-green-700">{n}</span>
    </div>
  );
}

function ItemDetails({
  item,
  keys,
  variant,
}: {
  item: AuditValue;
  keys: string[];
  variant: 'added' | 'deleted';
}) {
  if (keys.length === 0) return null;
  const isDeleted = variant === 'deleted';
  return (
    <div
      className={`ml-3 border-l pl-2 ${isDeleted ? 'border-red-200' : 'border-green-200'}`}>
      {keys.map((k) => {
        const val = formatFieldValue(k, item[k]);
        return (
          <div
            key={k}
            className={
              isDeleted ? 'text-red-600 line-through' : 'text-green-700'
            }>
            {fieldLabel(k)}
            {val ? `: ${val}` : ''}
          </div>
        );
      })}
    </div>
  );
}

function RenderDiff({
  prev,
  next,
  depth = 0,
}: {
  prev: AuditValue;
  next: AuditValue;
  depth?: number;
}) {
  if (depth > 5) return <span>{formatValue(next)}</span>;

  if (Array.isArray(next)) {
    const prevArr = Array.isArray(prev) ? prev : [];

    const prevMap = new Map<string, AuditValue>();
    prevArr.forEach((item: AuditValue) => {
      const id = getItemId(item);
      if (id) prevMap.set(id, item);
    });

    const matched: { label: string; prev: AuditValue; next: AuditValue }[] = [];
    const added: AuditValue[] = [];

    next.forEach((item: AuditValue, i: number) => {
      const id = getItemId(item);
      if (id && prevMap.has(id)) {
        matched.push({
          label: getItemLabel(item, i),
          prev: prevMap.get(id),
          next: item,
        });
        prevMap.delete(id);
      } else {
        added.push(item);
      }
    });

    const deleted = Array.from(prevMap.values());

    if (deleted.length === 0 && added.length === 0 && matched.length > 0) {
      const prevOrder = prevArr.map(
        (item: AuditValue) => getItemId(item) || ''
      );
      const nextOrder = next.map((item: AuditValue) => getItemId(item) || '');
      const orderChanged =
        prevOrder.length === nextOrder.length &&
        prevOrder.some((id, i) => id !== nextOrder[i]);
      const contentChanged = matched.some(
        ({ prev: p, next: n }) => JSON.stringify(p) !== JSON.stringify(n)
      );

      if (orderChanged && !contentChanged) {
        return (
          <div
            className={depth > 0 ? 'ml-3 border-l pl-2 border-gray-200' : ''}>
            <div className="py-0.5">
              <span className="font-medium text-blue-600">
                Volgorde gewijzigd
              </span>
            </div>
          </div>
        );
      }
    }

    const elements: React.ReactNode[] = [];

    deleted.forEach((item, i) =>
      elements.push(
        <div key={`del-${i}`} className="py-0.5">
          <span className="font-medium text-red-600">
            - Verwijderd: {getItemLabel(item, i)}
          </span>
          <ItemDetails
            item={item}
            keys={getRelevantKeys(item)}
            variant="deleted"
          />
        </div>
      )
    );

    added.forEach((item, i) =>
      elements.push(
        <div key={`add-${i}`} className="py-0.5">
          <span className="font-medium text-green-700">
            + Toegevoegd: {getItemLabel(item, i)}
          </span>
          <ItemDetails
            item={item}
            keys={getRelevantKeys(item)}
            variant="added"
          />
        </div>
      )
    );

    matched.forEach(({ label, prev: p, next: n }, i) => {
      if (typeof n !== 'object' || typeof p !== 'object') return;
      const changed = Object.keys(n).filter(
        (k) => JSON.stringify(p[k]) !== JSON.stringify(n[k])
      );
      if (changed.length === 0) return;
      elements.push(
        <div key={`chg-${i}`} className="py-0.5">
          <span className="font-medium">{label}:</span>
          <div className="ml-3 border-l pl-2 border-gray-200">
            {changed.map((k) => (
              <FieldDiff key={k} label={k} oldVal={p[k]} newVal={n[k]} />
            ))}
          </div>
        </div>
      );
    });

    if (elements.length === 0) return null;
    return (
      <div className={depth > 0 ? 'ml-3 border-l pl-2 border-gray-200' : ''}>
        {elements}
      </div>
    );
  }

  if (next && typeof next === 'object' && !Array.isArray(next)) {
    const prevObj = prev && typeof prev === 'object' ? prev : {};
    const allKeys = Array.from(
      new Set([...Object.keys(prevObj), ...Object.keys(next)])
    );
    const changed = allKeys.filter(
      (k) => JSON.stringify(prevObj[k]) !== JSON.stringify(next[k])
    );
    if (changed.length === 0) return null;

    return (
      <div className={depth > 0 ? 'ml-3 border-l pl-2 border-gray-200' : ''}>
        {changed.map((k) => {
          const nv = next[k];
          if (nv && typeof nv === 'object') {
            return (
              <div key={k} className="py-0.5">
                <span className="font-medium">{fieldLabel(k)}:</span>
                <RenderDiff prev={prevObj[k]} next={nv} depth={depth + 1} />
              </div>
            );
          }
          return (
            <FieldDiff key={k} label={k} oldVal={prevObj[k]} newVal={nv} />
          );
        })}
      </div>
    );
  }

  return <FieldDiff label="" oldVal={prev} newVal={next} />;
}

export default function ChangesDisplay({
  previousData,
  newData,
  action,
}: {
  previousData: Record<string, AuditValue> | null;
  newData: Record<string, AuditValue> | null;
  action: string;
}) {
  if (action === 'GET' || action === 'login' || action === 'logout') {
    if (newData && Object.keys(newData).length > 0) {
      return (
        <div className="text-xs text-muted-foreground">
          {Object.entries(newData).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{fieldLabel(key)}:</span>{' '}
              {formatValue(value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  if (!previousData && !newData) return null;

  if (action === 'DELETE' && previousData) {
    return (
      <div className="text-xs text-muted-foreground">
        <RenderDiff prev={undefined} next={previousData} />
      </div>
    );
  }

  return (
    <div className="text-xs text-muted-foreground">
      <RenderDiff prev={previousData || {}} next={newData || {}} />
    </div>
  );
}
