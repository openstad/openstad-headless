import React from 'react';
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
  sortedBudgets = sortedBudgets.sort((r1, r2) => r2-r1);

  return (
    <div className="budget-used-list">
      {sortedBudgets.map((budget,index) => (
        <div
        key={`budget-item-${budget}-${index}`}
          className="budget-badge budget-badge-primary"
          style={{ flex: budget }}>
          <Paragraph>&euro;{budget || 0}</Paragraph>
        </div>
      ))}
      <div
        style={{ flex: Math.max(maxBudget - budgetUsed, 0)}}
        className="osc-stem-begroot-budget-list-budget-left-indication budget-badge budget-badge-plain">
        <Paragraph>&euro;{Math.max(maxBudget - budgetUsed, 0)}</Paragraph>
      </div>
    </div>
  );
};
