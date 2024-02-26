import React, { Fragment } from 'react';
import { Spacer } from '@openstad-headless/ui/src';
import { BudgetStatusPanel } from '../reuseables/budget-status-panel';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading5, Paragraph, Strong } from "@utrecht/component-library-react";

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
        <Spacer size={2} />

        {selectedResources.map((resource) => (
          <Fragment key={`budget-overview-row-${resource.id}`}>
            <div className="budget-two-text-row-spaced">
              <Paragraph>{resource.title}</Paragraph>
              {typeIsBudgeting ? (
                <Paragraph><Strong>{resource.budget}</Strong></Paragraph>
              ) : null}
            </div>
            <Spacer size={1} />
          </Fragment>
        ))}

        <Spacer size={2} />
        <div className="budget-two-text-row-spaced">
          {typeIsBudgeting ? (
            <Heading5>Totaal gebruikt budget</Heading5>
          ) : (
            <Heading5>Aantal gekozen plannen</Heading5>
          )}
          {typeIsBudgeting ? (
            <Heading5>&euro;{budgetUsed}</Heading5>
          ) : (
            <Heading5>{selectedResources.length}</Heading5>
          )}
        </div>
      </div>

      {typeIsBudgeting ? (
        <div className="budget-unused-panel-step-2 budget-two-text-row-spaced">
          <Paragraph className="strong">Ongebruikt budget:</Paragraph>
          <Paragraph className="strong">&euro;{maxBudget - budgetUsed}</Paragraph>
        </div>
      ) : (
        <div className="budget-unused-panel-step-2 budget-two-text-row-spaced">
          <Paragraph><Strong>Aantal beschikbare plannen</Strong></Paragraph>
          <Paragraph>
            <Strong>
              {Math.max(maxNrOfResources - selectedResources.length, 0)}
            </Strong>
          </Paragraph>
        </div>
      )}
    </>
  );
};
