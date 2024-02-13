import React from 'react';

export const BudgetUsedList = ({
  maxBudget,
  budgetUsed,
  selectedBudgets,
}: {
  selectedBudgets: Array<number>;
  maxBudget: number;
  budgetUsed: number;
}) => {
  return (
    <div className="budget-used-list">
      {selectedBudgets.map((budget) => (
        <div
          className="budget-badge budget-badge-primary"
          style={{ flex: maxBudget % budget }}>
          <p>&euro;{budget || 0}</p>
        </div>
      ))}
      <div
        style={{ flex: selectedBudgets.length === 0 ? 1 : 0 }}
        className="osc-stem-begroot-budget-list-budget-left-indication budget-badge budget-badge-plain">
        <p>&euro;{Math.max(maxBudget - budgetUsed, 0)}</p>
      </div>
    </div>
  );
};
