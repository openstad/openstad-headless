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
  minNrOfResources = 0,
  minRemainingTitle = '',
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
  minNrOfResources?: number;
  minRemainingTitle?: string;
  headingLevel?: number;
}): React.JSX.Element => {
  const showMinRemaining = !!minRemainingTitle && minNrOfResources > 0;

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
                        {`€${budgetUsed.toLocaleString('nl-NL')}`}
                      </Strong>
                    </span>
                  </Paragraph>
                </li>
                <li>
                  <Paragraph className="info-budget-label">
                    <span>{budgetRemainingTitle || 'Budget over:'}</span>
                    <span className="strong">
                      <Strong>
                        {`€${Math.max(maxBudget - budgetUsed, 0).toLocaleString(
                          'nl-NL'
                        )} `}
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
                {showMinRemaining && (
                  <li>
                    <Paragraph className="info-budget-label info-budget-label--min-remaining">
                      <span>{minRemainingTitle}</span>
                      <span>
                        <Strong>
                          {Math.max(
                            minNrOfResources - nrOfResourcesSelected,
                            0
                          )}
                        </Strong>
                      </span>
                    </Paragraph>
                  </li>
                )}
              </ul>
            </>
          )}
        </aside>
      )}
    </>
  );
};
