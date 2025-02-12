import React from 'react';
import { Image, Spacer } from '@openstad-headless/ui/src';
import { BudgetStatusPanel } from '../reuseables/budget-status-panel';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Heading, Heading3,Heading5, Paragraph, Strong } from '@utrecht/component-library-react';
import { TagType } from "../stem-begroot";

type Props = {
  selectedResources: Array<any>;
  budgetUsed: number;
  maxBudget: number;
  maxNrOfResources: number;
  introText?: string;
  typeIsBudgeting: boolean;
  showInfoMenu?: boolean;
  step2Title: string;
  panelTitle?: string;
  budgetChosenTitle?: string;
  budgetRemainingTitle?: string;
  typeIsPerTag?: boolean;
  tagCounter?: Array<TagType>;
};

export const BegrotenSelectedOverview = ({
  budgetUsed,
  maxBudget,
  maxNrOfResources,
  selectedResources,
  introText = '',
  typeIsBudgeting,
  showInfoMenu,
  step2Title,
  panelTitle,
  budgetChosenTitle,
  budgetRemainingTitle,
  typeIsPerTag = false,
  tagCounter = []
}: Props) => {
  let resourcesToShow = selectedResources;

  if (typeIsPerTag) {
    resourcesToShow = tagCounter.reduce((acc: Array<any>, tagObj) => {
      const tagKey = Object.keys(tagObj)[0];
      const tagResources = tagObj[tagKey].selectedResources;
      return [...acc, ...tagResources];
    }, []);
  }

  return (
    <>
      {typeIsPerTag ? (
        <div className="begroot-step-2-instruction-budget-status-panel per-tag">
          <Paragraph>{introText}</Paragraph>
          <Spacer size={1}/>

          {tagCounter.map((tagObj) => {
            const tagName = Object.keys(tagObj)[0];
            const tagData = tagObj[tagName];

            return (
              <React.Fragment key={`selected-resources-${tagName}`}>
                <div className="tag-selected-resources-container" >
                  <Heading5>{tagName.charAt(0).toUpperCase() + tagName.slice(1)}</Heading5>
                  <Spacer size={1}/>
                  {tagData.selectedResources.map((resource) => {
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
                      <div key={`budget-overview-row-${resource.id}`} className="budget-two-text-row-spaced">
                        <section className={`budget-overview-row ${hasImages}`}>
                          <Image
                            className="budget-overview-image"
                            src={resourceImages}
                          />
                          <div className="budget-resource-container">
                            <Paragraph>{resource.title}</Paragraph>
                            {typeIsBudgeting ? (
                              <Paragraph>
                                <Strong>&euro;{resource.budget?.toLocaleString('nl-NL') || 0}</Strong>
                              </Paragraph>
                            ) : null}
                          </div>
                        </section>
                      </div>
                    );
                  })}
                </div>

                <div className="tag-panel-container">
                  {showInfoMenu && (
                    <BudgetStatusPanel
                      typeIsBudgeting={typeIsBudgeting}
                      maxNrOfResources={tagData.max}
                      nrOfResourcesSelected={tagData.current}
                      maxBudget={maxBudget}
                      budgetUsed={tagData.current}
                      showInfoMenu={showInfoMenu}
                      title={panelTitle}
                      budgetChosenTitle={budgetChosenTitle}
                      budgetRemainingTitle={budgetRemainingTitle}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="begroot-step-2-instruction-budget-status-panel">
          <Paragraph>{introText}</Paragraph>
          {showInfoMenu ? (
            <BudgetStatusPanel
              typeIsBudgeting={typeIsBudgeting}
              maxNrOfResources={maxNrOfResources}
              nrOfResourcesSelected={resourcesToShow.length}
              maxBudget={maxBudget}
              budgetUsed={budgetUsed}
              showInfoMenu={showInfoMenu}
              title={panelTitle}
              budgetChosenTitle={budgetChosenTitle}
              budgetRemainingTitle={budgetRemainingTitle}
            />
          ) :
            <Spacer size={1.5}/>
          }

          <Heading3 className='step2Title'>{step2Title}</Heading3>

          {resourcesToShow.map((resource) => {
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
              <>
              <React.Fragment key={`budget-overview-row-${resource.id}`}>
                <div className="budget-two-text-row-spaced">
                  <section className={`budget-overview-row ${hasImages}`}>
                    <Image
                      className="budget-overview-image"
                      src={resourceImages}
                    />
                    <div className="budget-resource-container">
                      <Paragraph>{resource.title}</Paragraph>
                      {typeIsBudgeting ? (
                        <Paragraph>
                          <Strong>&euro;{resource.budget?.toLocaleString('nl-NL') || 0}</Strong>
                        </Paragraph>
                      ) : null}
                    </div>
                  </section>
                </div>

              <Spacer size={1} />
            </React.Fragment>
            </>
            );
          })}
        </div>
      )}
    </>
  );
};
