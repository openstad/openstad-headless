import './resource-detail.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Image, Spacer } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Paragraph, Heading4, Heading5, Heading6 } from "@utrecht/component-library-react";

export type ResourceDetailWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
  } & {
    displayImage?: boolean;
    displayTitle?: boolean;
    displaySummary?: boolean;
    displayDescription?: boolean;
    displayUser?: boolean;
    displayDate?: boolean;
    displayBudget?: boolean;
    displayLocation?: boolean;
    displayBudgetDocuments?: boolean;
  };

function ResourceDetail(props: ResourceDetailWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  var resourceId = (urlParams.get('openstadResourceId')
  ? parseInt(urlParams.get('openstadResourceId') as string)
  : 1);

  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: resourceId,
    api: props.api,
  }); 
  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  if (!resource) return null;
  return (
    <div className="osc">
      <Spacer size={2} />
      <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
        {resource ? (
          <article className="osc-resource-detail-content-items">

            {props.displayImage && resource.images?.at(0)?.src && (
              <Image
                src={resource.images?.at(0)?.src || ''}
                onClick={() => console.log({ resource })}
                imageFooter={
                  <div>
                    <Paragraph className="osc-resource-detail-content-item-status">
                      {resource.status === 'OPEN' ? 'Open' : 'Gesloten'}
                    </Paragraph>
                  </div>
                }
              />
            )}

            {props.displayTitle && resource.title && <Heading4>{resource.title}</Heading4>}
            <div className="osc-resource-detail-content-item-row">
              {/* {props.displayBudgetDocuments &&
              resource?.extraData?.budgetDocuments?.name && (
                <div>
                  <Heading6 className="osc-resource-detail-content-item-title">
                    Bestanden
                  </Heading6>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.extraData.budgetDocuments.name}
                  </span>
                </div>
              )} */}
              {props.displayUser && resource?.user?.name && (
                <div>
                  <Heading6 className="osc-resource-detail-content-item-title">
                    Naam
                  </Heading6>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.user.name}
                  </span>
                </div>
              )}
              {props.displayDate && resource.startDateHumanized && (
                <div>
                  <Heading6 className="osc-resource-detail-content-item-title">
                    Datum
                  </Heading6>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.startDateHumanized}
                  </span>
                </div>
              )}
              {props.displayBudget && resource.budget && (
                <div>
                  <Heading6 className="osc-resource-detail-content-item-title">
                    Budget
                  </Heading6>
                  <span className="osc-resource-detail-content-item-text">
                    {`€ ${resource.budget}`}
                  </span>
                </div>
              )}
            </div>
            <div>
              {props.displaySummary && <Heading5>{resource.summary}</Heading5>}
              {props.displayDescription && <Paragraph>{resource.description}</Paragraph>}
            </div>
            {props.displayLocation && resource.position && (
              <>
                <Heading4>Plaats</Heading4>
                <Paragraph className="osc-resource-detail-content-item-location">
                  {`${resource.position.lat}, ${resource.position.lng}`}
                </Paragraph>
              </>
            )}
          </article>
        ) : (
          <span>resource niet gevonden..</span>
        )}
      </section>
    </div>
  );
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
