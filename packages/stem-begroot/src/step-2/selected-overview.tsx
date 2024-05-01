import React, { Fragment } from 'react';
import { Image, Spacer } from '@openstad-headless/ui/src';
import { BudgetStatusPanel } from '../reuseables/budget-status-panel';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Heading5, Paragraph, Strong } from '@utrecht/component-library-react';

type Props = {
  selectedResources: Array<any>;
  budgetUsed: number;
  maxBudget: number;
  maxNrOfResources: number;
  introText?: string;
  typeIsBudgeting: boolean;
};

export const BegrotenSelectedOverview = ({
  budgetUsed,
  maxBudget,
  maxNrOfResources,
  selectedResources,
  introText = '',
  typeIsBudgeting,
}: Props) => {
  return (
    <>
      <div className="begroot-step-2-instruction-budget-status-panel">
        <Paragraph>{introText}</Paragraph>
        <BudgetStatusPanel
          typeIsBudgeting={typeIsBudgeting}
          maxNrOfResources={maxNrOfResources}
          nrOfResourcesSelected={selectedResources.length}
          maxBudget={maxBudget}
          budgetUsed={budgetUsed}
        />
      </div>

      <Spacer size={1.5} />
      <div className="budget-overview-panel">
        <Heading5>Overzicht van mijn selectie</Heading5>
        <Spacer size={1} />

        {selectedResources.map((resource) => (
          <div key={`budget-overview-row-${resource.id}`} className="budget-two-text-row-spaced">
            <section className='budget-overview-row'>
              <Image
                height={'4rem'}
                width={'4rem'}
                src={resource.images?.at(0)?.url || ''}
              />
              <Paragraph>{resource.title}</Paragraph>
            </section>
            {typeIsBudgeting ? (
              <Paragraph>
                <Strong>&euro;{resource.budget?.toLocaleString('nl-NL') || 0}</Strong>
              </Paragraph>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
};
