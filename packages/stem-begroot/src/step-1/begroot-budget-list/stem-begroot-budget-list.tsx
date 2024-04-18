import './stem-begroot-budget-list.css';
import React from 'react';
import { BudgetStatusPanel } from '../../reuseables/budget-status-panel';
import { IconButton, Image, Spacer } from '@openstad-headless/ui/src';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading5, Paragraph, Strong, Button } from "@utrecht/component-library-react";

export const StemBegrootBudgetList = ({
  introText = '',
  selectedResources = [],
  maxBudget,
  typeIsBudgeting,
  maxNrOfResources,
  decideCanAddMore,
  onSelectedResourceRemove,
}: {
  selectedResources: Array<any>;
  maxBudget: number;
  typeIsBudgeting: boolean;
  maxNrOfResources: number;
  introText?: string;
  decideCanAddMore: () => boolean;
  onSelectedResourceRemove: (resource: { id: number }) => void;
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
            <Paragraph>{introText}</Paragraph>
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
      <section className="budget-list-container">
        <Heading5>Uw selecties</Heading5>
        {!canAddMore ? (
          <Paragraph className="budget-list-status-text helptext error">
            {typeIsBudgeting
              ? `Onvoldoende budget of geen plannen gevonden voor uw zoekopdracht. ${selectedResources.length > 0?'Druk op volgende om verder te gaan met uw huidige selectie.': ''}`
              : 'Maximaal aantal plannen bereikt'}
          </Paragraph>
        ) : null}

        <Spacer size={1} />
        <div className="budget-list-selections">
          <div className="budget-list-selection-indicaction-container">
            {selectedResources.map((resource) => (
              <Image
                imageHeader={
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'end',
                      alignItems: 'center',
                    }}>
                    <IconButton
                      onClick={() => {
                        onSelectedResourceRemove(resource);
                      }}
                      className="subtle-button"
                      icon="ri-close-line"
                    />
                  </div>
                }
                key={`resource-detail-image-${resource.id}`}
                className="budget-list-selection-indicaction"
                src={resource.images?.at(0)?.url || ''}
              />
            ))}

            {canAddMore ? (
              <Button
                appearance="secondary-action-button"
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
                  Selecteer een plan
              </Button>
            ) : null}
          </div>
        </div>
        <div></div>
      </section>
    </>
  );
};
