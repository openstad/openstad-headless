import './stem-begroot.css';
import React, { useCallback, useState } from 'react';
import {
  Banner,
  Button,
  Carousel,
  Icon,
  Image,
  List,
  Paginator,
  PlainButton,
  SecondaryButton,
  Spacer,
  Stepper,
} from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { Dialog } from '@openstad-headless/ui/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { hasRole } from '@openstad-headless/lib';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { elipsize } from '@openstad-headless/lib/ui-helpers';
import { StemBegrootResourceDetail } from './stem-begroot-resource-detail';
import { StemBegrootBudgetList } from './stem-begroot-budget-list';

export type StemBegrootWidgetProps = BaseProps &
  ProjectSettingProps & { maxBudget: number };

function StemBegroot({ maxBudget = 0, ...props }: StemBegrootWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);

  const [currentUser] = datastore.useCurrentUser({ ...props });
  const isModerator = hasRole(currentUser, 'moderator');
  const [resources] = datastore.useResources({
    projectId: props.projectId,
  });

  // Replace with type when available from datastore
  const [selectedResources, setSelectedResources] = useState<any[]>([]);

  const budgetUsed = selectedResources.reduce(
    (total, cv) => total + cv.budget,
    0
  );
  const canAddMore = (resources?.records || []).some(
    (r: any) => r.budget < maxBudget - budgetUsed
  );

  return (
    <>
      <Dialog
        open={openDetailDialog}
        onOpenChange={setOpenDetailDialog}
        children={
          <Carousel
            startIndex={resourceDetailIndex}
            items={
              resources && resources?.records?.length > 0
                ? resources.records
                : []
            }
            itemRenderer={(item) => (
              <StemBegrootResourceDetail
                canAddItem={canAddMore}
                isInSelectedResources={
                  selectedResources.find((r) => r.id === item.id) !== undefined
                }
                resource={item}
                isModerator={isModerator}
                loginUrl={props.login?.url}
                onPrimaryButtonClick={(resource) => {
                  const resourceInBudgetList = selectedResources.find(
                    (r) => r.id === resource.id
                  );

                  if (resourceInBudgetList) {
                    setSelectedResources(
                      selectedResources.filter((r) => r.id !== resource.id)
                    );
                  } else {
                    setSelectedResources([...selectedResources, resource]);
                  }
                }}
              />
            )}></Carousel>
        }
      />

      <div className="osc">
        <Stepper
          currentStep={0}
          steps={['Kies', 'Overzicht', 'Stemcode', 'Stem']}
        />
        <section className="begroot-step-panel">
          <StemBegrootBudgetList
            maxBudget={maxBudget}
            allResources={resources?.records || []}
            selectedResources={selectedResources}
          />
          <Spacer size={1} />

          <div className="begroot-step-panel-navigation-section">
            <SecondaryButton>Volgende</SecondaryButton>
          </div>
        </section>
        <Spacer size={4} />
        <List
          columns={3}
          items={resources?.records || []}
          renderHeader={() => (
            <>
              <h3>Plannen</h3> <Spacer size={1} />
            </>
          )}
          renderItem={(resource, index) => {
            const btnPrimaryText = selectedResources.find(
              (r) => r.id === resource.id
            )
              ? 'Verwijder'
              : 'Voeg toe';

            const theme = resource.tags
              ?.filter((t: any) => t.type === 'theme')
              ?.at(0);
            const area = resource.tags
              ?.filter((t: any) => t.type === 'area')
              ?.at(0);
            return (
              <>
                <article>
                  <Image src={resource.images?.at(0)?.src || ''} />

                  <div>
                    <Spacer size={1} />
                    <section className="stembegroot-content-item-header">
                      <h5>&euro;{resource.budget || 0}</h5>

                      <div className="stembegroot-content-item-header-taglist">
                        <p className="strong">Thema:</p>
                        <p>{theme?.name || 'Geen thema'}</p>
                        <p className="strong">Gebied:</p>
                        <p> {area?.name || 'Geen gebied'}</p>
                      </div>
                    </section>

                    <Spacer size={0.5} />

                    <p>{elipsize(resource.description, 200)}</p>

                    <Spacer size={1} />
                  </div>

                  <div className="osc-stem-begroot-content-item-footer">
                    <PlainButton
                      className="osc-stem-begroot-item-action-btn"
                      onClick={() => {
                        setResourceDetailIndex(index);
                        setOpenDetailDialog(true);
                      }}>
                      Lees meer
                    </PlainButton>
                    <SecondaryButton
                      disabled={
                        !selectedResources.find((r) => r.id === resource.id) &&
                        !(resource.budget < maxBudget - budgetUsed)
                      }
                      className="osc-stem-begroot-item-action-btn"
                      onClick={() => {
                        const resourceIndex = selectedResources.findIndex(
                          (r) => r.id === resource.id
                        );

                        if (resourceIndex === -1) {
                          setSelectedResources([
                            ...selectedResources,
                            resource,
                          ]);
                        } else {
                          const resources = [...selectedResources];
                          resources.splice(resourceIndex, 1);
                          setSelectedResources(resources);
                        }
                      }}>
                      {btnPrimaryText}
                    </SecondaryButton>
                  </div>
                </article>
              </>
            );
          }}
        />
      </div>
    </>
  );
}

StemBegroot.loadWidget = loadWidget;
export { StemBegroot };
