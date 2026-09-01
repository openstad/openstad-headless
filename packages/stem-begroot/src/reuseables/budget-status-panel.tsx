import { Spacer } from '@openstad-headless/ui/src';
import '@utrecht/component-library-css';
import { Heading, Paragraph, Strong } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

export const BudgetStatusPanel = ({
  budgetUsed,
  maxBudget,
  nrOfResourcesSelected,
  maxNrOfResources,
  typeIsBudgeting,
  showInfoMenu,
  title,
  budgetChosenTitle,
  budgetRemainingTitle,
  headingLevel = 4,
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
  headingLevel?: number;
}): React.JSX.Element => {
  return (
    <>
      {showInfoMenu && (
        <aside
          className="stem-begroot-helptext-and-budget-section-budget"
          role="status">
          {typeIsBudgeting ? (
            <>
              <Heading level={headingLevel} appearance="utrecht-heading-4">
                {title || 'Totaal budget'}
              </Heading>
              <ul>
                <li>
                  <Paragraph className="info-budget-label">
                    <span>{budgetChosenTitle || 'Budget gekozen:'}</span>
                    <span>
                      <Strong>
                        &euro;{budgetUsed.toLocaleString('nl-NL')}
                      </Strong>
                    </span>
                  </Paragraph>
                </li>
                <li>
                  <Paragraph className="info-budget-label">
                    <span>{budgetRemainingTitle || 'Budget over:'}</span>
                    <span className="strong">
                      <Strong>
                        &euro;
                        {Math.max(maxBudget - budgetUsed, 0).toLocaleString(
                          'nl-NL'
                        )}{' '}
                      </Strong>
                    </span>
                  </Paragraph>
                </li>
              </ul>
            </>
          ) : (
            <>
              {title && (
                <Heading level={headingLevel} appearance="utrecht-heading-4">
                  {title}
                </Heading>
              )}
              <ul>
                <li>
                  <Paragraph className="info-budget-label">
                    {budgetChosenTitle && <span>{budgetChosenTitle}</span>}
                    <span>
                      <Strong>{nrOfResourcesSelected}</Strong>
                    </span>
                  </Paragraph>
                </li>
                <li>
                  <Paragraph className="info-budget-label">
                    {budgetRemainingTitle && (
                      <span>{budgetRemainingTitle}</span>
                    )}
                    <span>
                      <Strong>
                        {Math.max(maxNrOfResources - nrOfResourcesSelected, 0)}
                      </Strong>
                    </span>
                  </Paragraph>
                </li>
              </ul>
            </>
          )}
        </aside>
      )}
    </>
  );
};
