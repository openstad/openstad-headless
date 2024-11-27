import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading4, Paragraph, Strong } from "@utrecht/component-library-react";

export const BudgetStatusPanel = ({
  budgetUsed,
  maxBudget,
  nrOfResourcesSelected,
  maxNrOfResources,
  typeIsBudgeting,
  showInfoMenu,
  title,
  budgetChosenTitle,
  budgetRemainingTitle
}: {
  typeIsBudgeting: boolean;
  nrOfResourcesSelected: number;
  maxNrOfResources: number;
  budgetUsed: number;
  maxBudget: number;
  showInfoMenu?: boolean;
  title?: string;
  budgetChosenTitle?: string;
  budgetRemainingTitle?: string;
  }): JSX.Element => {
  return (
    <>
      {showInfoMenu && (
        <aside className="stem-begroot-helptext-and-budget-section-budget" role="status">
          {typeIsBudgeting ? (
            <>
              <Heading4>{title || 'Totaal budget'}</Heading4>
              <Paragraph className="info-budget-label">
                <span>{budgetChosenTitle || 'Budget gekozen:'}</span>
                <span><Strong>&euro;{budgetUsed.toLocaleString('nl-NL')}</Strong></span>
              </Paragraph>
              <Paragraph className="info-budget-label">
                <span>{budgetRemainingTitle || 'Budget over:'}</span>
                <span className="strong">
                  <Strong>&euro;{Math.max(maxBudget - budgetUsed, 0).toLocaleString('nl-NL')} </Strong>
                </span>
              </Paragraph>
            </>
          ) : (
            <>
              {title && (<Heading4>{title}</Heading4>)}
              <Paragraph className="info-budget-label">
                {budgetChosenTitle && (<span>{budgetChosenTitle}</span>)}
                <span><Strong>{nrOfResourcesSelected}</Strong></span>
              </Paragraph>
              <Paragraph className="info-budget-label">
                {budgetRemainingTitle && (<span>{budgetRemainingTitle}</span>)}
                <span>
                  <Strong>{Math.max(maxNrOfResources - nrOfResourcesSelected, 0)}</Strong>
                </span>
              </Paragraph>
            </>
          )}
        </aside>
      )}
    </>
  );
};
