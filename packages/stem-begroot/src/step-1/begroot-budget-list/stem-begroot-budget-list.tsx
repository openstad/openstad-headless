import { IconButton, Image, Spacer } from '@openstad-headless/ui/src';
import '@utrecht/component-library-css';
import {
  Button,
  Heading5,
  Paragraph,
  Strong,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React, { Dispatch, SetStateAction } from 'react';

import { BudgetStatusPanel } from '../../reuseables/budget-status-panel';
import { TagType } from '../../stem-begroot';
import './stem-begroot-budget-list.css';

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
  tagsToDisplay,
  activeTagTab = '',
  typeIsPerTag = false,
  setActiveTagTab,
  step1MaxText = '',
  tagCounter = [],
}: {
  allResourceInList: Array<any>;
  selectedResources: Array<any>;
  maxBudget: number;
  typeIsBudgeting: boolean;
  maxNrOfResources: number;
  introText?: string;
  showInfoMenu?: boolean;
  decideCanAddMore: () => boolean;
  onSelectedResourceRemove: (resource: { id: number; budget: number }) => void;
  step1Title: string;
  resourceCardTitle: string;
  panelTitle?: string;
  budgetChosenTitle?: string;
  budgetRemainingTitle?: string;
  tagsToDisplay?: Array<string>;
  activeTagTab?: string;
  typeIsPerTag?: boolean;
  setActiveTagTab?: Dispatch<SetStateAction<string>>;
  step1MaxText?: string;
  tagCounter?: Array<TagType>;
}) => {
  const canAddMore = decideCanAddMore();

  let filteredResources = selectedResources;

  if (typeIsPerTag && !!tagCounter && !!activeTagTab) {
    const tagObj = tagCounter.find(
      (tagObj) => Object.keys(tagObj)[0] === activeTagTab
    );
    if (tagObj) {
      filteredResources = tagObj[activeTagTab]?.selectedResources;
    }
  }

  const budgetUsed = filteredResources.reduce(
    (total, cv) => total + cv.budget,
    0
  );

  return (
    <>
      {(showInfoMenu || !!introText) && (
        <section className="stem-begroot-budget-list">
          {!!introText && (
            <div className="stem-begroot-budget-list-used-budgets">
              <div className="stem-begroot-helptext-and-budget-section-helptext">
                <Paragraph>{introText}</Paragraph>
              </div>
            </div>
          )}
          {showInfoMenu && (
            <BudgetStatusPanel
              typeIsBudgeting={typeIsBudgeting}
              maxNrOfResources={maxNrOfResources}
              nrOfResourcesSelected={filteredResources.length}
              maxBudget={maxBudget}
              budgetUsed={budgetUsed}
              showInfoMenu={showInfoMenu}
              title={panelTitle}
              budgetChosenTitle={budgetChosenTitle}
              budgetRemainingTitle={budgetRemainingTitle}
            />
          )}
        </section>
      )}
      <section className="budget-list-container">
        <Heading5>{step1Title}</Heading5>
        {!canAddMore && allResourceInList.length > 0 ? (
          <Paragraph className="budget-list-status-text helptext error">
            {typeIsBudgeting
              ? step1MaxText || 'Onvoldoende budget'
              : step1MaxText || 'Maximaal aantal plannen bereikt'}
          </Paragraph>
        ) : null}

        <Spacer size={1} />
        <div className="budget-list-selections">
          <div
            className="budget-list-selection-indicaction-container"
            role="status">
            {filteredResources.map((resource) => {
              let defaultImage = '';

              interface Tag {
                name: string;
                defaultResourceImage?: string;
              }
              if (Array.isArray(resource?.tags)) {
                const sortedTags = resource.tags.sort((a: Tag, b: Tag) =>
                  a.name.localeCompare(b.name)
                );
                const tagWithImage = sortedTags.find(
                  (tag: Tag) => tag.defaultResourceImage
                );
                defaultImage = tagWithImage?.defaultResourceImage || '';
              }

              const resourceImages =
                Array.isArray(resource.images) && resource.images.length > 0
                  ? resource.images?.at(0)?.url
                  : defaultImage;
              const hasImages = !!resourceImages
                ? ''
                : 'resource-has-no-images';
              return (
                <Image
                  imageHeader={
                    <div className="iconButton--container">
                      <IconButton
                        onClick={() => {
                          onSelectedResourceRemove(resource);
                        }}
                        className="primary-action-button"
                        icon="ri-close-line"
                        iconOnly={true}
                        text={`${resource.title} verwijderen uit selectie`}
                      />
                    </div>
                  }
                  key={`resource-detail-image-${resource.id}`}
                  className={`budget-list-selection-indicaction ${hasImages}`}
                  src={resourceImages}
                />
              );
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

        {typeIsPerTag && !!tagsToDisplay && (
          <div className="themes-container">
            {tagsToDisplay?.map((tag: string) => (
              <div
                className={`theme ${tag === activeTagTab ? 'active' : ''}`}
                key={tag}>
                <Button
                  appearance="primary-action-button"
                  disabled={tag === activeTagTab}
                  onClick={() => {
                    if (!!setActiveTagTab) {
                      setActiveTagTab(tag);
                    }
                  }}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};
