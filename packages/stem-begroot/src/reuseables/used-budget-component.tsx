import React, { useEffect } from 'react';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Paragraph } from "@utrecht/component-library-react";
export const BudgetUsedList = ({
  maxBudget,
  budgetUsed,
  selectedBudgets,
}: {
  selectedBudgets: Array<number>;
  maxBudget: number;
  budgetUsed: number;
}) => {

  let sortedBudgets = [...selectedBudgets];
  sortedBudgets = sortedBudgets.sort((r1, r2) => r2 - r1);

  useEffect(() => {
    document.documentElement.style.setProperty('--osc-budget-left', Math.max(maxBudget - budgetUsed, 0).toString());

    selectedBudgets.forEach((budget, index) => {
      document.documentElement.style.setProperty(`--osc-budget-${index}`, budget.toString());
    });
  }, [maxBudget, budgetUsed, selectedBudgets]);

  return (
    <>
      <div className="budget-used-list" role="status">
        {sortedBudgets.map((budget, index) => (
          <div
            key={`budget-item-${budget}-${index}`}
            className={`budget-badge budget-badge-primary osc-budget-${index}`}
          >
            <Paragraph>&euro;{budget.toLocaleString('nl-NL') || 0}</Paragraph>
          </div>
        ))}
        <div
          className="osc-stem-begroot-budget-list-budget-left-indication budget-badge budget-badge-plain">
          <Paragraph>&euro;{Math.max(maxBudget - budgetUsed, 0).toLocaleString('nl-NL')}</Paragraph>
        </div>
      </div>
      <div className="total-budget" role="status">
        <Paragraph>Totaal: &euro;{maxBudget.toLocaleString('nl-NL')},</Paragraph>
        <Paragraph>Gebruikt: &euro;{budgetUsed.toLocaleString('nl-NL')}</Paragraph>
      </div>
    </>
  );
};
