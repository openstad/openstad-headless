import { looseFormEqual } from './loose-equal';

type RoutedItem = {
  id?: string;
  trigger?: string;
  options?: Array<{ trigger?: string }>;
  routingSelectedQuestion?: string;
  routingSelectedAnswer?: string | string[];
};

type EditableOption = { id?: string; trigger?: string };

type MatrixEntry = { id?: string; trigger?: string; text?: string };

type EditableMatrix = {
  rows: MatrixEntry[];
  columns: MatrixEntry[];
  [key: string]: unknown;
};

export function routingTriggerMap(
  oldOptions: Array<{ trigger?: string }> = [],
  newOptions: Array<{ trigger?: string }> = []
): Record<string, string> {
  const triggerMap: Record<string, string> = {};
  for (let i = 0; i < Math.min(oldOptions.length, newOptions.length); i++) {
    if (oldOptions[i].trigger !== newOptions[i].trigger) {
      triggerMap[String(oldOptions[i].trigger)] = String(newOptions[i].trigger);
    }
  }
  return triggerMap;
}

export function mergeSelectedItem<T extends RoutedItem>(
  items: T[],
  selectedId: string,
  patch: Partial<T>
): T[] {
  const selected = items.find((item) => item.id === selectedId);
  if (!selected) return items;

  const triggerMap = routingTriggerMap(
    selected.options || [],
    patch.options || []
  );
  const hasTriggerChanges = Object.keys(triggerMap).length > 0;

  return items.map((item) => {
    if (item.id === selectedId) {
      return { ...item, ...patch };
    }
    if (
      hasTriggerChanges &&
      item.routingSelectedQuestion === selected.trigger
    ) {
      const answers = Array.isArray(item.routingSelectedAnswer)
        ? item.routingSelectedAnswer
        : item.routingSelectedAnswer
          ? [item.routingSelectedAnswer]
          : [];
      return {
        ...item,
        routingSelectedAnswer: answers.map(
          (answer) => triggerMap[answer] || answer
        ),
      };
    }
    return item;
  });
}

export function applySelectedOptionEdit<O extends EditableOption>(
  options: O[],
  selectedOption: O | null,
  formOptions: Array<EditableOption & Record<string, unknown>> | undefined,
  fieldDefaults: Record<string, unknown> = { titles: [] }
): O[] {
  if (!selectedOption) return options;
  return options
    .map((option) => {
      if (option.id === selectedOption.id) {
        const formOption = formOptions?.find(
          (o) => o.trigger === option.trigger
        );
        const edited: Record<string, unknown> = { ...option };
        Object.entries(fieldDefaults).forEach(([field, fallback]) => {
          edited[field] = formOption?.[field] || fallback;
        });
        return edited as O;
      }
      return typeof option?.trigger !== 'undefined' ? option : false;
    })
    .filter((option): option is O => option !== false);
}

export function applySelectedMatrixEdit<M extends EditableMatrix>(
  matrix: M,
  matrixOption: (MatrixEntry & { type: 'rows' | 'columns' }) | null,
  formMatrix: Partial<EditableMatrix> | undefined
): M {
  if (!matrixOption) return matrix;
  const type = matrixOption.type;
  return {
    ...matrix,
    [type]: matrix[type].map((entry) =>
      entry.id === matrixOption.id
        ? {
            ...entry,
            text:
              formMatrix?.[type]?.find((e) => e.trigger === entry.trigger)
                ?.text || '',
          }
        : entry
    ),
  };
}

export function fieldKeyError(
  items: Array<{ id?: string; fieldKey?: string }>,
  selectedId: string,
  fieldKey: string | undefined
): string | undefined {
  if (!fieldKey) return 'Key is verplicht';
  const isUnique = items.every(
    (item) => item.id === selectedId || item.fieldKey !== fieldKey
  );
  return isUnique ? undefined : 'Key moet uniek zijn';
}

export function ensureABDefaultsOnWeights(
  itemType: string | undefined,
  weights: Record<string, any>
) {
  if (itemType !== 'a-b-slider') return weights;

  const normalized = structuredClone(weights || {});

  Object.keys(normalized).forEach((groupId) => {
    const groupWeights = normalized[groupId];
    if (!groupWeights || typeof groupWeights !== 'object') return;

    if (typeof groupWeights.weightAB === 'undefined') {
      groupWeights.weightAB = 'A';
    }

    if (
      typeof groupWeights.weightY !== 'undefined' &&
      typeof groupWeights.weightABY === 'undefined'
    ) {
      groupWeights.weightABY = 'A';
    }
  });

  return normalized;
}

export function mergeChoiceGuideWeights(
  itemType: string | undefined,
  storedWeights: Record<string, any> | undefined,
  formWeights: Record<string, any> | undefined
) {
  return ensureABDefaultsOnWeights(itemType, {
    ...structuredClone(storedWeights || {}),
    ...structuredClone(ensureABDefaultsOnWeights(itemType, formWeights || {})),
  });
}

export function openItemChanged<T extends { id?: string }, V, S>(
  items: T[],
  openId: string | null,
  current: { values: V; state: S },
  baseline: { values: V; state: S },
  merge: (items: T[], openId: string, values: V, state: S) => T[]
): boolean {
  if (!openId || !items.some((item) => item.id === openId)) return false;
  return !looseFormEqual(
    merge(items, openId, current.values, current.state),
    merge(items, openId, baseline.values, baseline.state)
  );
}
