import React from 'react';
import { Spacer } from '@openstad-headless/ui/src';
import { BudgetStatusPanel } from '../reuseables/budget-status-panel';

type Props = {
  selectedResources: Array<any>;
  budgetUsed: number;
  maxBudget: number;
  introText?: string;
};

export const BegrotenSelectedOverview = ({
  budgetUsed,
  maxBudget,
  selectedResources,
  introText = '',
}: Props) => {
  return (
    <>
      <div className="begroot-step-2-instruction-budget-status-panel">
        <p>{introText}</p>
        <BudgetStatusPanel maxBudget={maxBudget} budgetUsed={budgetUsed} />
      </div>

      <Spacer size={1.5} />
      <div className="budget-overview-panel">
        <h5>Overzicht van mijn selectie</h5>
        <Spacer size={2} />
        {selectedResources.map((resource) => (
          <>
            <div className="budget-two-text-row-spaced">
              <p>{resource.title}</p>
              <p className="strong">&euro;{resource.budget}</p>
            </div>
            <Spacer size={1} />
          </>
        ))}

        <Spacer size={2} />
        <div className="budget-two-text-row-spaced">
          <h5>Totaal gebruikt budget</h5>
          <h5>&euro;{budgetUsed}</h5>
        </div>
      </div>
      <div className="budget-unused-panel-step-2 budget-two-text-row-spaced">
        <p className="strong">Ongebruikt budget:</p>
        <p className="strong">&euro;{maxBudget - budgetUsed}</p>
      </div>
    </>
  );
};
