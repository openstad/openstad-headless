import './stem-begroot.css';
import React, { useCallback, useState } from 'react';
import {
  Image,
  List,
  PlainButton,
  SecondaryButton,
  Spacer,
  Stepper,
} from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { hasRole } from '@openstad-headless/lib';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { elipsize } from '@openstad-headless/lib/ui-helpers';
import { StemBegrootBudgetList } from './begroot-budget-list/stem-begroot-budget-list';
import { StemBegrootResourceDetailDialog } from './begroot-detail-dialog/stem-begroot-detail-dialog';

import { StemBegrootResourceList } from './begroot-resource-list/stem-begroot-resource-list';

export type StemBegrootWidgetProps = BaseProps &
  ProjectSettingProps & { maxBudget: number };

function StemBegroot({ maxBudget = 0, ...props }: StemBegrootWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);

  const [currentStep, setCurrentStep] = useState<number>(0);
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

  return (
    <>
      <StemBegrootResourceDetailDialog
        resources={resources?.records?.length ? resources.records : []}
        selectedResources={selectedResources}
        openDetailDialog={openDetailDialog}
        setOpenDetailDialog={setOpenDetailDialog}
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
        resourceDetailIndex={resourceDetailIndex}
        budgetUsed={budgetUsed}
        maxBudget={maxBudget}
      />

      <div className="osc">
        <Stepper
          currentStep={currentStep}
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
            <SecondaryButton disabled={selectedResources.length === 0}>
              Volgende
            </SecondaryButton>
          </div>
        </section>
        <Spacer size={4} />

        <StemBegrootResourceList
          budgetUsed={budgetUsed}
          maxBudget={maxBudget}
          resources={resources?.records?.length ? resources?.records : []}
          selectedResources={selectedResources}
          onResourcePlainClicked={(resource, index) => {
            setResourceDetailIndex(index);
            setOpenDetailDialog(true);
          }}
          onResourcePrimaryClicked={(resource) => {
            const resourceIndex = selectedResources.findIndex(
              (r) => r.id === resource.id
            );

            if (resourceIndex === -1) {
              setSelectedResources([...selectedResources, resource]);
            } else {
              const resources = [...selectedResources];
              resources.splice(resourceIndex, 1);
              setSelectedResources(resources);
            }
          }}
        />
      </div>
    </>
  );
}

StemBegroot.loadWidget = loadWidget;
export { StemBegroot };
