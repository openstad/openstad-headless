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
  allResourceInList = [],
  maxBudget,
  typeIsBudgeting,
  maxNrOfResources,
  showInfoMenu,
  decideCanAddMore,
  onSelectedResourceRemove,
  step1Title,
  resourceCardTitle,
  panelTitle,
  budgetChosenTitle,
  budgetRemainingTitle,
}: {
  allResourceInList: Array<any>
  selectedResources: Array<any>;
  maxBudget: number;
  typeIsBudgeting: boolean;
  maxNrOfResources: number;
  introText?: string;
  showInfoMenu?: boolean;
  decideCanAddMore: () => boolean;
  onSelectedResourceRemove: (resource: { id: number }) => void;
  step1Title: string;
  resourceCardTitle: string;
  panelTitle?: string;
  budgetChosenTitle?: string;
  budgetRemainingTitle?: string;
}) => {
  const budgetUsed = selectedResources.reduce(
    (total, cv) => total + cv.budget,
    0
  );

  const canAddMore = decideCanAddMore();

  return (
    <>
      {showInfoMenu && (
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
            showInfoMenu={showInfoMenu}
            title={panelTitle}
            budgetChosenTitle={budgetChosenTitle}
            budgetRemainingTitle={budgetRemainingTitle}
          />
        </section>
      )}
      <section className="budget-list-container">
        <Heading5>{step1Title}</Heading5>
        {!canAddMore && allResourceInList.length > 0 ? (
          <Paragraph className="budget-list-status-text helptext error">
            {typeIsBudgeting
              ? 'Onvoldoende budget'
              : 'Maximaal aantal plannen bereikt'}
          </Paragraph>
        ) : null}

        <Spacer size={1} />
        <div className="budget-list-selections">
          <div className="budget-list-selection-indicaction-container" role="status">
            {selectedResources.map((resource) => {
              let defaultImage = '';

              interface Tag {
                name: string;
                defaultResourceImage?: string;
              }
              if (Array.isArray(resource?.tags)) {
                const sortedTags = resource.tags.sort((a: Tag, b: Tag) => a.name.localeCompare(b.name));
                const tagWithImage = sortedTags.find((tag: Tag) => tag.defaultResourceImage);
                defaultImage = tagWithImage?.defaultResourceImage || '';
              }

              const resourceImages = (Array.isArray(resource.images) && resource.images.length > 0) ? resource.images?.at(0)?.url : defaultImage;
              const hasImages = !!resourceImages ? '' : 'resource-has-no-images';

              return (
                <Image
                  imageHeader={
                    <div className='iconButton--container'>
                      <IconButton
                        onClick={() => {
                          onSelectedResourceRemove(resource);
                        }}
                        className="subtle-button"
                        icon="ri-close-line"
                        iconOnly={true}
                        text='Item verwijderen'
                      />
                    </div>
                  }
                  key={`resource-detail-image-${resource.id}`}
                  className={`budget-list-selection-indicaction ${hasImages}`}
                  src={resourceImages}
                />
              )
            })}

            {allResourceInList.length === 0 || canAddMore ? (
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
                  {resourceCardTitle || 'Selecteer een plan'}
              </Button>
            ) : null}
          </div>
        </div>
        <div></div>
      </section>
    </>
  );
};
