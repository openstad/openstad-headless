import './stem-begroot.css';
import React, { useState } from 'react';
import {
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
import { StemBegrootBudgetList } from './begroot-budget-list/stem-begroot-budget-list';
import { StemBegrootResourceDetailDialog } from './begroot-detail-dialog/stem-begroot-detail-dialog';

import { StemBegrootResourceList } from './begroot-resource-list/stem-begroot-resource-list';
import { BudgetUsedList } from './reuseables/used-budget-component';
import { BudgetStatusPanel } from './reuseables/budget-status-panel';

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

  const budgetUsed: number = selectedResources.reduce(
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
          {currentStep === 0 ? (
            <StemBegrootBudgetList
              maxBudget={maxBudget}
              allResources={resources?.records || []}
              selectedResources={selectedResources}
            />
          ) : null}

          {currentStep === 1 ? (
            <>
              <BudgetUsedList
                budgetUsed={budgetUsed}
                maxBudget={maxBudget}
                selectedResources={selectedResources}
              />

              <Spacer size={1.5} />

              <div className="begroot-step-2-instruction-budget-status-panel">
                <p>
                  Bekijk hieronder je selectie. Ben je tevreden? Klik dan
                  onderaan door naar stap 3 om jouw stemcode in te vullen.
                </p>
                <BudgetStatusPanel
                  maxBudget={maxBudget}
                  budgetUsed={budgetUsed}
                />
              </div>

              <Spacer size={1.5} />
              <div className="budget-overview-panel">
                <h5>Overzicht van mijn selectie</h5>

                {selectedResources.map((resource) => (
                  <div className="budget-two-text-row-spaced">
                    <p>{resource.title}</p>
                    <p className="strong">&euro;{resource.budget}</p>
                  </div>
                ))}

                <Spacer size={2} />
                <div className="budget-two-text-row-spaced">
                  <h5>Totaal gebruikt budget</h5>
                  <h5>&euro;{budgetUsed}</h5>
                </div>
              </div>
              <div className="budget-unused-panel-step-2 budget-two-text-row-spaced">
                <p className="strong">Ongebruikt budget:</p>
                <p className="strong">&euro;{maxBudget - budgetUsed}</p>
              </div>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <BudgetUsedList
                budgetUsed={budgetUsed}
                maxBudget={maxBudget}
                selectedResources={selectedResources}
              />
              <Spacer size={1.5}/>
              <h5>Controleer stemcode</h5>
              <p>
                Via onderstaande knop kun je op een aparte pagina je
                persoonlijke stemcode invullen. Wij controleren de stemcode op
                geldigheid. Als dat gelukt is kom je terug op deze pagina waarna
                je kunt stemmen. Alle bewoners van 12 jaar en ouder hebben per
                post een stemcode ontvangen.
              </p>
              <SecondaryButton>Vul je stemcode in</SecondaryButton>
            </>
          ) : null}

          <Spacer size={1} />

          <div className="begroot-step-panel-navigation-section">
            {currentStep > 0 && currentStep < 3 ? (
              <PlainButton onClick={() => setCurrentStep(currentStep - 1)}>
                Vorige
              </PlainButton>
            ) : null}

            <SecondaryButton
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={selectedResources.length === 0}>
              Volgende
            </SecondaryButton>
          </div>
        </section>
        <Spacer size={4} />

        {currentStep === 0 ? (
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
        ) : null}
      </div>
    </>
  );
}

StemBegroot.loadWidget = loadWidget;
export { StemBegroot };
