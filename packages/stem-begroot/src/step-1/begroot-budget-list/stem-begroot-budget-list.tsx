import './stem-begroot-budget-list.css';
import React from 'react';
import { BudgetStatusPanel } from '../../reuseables/budget-status-panel';
import { IconButton, Image, Spacer } from '@openstad-headless/ui/src';

export const StemBegrootBudgetList = ({
  introText = '',
  selectedResources = [],
  maxBudget,
  typeIsBudgeting,
  maxNrOfResources,
  decideCanAddMore,
  onSelectedResourceRemove
}: {
  selectedResources: Array<any>;
  maxBudget: number;
  typeIsBudgeting: boolean;
  maxNrOfResources: number;
  introText?: string;
  decideCanAddMore: () => boolean;
  onSelectedResourceRemove:(resource:{id:number}) =>void;
}) => {
  const budgetUsed = selectedResources.reduce(
    (total, cv) => total + cv.budget,
    0
  );

  const canAddMore = decideCanAddMore();

  return (
    <>
      <section className="stem-begroot-budget-list">
        <div className="stem-begroot-budget-list-used-budgets">
          <div className="stem-begroot-helptext-and-budget-section-helptext">
            <p>{introText}</p>
          </div>
        </div>

        <BudgetStatusPanel
          typeIsBudgeting={typeIsBudgeting}
          maxNrOfResources={maxNrOfResources}
          nrOfResourcesSelected={selectedResources.length}
          maxBudget={maxBudget}
          budgetUsed={budgetUsed}
        />
      </section>
      <Spacer size={2} />
      <section className="stem-begroot-helptext-and-budget-section"></section>
      <section className="budget-list-container">
        <h5>Uw selecties</h5>
        <Spacer size={1} />
        <div className="budget-list-selections">
          <div className="budget-list-selection-indicaction-container">
            {selectedResources.map((resource) => (
              <Image
              imageHeader={<div style={{width:'100%',display:'flex', justifyContent:'end', alignItems:'center'}}><IconButton 
                onClick={() => {
                  onSelectedResourceRemove(resource);
                }} 
              className='ghost negative' icon='ri-close-line'/></div>}
                key={`resource-detail-image-${resource.id}`}
                className="budget-list-selection-indicaction"
                src={resource.images?.at(0)?.src || ''}
              />
            ))}

            {canAddMore ? (
              <div
                className="budget-list-action-hint-container"
                onClick={() => {
                  const list = document.querySelector(
                    '#stem-begroot-resource-selections-list'
                  );
                  if (list) {
                    list.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }
                }}>
                <p className="budget-list-status-text strong">
                  Selecteer een plan
                </p>
              </div>
            ) : null}
          </div>

          {!canAddMore ? (
            <div className="budget-list-status-container">
              <p className="budget-list-status-text strong">
                Kan niet meer toevoegen
              </p>

              <p className="budget-list-status-text">
                {typeIsBudgeting
                  ? 'Onvoldoende budget'
                  : 'Maximaal aantal plannen bereikt'}
              </p>
            </div>
          ) : null}
        </div>
        <div></div>
      </section>
    </>
  );
};
