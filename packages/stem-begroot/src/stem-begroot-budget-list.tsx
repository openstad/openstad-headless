import './stem-begroot-budget-list.css';
import React from 'react';
import {
  Banner,
  Button,
  Image,
  PlainButton,
  SecondaryButton,
  Spacer,
} from '@openstad-headless/ui/src';

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
          <div className="budget-used-list">
            {selectedResources.map((resource) => (
              <Button style={{ flex: maxBudget % resource.budget }}>
                &euro;{resource.budget || 0}
              </Button>
            ))}
            <PlainButton
              style={{ flex: selectedResources.length === 0 ? 1 : 0 }}
              className="osc-stem-begroot-budget-list-budget-left-indication">
              &euro;{Math.max(maxBudget - budgetUsed, 0)}
            </PlainButton>
          </div>

          <div className="stem-begroot-helptext-and-budget-section-helptext">
            <p>
              Kies uit onderstaand overzicht jouw favoriete plannen. Selecteer
              voor maximaal €{maxBudget},- aan plannen. In stap 3 vul je ter
              controle de stemcode in die je per post hebt ontvangen. Tot slot
              verstuur je in stap 4 je stem.
            </p>
          </div>
        </div>

        <aside className="stem-begroot-helptext-and-budget-section-budget">
          <h5>Totaal budget</h5>
          <Spacer size={0.5} />

          <div className="info-budget-label">
            <p>Budget gekozen:</p>
            <p className="strong">&euro;{budgetUsed}</p>
          </div>
          <Spacer size={0.5} />
          <div className="info-budget-label">
            <p>Budget over:</p>
            <p className="strong">&euro;{maxBudget}</p>
          </div>
        </aside>
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
                  className="budget-list-selection-indicaction"
                  src={resource.images?.at(0)?.src || ''}
                />
              ))}
            </div>
          )}

          {!canAddMore ? (
            <div className="budget-list-status-container">
              <p className="budget-list-status-text strong">Kan niet meer toevoegen</p>
              <p className="budget-list-status-text">Onvoldoende budget</p>
            </div>
          ) : null}
        </div>
        <div></div>
      </section>
    </>
  );
};
