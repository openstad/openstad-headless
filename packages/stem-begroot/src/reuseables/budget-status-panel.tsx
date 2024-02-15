import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';

export const BudgetStatusPanel = ({
  budgetUsed,
  maxBudget,
  nrOfResourcesSelected,
  maxNrOfResources,
  typeIsBudgeting,
}: {
  typeIsBudgeting: boolean;
  nrOfResourcesSelected: number;
  maxNrOfResources: number;
  budgetUsed: number;
  maxBudget: number;
}) => {
  return (
    <aside className="stem-begroot-helptext-and-budget-section-budget">
      {typeIsBudgeting ? (
        <>
          <h5>Totaal budget</h5>
          <Spacer size={0.5} />

          <div className="info-budget-label">
            <p>Budget gekozen:</p>
            <p className="strong">&euro;{budgetUsed}</p>
          </div>
          <Spacer size={0.5} />
          <div className="info-budget-label">
            <p>Budget over:</p>
            <p className="strong">
              &euro;{Math.max(maxBudget - budgetUsed, 0)}
            </p>
          </div>
        </>
      ) : (
        <>
          <h5>Totaal aantal plannen</h5>
          <Spacer size={0.5} />

          <div className="info-budget-label">
            <p>Gekozen plannen:</p>
            <p className="strong">{nrOfResourcesSelected}</p>
          </div>
          <Spacer size={0.5} />
          <div className="info-budget-label">
            <p>Beschikbare plannen:</p>
            <p className="strong">
              {Math.max(maxNrOfResources - nrOfResourcesSelected, 0)}
            </p>
          </div>
        </>
      )}
    </aside>
  );
};
