// @ts-nocheck
import {ChoiceOptions, WeightOverview} from '../props';

export const InitializeWeights = (
  items: any[],
  choiceOptions: ChoiceOptions[],
  choicesType: string,
  hiddenFields: string[]
) => {
  let weights: WeightOverview = {};

  if (choicesType === 'plane') {
    choiceOptions = [{id: 'plane'}];
  }

  if ( choiceOptions.length < 1 ) return {};

  choiceOptions.forEach((choiceOption) => {
    const id = choiceOption.id;
    // Prevent prototype pollution. Needed for security warning #216.
    if (id === '__proto__' || id === 'constructor' || id === 'prototype') return;

    items.forEach((item) => {
      const itemType = item.type || '';
      const allowedTypes = ["radiobox", "checkbox", "select", "a-b-slider"];

      if (!allowedTypes.includes(itemType) || !itemType) return;

      const { trigger, weights: itemWeights = {} } = item;
      const triggerKey = `${itemType}-${trigger}`

      if (hiddenFields?.includes(triggerKey)) return;

      // @ts-ignore
      if (
        itemWeights
        && trigger
        && Object.keys(itemWeights).length > 0
        && typeof ( itemWeights[id] ) !== 'undefined'
        && Object.keys(itemWeights[id]).length > 0
      ) {
        if (!weights[id]) {
          weights[id] = {};
        }

        if (!weights[id][triggerKey]) {
          weights[id][triggerKey] = {};
        }

        const groupWeights = itemWeights[id];

        ['weightX', 'weightY', 'weightAB', 'weightABY'].forEach((key) => {
          if (groupWeights[key] !== undefined) {
            const dimension = key.replace('weight', '').toLowerCase();

            const isAB = dimension === 'ab';
            const isABY = dimension === 'aby';
            const value = (isAB || isABY)
              ? groupWeights[key]
              : parseInt(groupWeights[key], 10);

            weights[id][triggerKey][dimension] = value;
          }
        });

        if (groupWeights.choice) {
          Object.entries(groupWeights.choice).forEach(([choiceKey, choiceWeight]) => {
            if (!weights[id][triggerKey][choiceKey]) {
              weights[id][triggerKey][choiceKey] = {};
            }

            ['weightX', 'weightY'].forEach((key) => {
              if (choiceWeight[key] !== undefined) {
                const dimension = key.replace('weight', '').toLowerCase();
                weights[id][triggerKey][choiceKey][dimension] = parseInt(choiceWeight[key], 10);
              }
            });
          });
        }
      }
    });
  });

  return weights;
};