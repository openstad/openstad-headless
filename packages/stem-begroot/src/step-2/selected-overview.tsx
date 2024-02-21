import React, { Fragment } from 'react';
import { Spacer } from '@openstad-headless/ui/src';
import { BudgetStatusPanel } from '../reuseables/budget-status-panel';

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
        <p>{introText}</p>
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
        <h5>Overzicht van mijn selectie</h5>
        <Spacer size={2} />

        {selectedResources.map((resource) => (
          <Fragment key={`budget-overview-row-${resource.id}`}>
            <div className="budget-two-text-row-spaced">
              <p>{resource.title}</p>
              {typeIsBudgeting ? (
                <p className="strong">{resource.budget}</p>
              ) : null}
            </div>
            <Spacer size={1} />
          </Fragment>
        ))}

        <Spacer size={2} />
        <div className="budget-two-text-row-spaced">
          {typeIsBudgeting ? (
            <h5>Totaal gebruikt budget</h5>
          ) : (
            <h5>Aantal gekozen plannen</h5>
          )}
          {typeIsBudgeting ? (
            <h5>&euro;{budgetUsed}</h5>
          ) : (
            <h5>{selectedResources.length}</h5>
          )}
        </div>
      </div>

      {typeIsBudgeting ? (
        <div className="budget-unused-panel-step-2 budget-two-text-row-spaced">
          <p className="strong">Ongebruikt budget:</p>
          <p className="strong">&euro;{maxBudget - budgetUsed}</p>
        </div>
      ) : (
        <div className="budget-unused-panel-step-2 budget-two-text-row-spaced">
          <p className="strong">Aantal beschikbare plannen</p>
          <p className="strong">
            {Math.max(maxNrOfResources - selectedResources.length, 0)}
          </p>
        </div>
      )}
    </>
  );
};
