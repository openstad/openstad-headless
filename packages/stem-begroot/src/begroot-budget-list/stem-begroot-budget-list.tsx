import './stem-begroot-budget-list.css';
import React from 'react';
import { BudgetUsedList } from '../reuseables/used-budget-component';
import { BudgetStatusPanel } from '../reuseables/budget-status-panel';
import { Image, Spacer } from '@openstad-headless/ui/src';

export const StemBegrootBudgetList = ({
  allResources = [],
  selectedResources = [],
  maxBudget,
}: {
  selectedResources: Array<any>;
  allResources: Array<any>;
  maxBudget: number;
}) => {
  const budgetUsed = selectedResources.reduce(
    (total, cv) => total + cv.budget,
    0
  );

  const canAddMore = allResources.some(
    (r) => r.budget < maxBudget - budgetUsed
  );

  return (
    <>
      <section className="stem-begroot-budget-list">
        <div className="stem-begroot-budget-list-used-budgets">
          <BudgetUsedList
            budgetUsed={budgetUsed}
            maxBudget={maxBudget}
            selectedResources={selectedResources}
          />

          <div className="stem-begroot-helptext-and-budget-section-helptext">
            <p>
              Kies uit onderstaand overzicht jouw favoriete plannen. Selecteer
              voor maximaal €{maxBudget},- aan plannen. In stap 3 vul je ter
              controle de stemcode in die je per post hebt ontvangen. Tot slot
              verstuur je in stap 4 je stem.
            </p>
          </div>
        </div>

        <BudgetStatusPanel budgetUsed={budgetUsed} maxBudget={maxBudget} />
      </section>
      <Spacer size={2} />
      <section className="stem-begroot-helptext-and-budget-section"></section>
      <section className="budget-list-container">
        <h5>Uw selecties</h5>
        <Spacer size={1} />
        <div className="budget-list-selections">
          {selectedResources.length === 0 ? (
            <div className="budget-list-action-hint-container">
              <p className="budget-list-status-text strong">
                Selecteer een plan
              </p>
            </div>
          ) : (
            <div className="budget-list-selection-indicaction-container">
              {selectedResources.map((resource) => (
                <Image
                  key={`resource-detail-image-${resource.id}`}
                  className="budget-list-selection-indicaction"
                  src={resource.images?.at(0)?.src || ''}
                />
              ))}
            </div>
          )}

          {!canAddMore ? (
            <div className="budget-list-status-container">
              <p className="budget-list-status-text strong">
                Kan niet meer toevoegen
              </p>
              <p className="budget-list-status-text">Onvoldoende budget</p>
            </div>
          ) : null}
        </div>
        <div></div>
      </section>
    </>
  );
};
