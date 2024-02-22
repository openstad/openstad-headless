import './resource-detail.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Image, Spacer } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
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
  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: props.resourceId,
    api: props.api,
  });
  const {data:resource} = datastore.useResource(props);
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
                    <p className="osc-resource-detail-content-item-status">
                      {resource.status === 'OPEN' ? 'Open' : 'Gesloten'}
                    </p>
                  </div>
                }
              />
            )}

            {props.displayTitle && resource.title && <h4>{resource.title}</h4>}
            <div className="osc-resource-detail-content-item-row">
              {/* {props.displayBudgetDocuments &&
              resource?.extraData?.budgetDocuments?.name && (
                <div>
                  <h6 className="osc-resource-detail-content-item-title">
                    Bestanden
                  </h6>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.extraData.budgetDocuments.name}
                  </span>
                </div>
              )} */}
              {props.displayUser && resource?.user?.name && (
                <div>
                  <h6 className="osc-resource-detail-content-item-title">
                    Naam
                  </h6>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.user.name}
                  </span>
                </div>
              )}
              {props.displayDate && resource.startDateHumanized && (
                <div>
                  <h6 className="osc-resource-detail-content-item-title">
                    Datum
                  </h6>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.startDateHumanized}
                  </span>
                </div>
              )}
              {props.displayBudget && resource.budget && (
                <div>
                  <h6 className="osc-resource-detail-content-item-title">
                    Budget
                  </h6>
                  <span className="osc-resource-detail-content-item-text">
                    {`€ ${resource.budget}`}
                  </span>
                </div>
              )}
            </div>
            <div>
              {props.displaySummary && <h5>{resource.summary}</h5>}
              {props.displayDescription && <p>{resource.description}</p>}
            </div>
            {props.displayLocation && resource.position && (
              <>
                <h4>Plaats</h4>
                <p className="osc-resource-detail-content-item-location">
                  {`${resource.position.lat}, ${resource.position.lng}`}
                </p>
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
