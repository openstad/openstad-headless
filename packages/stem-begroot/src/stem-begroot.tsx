import './stem-begroot.css';
import React, { useEffect, useState } from 'react';
import {
  PlainButton,
  SecondaryButton,
  Spacer,
  Stepper,
} from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { SessionStorage, hasRole } from '@openstad-headless/lib';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { StemBegrootBudgetList } from './step-1/begroot-budget-list/stem-begroot-budget-list';
import { StemBegrootResourceDetailDialog } from './step-1/begroot-detail-dialog/stem-begroot-detail-dialog';

import { StemBegrootResourceList } from './step-1/begroot-resource-list/stem-begroot-resource-list';
import { BudgetUsedList } from './reuseables/used-budget-component';
import { BegrotenSelectedOverview } from './step-2/selected-overview';
import toast, { Toaster } from 'react-hot-toast';

export type StemBegrootWidgetProps = BaseProps &
  ProjectSettingProps & {
    step1: string;
    step2: string;
    step3: string;
    step3success: string;
    voteMessage: string;
    thankMessage: string;
    showNewsletterButton: boolean;
  };

function StemBegroot(props: StemBegrootWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentUser] = datastore.useCurrentUser({ ...props });

  const { resources, submitLike } = datastore.useResources({
    projectId: props.projectId,
  });

  // Replace with type when available from datastore
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const selectedBudgets: Array<number> = selectedResources.map(
    (r) => r.budget || 0
  );

  const session = new SessionStorage({ projectId: props.projectId });
  const budgetUsed: number = selectedResources.reduce(
    (total, cv) => total + cv.budget,
    0
  );

  const usedBudgetList = (
    <BudgetUsedList
      budgetUsed={budgetUsed}
      maxBudget={props.votes.maxBudget}
      selectedBudgets={selectedBudgets}
    />
  );

  const notifyVoteMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      toast.error(message, { position: 'top-center' });
    }
  };

  // If pending and no selectedResources recover the resources from session
  useEffect(() => {
    let pending = session.get('osc-resource-vote-pending');
    if (pending && resources?.records && selectedResources.length === 0) {
      const resourcesThatArePending: Array<any> =
        resources?.records?.filter((r: any) => pending && r.id in pending) ||
        [];
      setSelectedResources(resourcesThatArePending);
    }
  }, [resources?.records, selectedResources]);

  // Force the logged in user to skip step 2: first time entering 'stemcode'
  useEffect(() => {
    if (
      props.votes.requiredUserRole &&
      hasRole(currentUser, props.votes.requiredUserRole) &&
      currentStep === 2
    ) {
      setCurrentStep(3);
    }
  }, [
    resources?.records,
    currentUser,
    currentStep,
    props?.votes?.requiredUserRole,
  ]);

  function prepareForVote(e: React.MouseEvent<HTMLElement, MouseEvent> | null) {
    if (e) e.stopPropagation();
    const resourcesToVoteFor: { [key: string]: any } = {};
    (selectedResources.length ? selectedResources : []).forEach(
      (resource: any) => {
        resourcesToVoteFor[resource.id] = 'yes';
      }
    );
    session.set('osc-resource-vote-pending', resourcesToVoteFor);
  }

  async function doVote(resources: Array<any>) {
    if (!props.votes.isActive) {
      throw new Error('Stemmen is niet actief!');
    }

    if (resources.length > 0) {
      const recordsToLike = resources.map(
        (r: { id: string; opinion: string }) => ({
          resourceId: r.id,
          opinion: 'yes',
        })
      );
      return await submitLike(recordsToLike);
    }
  }

  return (
    <>
      <StemBegrootResourceDetailDialog
        resources={resources?.records?.length ? resources.records : []}
        selectedResources={selectedResources}
        openDetailDialog={openDetailDialog}
        setOpenDetailDialog={setOpenDetailDialog}
        onPrimaryButtonClick={(resource) => {
          session.remove('osc-resource-vote-pending');

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
        maxBudget={props.votes.maxBudget}
      />

      <div className="osc">
        <Stepper
          currentStep={currentStep}
          steps={['Kies', 'Overzicht', 'Stemcode', 'Stem']}
        />
        <section className="begroot-step-panel">
          {currentStep === 0 ? (
            <>
              {usedBudgetList}
              <Spacer size={1.5} />
              <StemBegrootBudgetList
                introText={props.step1}
                maxBudget={props.votes.maxBudget}
                allResources={resources?.records || []}
                selectedResources={selectedResources}
              />
            </>
          ) : null}

          {currentStep === 1 ? (
            <>
              {usedBudgetList}
              <Spacer size={1.5} />
              <BegrotenSelectedOverview
                introText={props.step2}
                budgetUsed={budgetUsed}
                maxBudget={props.votes.maxBudget}
                selectedResources={selectedResources}
              />
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              {usedBudgetList}
              <Spacer size={1.5} />
              <h5>Controleer stemcode</h5>
              <p>{props.step3}</p>
              <SecondaryButton
                onClick={(e) => {
                  prepareForVote(e);
                  if (props.login?.url) {
                    const loginUrl = new URL(props.login.url);
                    document.location.href = loginUrl.toString();
                  }
                }}>
                Vul je stemcode in
              </SecondaryButton>
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              {usedBudgetList}
              <Spacer size={1.5} />
              <h5>{props.step3success}</h5>
              <Spacer size={1.5} />

              <SecondaryButton
                onClick={() => {
                  const loginUrl = new URL(`${props?.login?.url}`);
                  document.location.href = loginUrl.toString();
                }}>
                Vul een andere stemcode in
              </SecondaryButton>
            </>
          ) : null}

          <Spacer size={1} />

          {currentStep === 4 ? (
            <>
              {usedBudgetList}
              <Spacer size={1.5} />
              <h5>{props.voteMessage}</h5>
              <p>{props.thankMessage}</p>

              {props.showNewsletterButton ? (
                <SecondaryButton
                  onClick={() => {
                    // What should happen here?
                  }}>
                  Hou mij op de hoogte
                </SecondaryButton>
              ) : null}
            </>
          ) : null}

          <div className="begroot-step-panel-navigation-section">
            {currentStep > 0 && currentStep < 4 ? (
              <PlainButton
                onClick={() => {
                  if (currentStep === 3) {
                    setCurrentStep(currentStep - 2);
                  } else {
                    setCurrentStep(currentStep - 1);
                  }
                }}>
                Vorige
              </PlainButton>
            ) : null}

            {/* Dont show on voting step if you are on step 2 your not logged in*/}
            {currentStep !== 2 ? (
              <SecondaryButton
                onClick={async () => {
                  if (currentStep === 3) {
                    try {
                      await doVote(selectedResources);
                      setCurrentStep(currentStep + 1);
                    } catch (err: any) {
                      notifyVoteMessage(err.message, true);
                    } finally {
                      session.remove('osc-resource-vote-pending');
                    }
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={selectedResources.length === 0}>
                {currentStep < 3 ? 'Volgende' : null}
                {currentStep === 3 ? 'Stem indienen' : null}
                {currentStep === 4 ? 'Klaar' : null}
              </SecondaryButton>
            ) : null}
          </div>
        </section>
        <Spacer size={4} />

        {currentStep === 0 ? (
          <StemBegrootResourceList
            budgetUsed={budgetUsed}
            maxBudget={props.votes.maxBudget}
            resources={resources?.records?.length ? resources?.records : []}
            selectedResources={selectedResources}
            onResourcePlainClicked={(resource, index) => {
              setResourceDetailIndex(index);
              setOpenDetailDialog(true);
            }}
            onResourcePrimaryClicked={(resource) => {
              session.remove('osc-resource-vote-pending');

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
        <Toaster />
      </div>
    </>
  );
}

StemBegroot.loadWidget = loadWidget;
export { StemBegroot };
