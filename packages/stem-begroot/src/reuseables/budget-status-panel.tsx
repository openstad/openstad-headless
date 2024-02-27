import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading5, Paragraph, Strong } from "@utrecht/component-library-react";

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
          <Heading5>Totaal budget</Heading5>

          <Paragraph className="info-budget-label">
            <span>Budget gekozen:</span>
            <span><Strong>&euro;{budgetUsed}</Strong></span>
          </Paragraph>
          <Paragraph className="info-budget-label">
            <span>Budget over:</span>
            <span className="strong">
              <Strong>&euro;{Math.max(maxBudget - budgetUsed, 0)} </Strong>
            </span>
          </Paragraph>
        </>
      ) : (
        <>
          <Heading5>Totaal aantal plannen</Heading5>

          <Paragraph className="info-budget-label">
            <span>Gekozen plannen:</span>
            <span><Strong>{nrOfResourcesSelected}</Strong></span>
          </Paragraph>
          <Paragraph className="info-budget-label">
            <span>Beschikbare plannen:</span>
            <span>
              <Strong>{Math.max(maxNrOfResources - nrOfResourcesSelected, 0)}</Strong>
            </span>
          </Paragraph>
        </>
      )}
    </aside>
  );
};
