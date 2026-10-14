import { describe, expect, it } from 'vitest';

import {
  applySelectedMatrixEdit,
  applySelectedOptionEdit,
  fieldKeyError,
  mergeChoiceGuideWeights,
  mergeSelectedItem,
  openItemChanged,
  routingTriggerMap,
} from './open-item-merge';

type TestOption = { id: string; trigger: string; titles: { key: string }[] };

type TestItem = {
  id: string;
  trigger: string;
  title: string;
  options?: TestOption[];
  routingSelectedQuestion?: string;
  routingSelectedAnswer?: string | string[];
};

const question: TestItem & { options: TestOption[] } = {
  id: 'q1',
  trigger: '1',
  title: 'Vervoer',
  options: [
    { id: 'o1', trigger: '0', titles: [{ key: 'Fiets' }] },
    { id: 'o2', trigger: '1', titles: [{ key: 'Auto' }] },
  ],
};

const routed: TestItem = {
  id: 'q2',
  trigger: '2',
  title: 'Waarom fiets?',
  routingSelectedQuestion: '1',
  routingSelectedAnswer: '0',
};

const other: TestItem = { id: 'q3', trigger: '3', title: 'Leeftijd' };

describe('routingTriggerMap', () => {
  it('maps the old trigger to the new one per position', () => {
    expect(
      routingTriggerMap(
        [{ trigger: '0' }, { trigger: '1' }],
        [{ trigger: '1' }, { trigger: '0' }]
      )
    ).toEqual({ '0': '1', '1': '0' });
  });

  it('is empty when the order did not change', () => {
    expect(routingTriggerMap([{ trigger: '0' }], [{ trigger: '0' }])).toEqual(
      {}
    );
  });
});

describe('mergeSelectedItem', () => {
  it('applies the patch to the selected item only', () => {
    const items = [question, routed, other];
    const result = mergeSelectedItem(items, 'q1', { title: 'Vervoermiddel' });

    expect(result[0]).toEqual({ ...question, title: 'Vervoermiddel' });
    expect(result[1]).toBe(routed);
    expect(result[2]).toBe(other);
  });

  it('remaps the routed answer when options were reordered', () => {
    const reordered = [question.options[1], question.options[0]];
    const result = mergeSelectedItem([question, routed, other], 'q1', {
      options: reordered,
    });

    expect(result[1].routingSelectedAnswer).toEqual(['1']);
    expect(result[2]).toBe(other);
  });

  it('remaps routed answers stored as a list', () => {
    const routedList = { ...routed, routingSelectedAnswer: ['0', '1'] };
    const reordered = [question.options[1], question.options[0]];
    const result = mergeSelectedItem([question, routedList], 'q1', {
      options: reordered,
    });

    expect(result[1].routingSelectedAnswer).toEqual(['1', '0']);
  });

  it('returns the list untouched when the item is gone', () => {
    const items = [question, other];
    expect(mergeSelectedItem(items, 'missing', { title: 'x' })).toBe(items);
  });
});

describe('applySelectedOptionEdit', () => {
  const formOptions = [
    { trigger: '0', titles: [{ key: 'Fiets of step' }] },
    { trigger: '1', titles: [{ key: 'Auto' }] },
  ];

  it('takes the titles of the selected option from the form', () => {
    const result = applySelectedOptionEdit(
      question.options,
      question.options[0],
      formOptions
    );

    expect(result[0].titles).toEqual([{ key: 'Fiets of step' }]);
    expect(result[1]).toBe(question.options[1]);
  });

  it('leaves the options alone without a selected option', () => {
    expect(applySelectedOptionEdit(question.options, null, formOptions)).toBe(
      question.options
    );
  });

  it('ignores text typed in the slot for a new option', () => {
    const withNewSlot = [
      { trigger: '0', titles: [{ key: 'Fiets' }] },
      { trigger: '1', titles: [{ key: 'Auto' }] },
      { trigger: undefined, titles: [{ key: 'Nieuw' }] },
    ];
    const result = applySelectedOptionEdit(
      question.options,
      question.options[0],
      withNewSlot
    );

    expect(result).toHaveLength(2);
    expect(result[0].titles).toEqual([{ key: 'Fiets' }]);
  });
});

describe('applySelectedMatrixEdit', () => {
  const matrix = {
    rows: [{ id: 'r1', trigger: '0', text: 'Rij' }],
    columns: [{ id: 'c1', trigger: '0', text: 'Kolom' }],
  };

  it('updates the selected row', () => {
    const result = applySelectedMatrixEdit(
      matrix,
      { ...matrix.rows[0], type: 'rows' },
      { rows: [{ trigger: '0', text: 'Rij aangepast' }] }
    );

    expect(result.rows[0].text).toBe('Rij aangepast');
    expect(result.columns).toBe(matrix.columns);
  });

  it('updates the selected column', () => {
    const result = applySelectedMatrixEdit(
      matrix,
      { ...matrix.columns[0], type: 'columns' },
      { columns: [{ trigger: '0', text: 'Kolom aangepast' }] }
    );

    expect(result.columns[0].text).toBe('Kolom aangepast');
  });

  it('leaves the matrix alone without a selected entry', () => {
    expect(applySelectedMatrixEdit(matrix, null, {})).toBe(matrix);
  });
});

describe('fieldKeyError', () => {
  const items = [
    { id: 'q1', fieldKey: 'vervoer' },
    { id: 'q2', fieldKey: 'leeftijd' },
  ];

  it('requires a key', () => {
    expect(fieldKeyError(items, 'q1', '')).toBe('Key is verplicht');
  });

  it('rejects a key another item already uses', () => {
    expect(fieldKeyError(items, 'q1', 'leeftijd')).toBe('Key moet uniek zijn');
  });

  it('accepts the item keeping its own key', () => {
    expect(fieldKeyError(items, 'q1', 'vervoer')).toBeUndefined();
  });
});

describe('openItemChanged', () => {
  type Values = { title: string };
  type State = { options: typeof question.options };
  const merge = (
    list: (typeof question | typeof other)[],
    id: string,
    values: Values,
    state: State
  ) =>
    mergeSelectedItem(list, id, {
      title: values.title,
      options: state.options,
    });

  const baseline = {
    values: { title: 'Vervoer' },
    state: { options: question.options },
  };

  it('is unchanged right after opening', () => {
    expect(
      openItemChanged([question, other], 'q1', baseline, baseline, merge)
    ).toBe(false);
  });

  it('notices a changed title', () => {
    expect(
      openItemChanged(
        [question, other],
        'q1',
        { ...baseline, values: { title: 'Vervoermiddel' } },
        baseline,
        merge
      )
    ).toBe(true);
  });

  it('notices a changed option', () => {
    const edited = [
      { ...question.options[0], titles: [{ key: 'Step' }] },
      question.options[1],
    ];
    expect(
      openItemChanged(
        [question, other],
        'q1',
        { ...baseline, state: { options: edited } },
        baseline,
        merge
      )
    ).toBe(true);
  });

  it('stays unchanged when other items move', () => {
    expect(
      openItemChanged([other, question], 'q1', baseline, baseline, merge)
    ).toBe(false);
  });

  it('is unchanged when nothing is open or the item was deleted', () => {
    expect(openItemChanged([question], null, baseline, baseline, merge)).toBe(
      false
    );
    expect(openItemChanged([other], 'q1', baseline, baseline, merge)).toBe(
      false
    );
  });
});

describe('mergeChoiceGuideWeights', () => {
  const stored = { g1: { weightX: 2, weightAB: 'B' } };

  it('keeps the stored weights when the form has none', () => {
    expect(mergeChoiceGuideWeights('radiobox', stored, {})).toEqual(stored);
  });

  it('lets the form weights win over the stored ones', () => {
    expect(
      mergeChoiceGuideWeights('radiobox', stored, { g1: { weightX: 5 } })
    ).toEqual({ g1: { weightX: 5 } });
  });

  it('fills in the A default for an a-b slider', () => {
    expect(
      mergeChoiceGuideWeights('a-b-slider', undefined, {
        g2: { weightX: 1, weightY: 1 },
      })
    ).toEqual({
      g2: { weightX: 1, weightY: 1, weightAB: 'A', weightABY: 'A' },
    });
  });

  it('does not change the weights it was given', () => {
    const formWeights = { g2: { weightX: 1 } };
    mergeChoiceGuideWeights('a-b-slider', stored, formWeights);

    expect(formWeights).toEqual({ g2: { weightX: 1 } });
    expect(stored).toEqual({ g1: { weightX: 2, weightAB: 'B' } });
  });
});
