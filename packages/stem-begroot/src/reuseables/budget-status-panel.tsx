import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';

export const BudgetStatusPanel = ({
  budgetUsed,
  maxBudget,
}: {
  budgetUsed: number;
  maxBudget: number;
}) => {
  return (
    <aside className="stem-begroot-helptext-and-budget-section-budget">
      <h5>Totaal budget</h5>
      <Spacer size={0.5} />

      <div className="info-budget-label">
        <p>Budget gekozen:</p>
        <p className="strong">&euro;{budgetUsed}</p>
      </div>
      <Spacer size={0.5} />
      <div className="info-budget-label">
        <p>Budget over:</p>
        <p className="strong">&euro;{maxBudget}</p>
      </div>
    </aside>
  );
};
