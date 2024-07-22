import {ChoiceOptions, WeightOverview} from '../props';

export const InitializeWeights = (items: any[], choiceOptions: ChoiceOptions[]) => {
  let weights: WeightOverview = {};

  if ( choiceOptions.length < 1 ) return {};

  choiceOptions.forEach((choiceOption) => {
    const id = choiceOption.id;

    items.forEach((item) => {
      const { trigger, weights: itemWeights = {} } = item;
      const triggerKey = `${item.type}-${trigger}`

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

        ['weightX', 'weightY'].forEach((key) => {
          if (groupWeights[key] !== undefined) {
            const dimension = key.replace('weight', '').toLowerCase();
            weights[id][triggerKey][dimension] = parseInt(groupWeights[key], 10);
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