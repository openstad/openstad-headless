import './stem-begroot.css';
import React, { useEffect, useRef, useState } from 'react';
import { Paginator, Spacer, Stepper } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { SessionStorage, hasRole } from '@openstad-headless/lib';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { StemBegrootBudgetList } from './step-1/begroot-budget-list/stem-begroot-budget-list';
import { StemBegrootResourceDetailDialog } from './step-1/begroot-detail-dialog/stem-begroot-detail-dialog';
import { createVotePendingStorage } from './utils/vote-pending-storage';
import { createSelectedResourcesStorage } from './utils/selected-resources-storage';

import { StemBegrootResourceList } from './step-1/begroot-resource-list/stem-begroot-resource-list';
import { BudgetUsedList } from './reuseables/used-budget-component';
import { BegrotenSelectedOverview } from './step-2/selected-overview';
import { Filters } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';

import { Step3Success } from './step-3-success';
import { Step3 } from './step-3';
import { Step4 } from './step-4';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Button, Heading, ButtonLink } from '@utrecht/component-library-react';
import NotificationService from '../../lib/NotificationProvider/notification-service';
import NotificationProvider from '../../lib/NotificationProvider/notification-provider';

type TagTypeSingle = {
  min: number;
  max: number;
  current: number;
  selectedResources: Array<any>;
};

export type TagType = {
  [key: string]: TagTypeSingle;
};

export type StemBegrootWidgetProps = BaseProps &
  ProjectSettingProps & {
    step0?: string;
    step1?: string;
    step2?: string;
    step3?: string;
    step3success?: string;
    voteMessage?: string;
    thankMessage?: string;
    showNewsletterButton: boolean;
    notEnoughBudgetText?: string;
    displayPagination?: boolean;
    displayRanking: boolean;
    displayPriceLabel: boolean;
    showVoteCount: boolean;
    showOriginalResource: boolean;
    originalResourceUrl?: string;
    displayTagFilters?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    displayTagGroupName?: boolean;
    defaultSorting?: string;
    sorting?: Array<{ label: string; value: string }>;
    displaySorting?: boolean;
    displaySearch?: boolean;
    displaySearchText?: boolean;
    textActiveSearch?: string;
    itemsPerPage?: number;
    onlyIncludeTagIds: string;
    onlyIncludeStatusIds?: string;
    resourceListColumns?: number;
    showInfoMenu?: boolean;
    isSimpleView?: boolean;
    step1Title: string;
    resourceCardTitle: string;
    step2Title: string;
    stemCodeTitle: string;
    stemCodeTitleSuccess: string;
    newsLetterTitle: string;
    newsLetterLink: string;
    panelTitle?: string;
    budgetChosenTitle?: string;
    budgetRemainingTitle?: string;
    resetText?: string;
    applyText?: string;
    searchPlaceholder?: string;
    step1Tab?: string;
    step2Tab?: string;
    step3Tab?: string;
    step4Tab?: string;
    tagTypeSelector?: string;
    tagTypeTag?: string;
    overviewTitle?: string;
    step3Title?: string;
    tagTypeTagGroup?: Array<string>;
    hideTagsForResources?: boolean;
    hideReadMore?: boolean;
    scrollWhenMaxReached?: boolean;
    step1Delete?: string;
    step1Add?: string;
    step1MaxText?: string;
    filterBehavior?: string;
    voteAfterLoggingIn?: boolean;
    displayModBreak?: boolean;
  };

function StemBegroot({
  notEnoughBudgetText = 'Niet genoeg budget',
  onlyIncludeTagIds = '',
  onlyIncludeStatusIds = '',
  resourceListColumns = 3,
  step1Tab = '',
  step2Tab = '',
  step3Tab = '',
  step4Tab = '',
  step0 = '',
  overviewTitle = '',
  step3Title = '',
  hideTagsForResources = false,
  hideReadMore = false,
  scrollWhenMaxReached = false,
  step1Delete = 'Verwijder',
  step1Add = 'Voeg toe',
  step1MaxText = '',
  filterBehavior = 'or',
  voteAfterLoggingIn = false,
  displayModBreak = false,
  ...props
}: StemBegrootWidgetProps) {
  // Initialize storage instances with project ID
  const votePendingStorage = React.useMemo(
    () => createVotePendingStorage(props.projectId),
    [props.projectId]
  );

  const selectedResourcesStorage = React.useMemo(
    () => createSelectedResourcesStorage(props.projectId),
    [props.projectId]
  );

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const { data: allTags } = datastore.useTags({
    projectId: props.projectId,
    type: '',
  });

  const startingStep =
    props?.votes?.voteType === 'countPerTag' ||
    props?.votes?.voteType === 'budgetingPerTag'
      ? -1
      : 0;

  const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(startingStep);
  const [lastStep, setLastStep] = useState<number>(0);
  const { data: currentUser } = datastore.useCurrentUser({ ...props });
  const [navAfterLogin, setNavAfterLogin] = useState<boolean>();
  // const [shouldReloadSelectedResources, setReloadSelectedResources] =
  //   useState<boolean>(false);

  const [activeTagTab, setActiveTagTab] = useState<string>('');
  const [visitedTagTabs, setVisitedTagTabs] = useState<Array<string>>([]);

  const stringToArray = (str: string) => {
    return str
      .trim()
      .split(',')
      .filter((t) => t && !isNaN(+t.trim()))
      .map((t) => Number.parseInt(t));
  };

  const tagIdsToLimitResourcesTo = stringToArray(onlyIncludeTagIds);
  const statusIdsToLimitResourcesTo = stringToArray(onlyIncludeStatusIds);

  const urlParams = new URLSearchParams(window.location.search);
  const urlTagIds = urlParams.get('tagIds');
  const urlStatusIds = urlParams.get('statusIds');

  const urlTagIdsArray = urlTagIds ? stringToArray(urlTagIds) : undefined;
  const urlStatusIdsArray = urlStatusIds
    ? stringToArray(urlStatusIds)
    : undefined;

  const initTags =
    urlTagIdsArray && urlTagIdsArray.length > 0
      ? urlTagIdsArray
      : tagIdsToLimitResourcesTo || [];
  const initStatuses =
    urlStatusIdsArray && urlStatusIdsArray.length > 0
      ? urlStatusIdsArray
      : statusIdsToLimitResourcesTo || [];

  const [tagCounter, setTagCounter] = useState<Array<TagType>>([]);

  const [tags, setTags] = useState<number[]>(initTags);
  const [sort, setSort] = useState<string | undefined>(
    props.defaultSorting || undefined
  );
  const [search, setSearch] = useState<string | undefined>();
  const [page, setPage] = useState<number>(0);
  const [itemsPerPage, setPageSize] = useState<number>(
    props.itemsPerPage || 999
  );
  const [totalPages, setTotalPages] = useState(0);

  const { data: resources, submitVotes } = datastore.useResources({
    projectId: props.projectId,
    tags,
    sort,
    search,
    pageSize: 999,
  });

  // Replace with type when available from datastore
  // Initialize from storage if available
  const [selectedResources, setSelectedResources] = useState<any[]>(() => {
    const stored = selectedResourcesStorage.getSelectedResources();
    return stored || [];
  });

  const session = new SessionStorage({ projectId: props.projectId });

  const selectedBudgets: Array<number> = (() => {
    if (props.votes.voteType === 'budgetingPerTag') {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTag) return [];

      return activeTag[activeTagTab].selectedResources.map(
        (r) => r.budget || 0
      );
    }

    return selectedResources.map((r) => r.budget || 0);
  })();

  const budgetUsed = (() => {
    if (props.votes.voteType === 'budgetingPerTag') {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      return activeTag ? activeTag[activeTagTab].current : 0;
    }

    return selectedResources.reduce(
      (total, resource) => total + resource.budget,
      0
    );
  })();

  const usedBudgetList = (
    <BudgetUsedList
      budgetUsed={budgetUsed}
      maxBudget={props.votes.maxBudget}
      selectedBudgets={selectedBudgets}
    />
  );

  const notifyVoteMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      NotificationService.addNotification(message, 'error');
    }
  };

  const isAllowedToVote =
    props.votes.requiredUserRole &&
    hasRole(currentUser, props.votes.requiredUserRole);

  // Save selectedResources to storage whenever they change
  useEffect(() => {
    if (
      props.votes.voteType !== 'countPerTag' &&
      props.votes.voteType !== 'budgetingPerTag'
    ) {
      selectedResourcesStorage.setSelectedResources(selectedResources);
    }
  }, [selectedResources, selectedResourcesStorage, props.votes.voteType]);

  useEffect(() => {
    if (props.isSimpleView && currentStep === 1 && lastStep > currentStep) {
      setCurrentStep(0); // Skip step 2
    } else if (
      props.isSimpleView &&
      currentStep === 1 &&
      lastStep < currentStep
    ) {
      setCurrentStep(2); // Skip step 2
    }

    if (currentStep !== lastStep) {
      setLastStep(currentStep);
    }
  }, [props.isSimpleView, currentStep]);

  // Check the pending state and if there are any resources, hint to  update the selected items
  useEffect(() => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const pendingPerTag = votePendingStorage.getVotePendingPerTag();

      if (pendingPerTag) {
        setTagCounter((prevTagCounter) =>
          prevTagCounter.map((tagObj) => {
            const tagName = Object.keys(tagObj)[0];
            if (pendingPerTag[tagName]) {
              const selectedResourceIds = Object.keys(
                pendingPerTag[tagName]
              ).map(Number);

              const resourcesThatArePending: Array<any> =
                resources?.records?.filter(
                  (r: any) =>
                    selectedResourceIds && selectedResourceIds.includes(r.id)
                ) || [];

              const currentCount =
                props.votes.voteType === 'budgetingPerTag'
                  ? resourcesThatArePending.reduce(
                      (total, r) => total + r.budget,
                      0
                    )
                  : resourcesThatArePending.length;

              return {
                [tagName]: {
                  ...tagObj[tagName],
                  selectedResources: resourcesThatArePending,
                  current: currentCount,
                },
              };
            }

            return tagObj;
          })
        );
      }
    } else {
      const pending = votePendingStorage.getVotePending();
      if (
        pending &&
        resources?.records?.length > 0 &&
        selectedResources.length === 0
      ) {
        setSelectedResources(
          resources?.records?.filter((r: any) => pending[r.id])
        );
      }
    }
  }, [resources?.records, votePendingStorage]);

  // Force the logged in user to skip step 2: first time entering 'stemcode'
  useEffect(() => {
    let pending;

    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      pending = votePendingStorage.getVotePendingPerTag();
    } else {
      pending = votePendingStorage.getVotePending();
    }

    if (
      pending &&
      ((isAllowedToVote && currentStep === 2 && !navAfterLogin) ||
        (isAllowedToVote && navAfterLogin && currentStep === 2) ||
        (isAllowedToVote && !navAfterLogin))
    ) {
      if (voteAfterLoggingIn) {
        if (selectedResources.length > 0 || tagCounter.length > 0) {
          setCurrentStep(4);
          submitVoteAndCleanup();
        }
      } else {
        setCurrentStep(3);
      }
    }
  }, [currentUser, currentStep, selectedResources, tagCounter]);

  async function submitVoteAndCleanup() {
    try {
      if (
        props.votes.voteType === 'countPerTag' ||
        props.votes.voteType === 'budgetingPerTag'
      ) {
        let allResourcesToVote: any[] = [];

        for (const tagObj of tagCounter) {
          const tagName = Object.keys(tagObj)[0];
          const resourcesToVote = tagObj[tagName].selectedResources
            .map((resourceSelected: { id: number }) => {
              return resources?.records?.find(
                (resource: { id: number }) =>
                  resource.id === resourceSelected.id
              );
            })
            .filter(Boolean);

          allResourcesToVote = allResourcesToVote.concat(resourcesToVote);
        }

        const uniqueResourcesToVote = Array.from(
          new Set(allResourcesToVote.map((r) => r.id))
        ).map((id) => allResourcesToVote.find((r) => r.id === id));

        if (uniqueResourcesToVote.length > 0) {
          localStorage.removeItem('oscResourceVotePendingPerTag');

          await doVote(uniqueResourcesToVote);
        }
      } else {
        if (selectedResources.length > 0) {
          localStorage.removeItem('oscResourceVotePending');
          return await doVote(selectedResources);
        }
      }
    } catch (err: any) {
      notifyVoteMessage(err.message, true);
    }
  }

  function prepareForVote(e: React.MouseEvent<HTMLElement, MouseEvent> | null) {
    if (e) e.stopPropagation();

    if (
      props.votes.voteType !== 'countPerTag' &&
      props.votes.voteType !== 'budgetingPerTag'
    ) {
      const resourcesToVoteFor: { [key: string]: any } = {};
      (selectedResources.length ? selectedResources : []).forEach(
        (resource: any) => {
          resourcesToVoteFor[resource.id] = 'yes';
        }
      );

      votePendingStorage.setVotePending(resourcesToVoteFor);
    } else {
      const resourcesToVoteForPerTag: {
        [tag: string]: { [key: string]: any };
      } = {};

      tagCounter.forEach((tagObj) => {
        const tagName = Object.keys(tagObj)[0];
        const selectedResourcesForTag = tagObj[tagName].selectedResources;

        resourcesToVoteForPerTag[tagName] = {};
        selectedResourcesForTag.forEach((resource: any) => {
          resourcesToVoteForPerTag[tagName][resource.id] = 'yes';
        });
      });

      votePendingStorage.setVotePendingPerTag(resourcesToVoteForPerTag);
    }
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
      return await submitVotes(recordsToLike);
    }
  }

  const isInSelected = (resource: { id: number }) => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTag) return false;

      return activeTag[activeTagTab].selectedResources.some(
        (res) => res.id === resource.id
      );
    }

    return selectedResources.some((r) => r.id === resource.id);
  };

  const getOriginalResourceUrl = (resource: {
    extraData: { originalId: number | string };
  }) => {
    return props.showOriginalResource &&
      props.originalResourceUrl &&
      resource.extraData?.originalId
      ? props.originalResourceUrl.includes('[id]')
        ? props.originalResourceUrl.replace(
            '[id]',
            `${resource.extraData?.originalId}`
          )
        : `${props.originalResourceUrl}/${resource.extraData?.originalId}`
      : null;
  };

  // For now only support budgeting and count
  const resourceSelectable = (resource: { id: number; budget: number }) => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTag) return false;

      if (
        activeTag[activeTagTab].selectedResources.some(
          (r) => r.id === resource.id
        )
      ) {
        return true;
      }

      if (props.votes.voteType === 'countPerTag') {
        return activeTag[activeTagTab].current < activeTag[activeTagTab].max;
      } else if (props.votes.voteType === 'budgetingPerTag') {
        return (
          activeTag[activeTagTab].current + resource.budget <=
          activeTag[activeTagTab].max
        );
      }
    }

    if (props.votes.voteType === 'budgeting') {
      return (
        isInSelected(resource) ||
        (!isInSelected(resource) &&
          resource.budget <= props.votes.maxBudget - budgetUsed)
      );
    }
    return (
      isInSelected(resource) ||
      (!isInSelected(resource) &&
        (props.votes.maxResources || 0) > selectedResources.length)
    );
  };

  const createItemBtnString = (resource: { id: number; budget: number }) => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTag) return '';

      if (
        activeTag[activeTagTab].selectedResources.some(
          (r) => r.id === resource.id
        )
      ) {
        return step1Delete || 'Verwijder';
      }

      if (props.votes.voteType === 'countPerTag') {
        return !(activeTag[activeTagTab].current < activeTag[activeTagTab].max)
          ? notEnoughBudgetText
          : step1Add || 'Voeg toe';
      } else if (props.votes.voteType === 'budgetingPerTag') {
        return !(
          activeTag[activeTagTab].current + resource.budget <=
          activeTag[activeTagTab].max
        )
          ? notEnoughBudgetText
          : step1Add || 'Voeg toe';
      }
      return '';
    }

    if (props.votes.voteType === 'budgeting') {
      return !isInSelected(resource) &&
        !(resource.budget <= props.votes.maxBudget - budgetUsed)
        ? notEnoughBudgetText
        : isInSelected(resource)
        ? step1Delete || 'Verwijder'
        : step1Add || 'Voeg toe';
    }
    return !isInSelected(resource) &&
      !((props.votes.maxResources || 0) > selectedResources.length)
      ? notEnoughBudgetText
      : isInSelected(resource)
      ? step1Delete || 'Verwijder'
      : step1Add || 'Voeg toe';
  };

  const steps = [
    step1Tab || 'Kies',
    step2Tab || 'Overzicht',
    step3Tab || 'Stemcode',
    step4Tab || 'Stem',
  ];

  const typeSelector = props.tagTypeSelector || 'tag';
  const tagsToDisplay =
    typeSelector === 'tag'
      ? allTags
          .filter((tag: { type: string }) => tag.type === props.tagTypeTag)
          .map((tag: { name: string }) => tag.name)
      : props?.tagTypeTagGroup || [];

  useEffect(() => {
    if (
      props?.votes?.voteType === 'countPerTag' ||
      props?.votes?.voteType === 'budgetingPerTag'
    ) {
      if (
        tagsToDisplay.length > 0 &&
        (!Array.isArray(tagCounter) ||
          (Array.isArray(tagCounter) && tagCounter.length === 0))
      ) {
        const numberOrDefault = (value: any, defaultValue: number) => {
          const parsedValue = Number(value);
          return !isNaN(parsedValue) ? parsedValue : defaultValue;
        };

        const tagCounterNew: Array<TagType> = tagsToDisplay.map(
          (tag: string) => {
            return {
              [tag]: {
                min:
                  props?.votes?.voteType === 'countPerTag'
                    ? numberOrDefault(props.votes.minResources, 1)
                    : numberOrDefault(props.votes.minBudget, 1),
                max:
                  props?.votes?.voteType === 'countPerTag'
                    ? props.votes.maxResources || 1
                    : props.votes.maxBudget || 1,
                current: 0,
                selectedResources: [],
              },
            };
          }
        );

        setTagCounter(tagCounterNew);
      }
    }
  }, [tagsToDisplay]);

  useEffect(() => {
    if (
      props?.votes?.voteType === 'countPerTag' ||
      props?.votes?.voteType === 'budgetingPerTag'
    ) {
      if (activeTagTab) {
        const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
        if (activeTag) {
          setSelectedResources(activeTag[activeTagTab].selectedResources);
        }
      }
    }
  }, [activeTagTab]);

  const [filteredResources, setFilteredResources] = useState<any[]>([]);
  const resourcesToUse = filteredResources.length
    ? filteredResources
    : resources?.records || [];

  const step1ContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollToElement = () => {
    if (step1ContainerRef.current) {
      const targetPosition =
        step1ContainerRef.current.getBoundingClientRect().top +
        window.pageYOffset -
        100;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToTop = () => {
    const divElement = document.getElementById(
      'stem-begroot-resource-selections-list'
    );

    if (divElement) {
      divElement.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  };

  useEffect(() => {
    if (filteredResources) {
      const filtered: any = filteredResources || [];
      const totalPagesCalc = Math.ceil(filtered?.length / itemsPerPage);

      if (totalPagesCalc !== totalPages) {
        setTotalPages(totalPagesCalc);
      }

      if (page !== 0) {
        setPage(0);
      }
    }
  }, [filteredResources]);

  useEffect(() => {
    setVisitedTagTabs((prev) =>
      prev.includes(activeTagTab) ? prev : [...prev, activeTagTab]
    );
  }, [activeTagTab]);

  return (
    <>
      <StemBegrootResourceDetailDialog
        areaId={props.map.areaId}
        displayPriceLabel={props.displayPriceLabel}
        displayRanking={props.displayRanking}
        showVoteCount={props.showVoteCount}
        showOriginalResource={props.showOriginalResource}
        originalResourceUrl={props.originalResourceUrl}
        resources={resourcesToUse}
        resourceBtnEnabled={resourceSelectable}
        resourceBtnTextHandler={createItemBtnString}
        defineOriginalUrl={getOriginalResourceUrl}
        openDetailDialog={openDetailDialog}
        setOpenDetailDialog={setOpenDetailDialog}
        isSimpleView={Boolean(props.isSimpleView)}
        onPrimaryButtonClick={(resource) => {
          votePendingStorage.clearAllVotePending();
          selectedResourcesStorage.clearSelectedResources();

          let newTagCounter = [...tagCounter];

          if (
            props.votes.voteType === 'countPerTag' ||
            props.votes.voteType === 'budgetingPerTag'
          ) {
            newTagCounter = newTagCounter.map((tagObj) => {
              if (tagObj[activeTagTab]) {
                if (isInSelected(resource)) {
                  tagObj[activeTagTab].current -=
                    props.votes.voteType === 'budgetingPerTag'
                      ? resource.budget
                      : 1;
                  tagObj[activeTagTab].selectedResources = tagObj[
                    activeTagTab
                  ].selectedResources.filter(
                    (selectedResource: { id: number }) =>
                      selectedResource.id !== resource.id
                  );
                } else {
                  tagObj[activeTagTab].current +=
                    props.votes.voteType === 'budgetingPerTag'
                      ? resource.budget
                      : 1;
                  tagObj[activeTagTab].selectedResources.push(resource);
                }
              }
              return tagObj;
            });

            setTagCounter(newTagCounter);
          } else {
            const resourceIndex = selectedResources.findIndex(
              (r) => r.id === resource.id
            );
            if (resourceIndex === -1) {
              setSelectedResources([...selectedResources, resource]);
            } else {
              const updatedResources = [...selectedResources];
              updatedResources.splice(resourceIndex, 1);
              setSelectedResources(updatedResources);
            }
          }
        }}
        resourceDetailIndex={resourceDetailIndex}
        statusIdsToLimitResourcesTo={initStatuses}
        tagIdsToLimitResourcesTo={tags}
        sort={sort}
        allTags={allTags}
        tags={tags}
        setFilteredResources={setFilteredResources}
        filteredResources={filteredResources}
        voteType={props?.votes?.voteType || 'likes'}
        typeSelector={typeSelector}
        activeTagTab={activeTagTab}
        currentPage={page}
        pageSize={itemsPerPage}
        filterBehavior={filterBehavior}
        displayModBreak={displayModBreak}
        modBreakTitle={props?.resources?.modbreakTitle || ''}
      />

      <div className="osc">
        <Stepper
          currentStep={currentStep}
          steps={steps}
          isSimpleView={props.isSimpleView}
        />
        <Spacer size={1} />

        {props.votes.voteType === 'budgeting' ||
        props?.votes?.voteType === 'budgetingPerTag' ? (
          <>
            {usedBudgetList}
            <Spacer size={1.5} />
          </>
        ) : null}

        <section className="begroot-step-panel" ref={step1ContainerRef}>
          {currentStep === -1 && (
            <div className="vote-per-theme-container">
              <div
                className="vote-per-theme-intro"
                dangerouslySetInnerHTML={{ __html: step0 }}></div>
              <div className="themes-container">
                {tagsToDisplay.map((tag: string) => (
                  <div className="theme" key={tag}>
                    <Button
                      appearance="primary-action-button"
                      onClick={() => {
                        setActiveTagTab(tag);
                        setCurrentStep(0);
                      }}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 0 ? (
            <>
              <StemBegrootBudgetList
                panelTitle={props.panelTitle}
                budgetChosenTitle={props.budgetChosenTitle}
                budgetRemainingTitle={props.budgetRemainingTitle}
                step1Title={props.step1Title}
                resourceCardTitle={props.resourceCardTitle}
                introText={props.step1}
                showInfoMenu={props.showInfoMenu}
                maxBudget={props.votes.maxBudget}
                allResourceInList={resources?.records}
                selectedResources={selectedResources}
                maxNrOfResources={props.votes.maxResources || 0}
                typeIsBudgeting={
                  props.votes.voteType === 'budgeting' ||
                  props.votes.voteType === 'budgetingPerTag'
                }
                tagsToDisplay={tagsToDisplay}
                activeTagTab={activeTagTab}
                setActiveTagTab={setActiveTagTab}
                typeIsPerTag={
                  props?.votes?.voteType === 'countPerTag' ||
                  props?.votes?.voteType === 'budgetingPerTag'
                }
                tagCounter={tagCounter}
                step1MaxText={step1MaxText}
                onSelectedResourceRemove={(resource: {
                  id: number;
                  budget: number;
                }) => {
                  votePendingStorage.clearAllVotePending();

                  let newTagCounter = [...tagCounter];

                  if (
                    props.votes.voteType === 'countPerTag' ||
                    props.votes.voteType === 'budgetingPerTag'
                  ) {
                    newTagCounter = newTagCounter.map((tagObj) => {
                      if (tagObj[activeTagTab]) {
                        if (isInSelected(resource)) {
                          tagObj[activeTagTab].current -=
                            props.votes.voteType === 'budgetingPerTag'
                              ? resource.budget
                              : 1;
                          tagObj[activeTagTab].selectedResources = tagObj[
                            activeTagTab
                          ].selectedResources.filter(
                            (selectedResource: { id: number }) =>
                              selectedResource.id !== resource.id
                          );
                        } else {
                          tagObj[activeTagTab].current +=
                            props.votes.voteType === 'budgetingPerTag'
                              ? resource.budget
                              : 1;
                          tagObj[activeTagTab].selectedResources.push(resource);
                        }
                      }
                      return tagObj;
                    });

                    setTagCounter(newTagCounter);
                  } else {
                    const resourceIndex = selectedResources.findIndex(
                      (r) => r.id === resource.id
                    );
                    if (resourceIndex === -1) {
                      setSelectedResources([...selectedResources, resource]);
                    } else {
                      const updatedResources = [...selectedResources];
                      updatedResources.splice(resourceIndex, 1);
                      setSelectedResources(updatedResources);
                    }
                  }
                }}
                decideCanAddMore={() => {
                  let canAddMore = true;

                  if (
                    props?.votes?.voteType === 'countPerTag' ||
                    props?.votes?.voteType === 'budgetingPerTag'
                  ) {
                    const activeTagData = tagCounter.find(
                      (tagObj) => tagObj[activeTagTab]
                    );
                    if (!activeTagData) return false;

                    const activeTag = activeTagData[activeTagTab];
                    const maxLimit = activeTag.max;
                    const currentCount = activeTag.current;

                    if (props.votes.voteType === 'countPerTag') {
                      canAddMore = currentCount < maxLimit;
                    }

                    if (props.votes.voteType === 'budgetingPerTag') {
                      let notUsedResources = filteredResources.filter(
                        (allR: { id: number }) =>
                          !selectedResources.find(
                            (selectedR) => allR.id === selectedR.id
                          )
                      );

                      canAddMore = notUsedResources.some(
                        (r: { budget: number }) =>
                          r.budget <= maxLimit - currentCount
                      );
                    }
                  } else {
                    let notUsedResources = resources?.records.filter(
                      (allR: { id: number }) =>
                        !selectedResources.find(
                          (selectedR) => allR.id === selectedR.id
                        )
                    );

                    canAddMore =
                      props.votes.voteType === 'budgeting'
                        ? notUsedResources.some(
                            (r: { budget: number }) =>
                              r.budget < props.votes.maxBudget - budgetUsed
                          )
                        : Math.max(
                            props.votes.maxResources - selectedResources.length,
                            0
                          ) > 0;
                  }

                  if (!canAddMore && scrollWhenMaxReached) {
                    scrollToElement();
                  }

                  return canAddMore;
                }}
              />
            </>
          ) : null}

          {currentStep === 1 ? (
            <>
              <Spacer size={1.5} />
              <BegrotenSelectedOverview
                panelTitle={props.panelTitle}
                budgetChosenTitle={props.budgetChosenTitle}
                budgetRemainingTitle={props.budgetRemainingTitle}
                step2Title={props.step2Title}
                introText={props.step2}
                budgetUsed={budgetUsed}
                selectedResources={selectedResources}
                maxBudget={props.votes.maxBudget}
                maxNrOfResources={props.votes.maxResources || 0}
                typeIsBudgeting={
                  props.votes.voteType === 'budgeting' ||
                  props.votes.voteType === 'budgetingPerTag'
                }
                typeIsPerTag={
                  props?.votes?.voteType === 'countPerTag' ||
                  props?.votes?.voteType === 'budgetingPerTag'
                }
                tagCounter={tagCounter}
                showInfoMenu={props.showInfoMenu}
              />
            </>
          ) : null}

          {currentStep === 2 ? (
            <Step3
              loginUrl={`${props?.login?.url}`}
              step3={props.step3 || ''}
              stemCodeTitle={props.stemCodeTitle}
              step3Title={step3Title || ''}
            />
          ) : null}

          {currentStep === 3 ? (
            <Step3Success step3success={props.step3success || ''} />
          ) : null}

          <Spacer size={1} />

          {currentStep === 4 ? (
            <Step4
              loginUrl={`${props?.login?.url}`}
              thankMessage={props.thankMessage || ''}
              voteMessage={props.voteMessage || ''}
            />
          ) : null}

          <div className="begroot-step-panel-navigation-section">
            {currentStep > 0 && currentStep < 3 ? (
              <Button
                appearance="secondary-action-button"
                onClick={() => {
                  if (currentStep === 3) {
                    setNavAfterLogin(true);
                    setCurrentStep(currentStep - 2);
                  } else {
                    setCurrentStep(currentStep - 1);
                  }
                }}>
                Vorige
              </Button>
            ) : null}

            {currentStep === 3 ? (
              <Button
                appearance="secondary-action-button"
                onClick={() => {
                  const loginUrl = new URL(`${props?.login?.url}`);
                  document.location.href = loginUrl.toString();
                }}>
                {props.stemCodeTitleSuccess}
              </Button>
            ) : null}

            {/* Dont show on voting step if you are on step 2 your not logged in*/}
            {currentStep !== 2 && currentStep !== -1 ? (
              <>
                {currentStep === 4 && props.showNewsletterButton && (
                  <ButtonLink
                    href={props.newsLetterLink}
                    appearance="secondary-action-button"
                    rel="noopener noreferrer">
                    {props.newsLetterTitle}
                  </ButtonLink>
                )}
                <Button
                  appearance="primary-action-button"
                  onClick={async () => {
                    if (currentStep === 0) {
                      if (
                        props.votes.voteType === 'countPerTag' ||
                        props.votes.voteType === 'budgetingPerTag'
                      ) {
                        const unmetTags = tagCounter.filter((tagObj) => {
                          const key = Object.keys(tagObj)[0];

                          if (
                            tagObj[key].min === 0 &&
                            tagObj[key].current === 0 &&
                            key !== activeTagTab &&
                            !visitedTagTabs.includes(key)
                          ) {
                            return true;
                          }

                          return tagObj[key].current < tagObj[key].min;
                        });

                        const nextUnmetTag = unmetTags.find((tagObj) => {
                          const key = Object.keys(tagObj)[0];
                          return key !== activeTagTab;
                        });

                        if (nextUnmetTag) {
                          const tagName = Object.keys(nextUnmetTag)[0];
                          setActiveTagTab(tagName);
                          return;
                        }

                        const notOneTagSelected = tagCounter.every((tagObj) => {
                          const key = Object.keys(tagObj)[0];
                          return tagObj[key].current === 0;
                        });

                        if (notOneTagSelected) {
                          notifyVoteMessage(
                            'Maak een keuze om verder te kunnen gaan.',
                            true
                          );
                          return;
                        }
                      }

                      prepareForVote(null);
                    }

                    if (isAllowedToVote) {
                      setNavAfterLogin(true);
                    }

                    if (currentStep === 3) {
                      await submitVoteAndCleanup();
                      setCurrentStep(4);
                    } else if (currentStep === 4) {
                      currentUser.logout({ url: location.href });
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  disabled={(() => {
                    if (
                      props.votes.voteType === 'countPerTag' ||
                      props.votes.voteType === 'budgetingPerTag'
                    ) {
                      const unmetTags = tagCounter.filter((tagObj) => {
                        const key = Object.keys(tagObj)[0];
                        return tagObj[key].current < tagObj[key].min;
                      });

                      if (unmetTags.length === 0) {
                        return false;
                      }

                      if (
                        unmetTags.length === 1 &&
                        Object.keys(unmetTags[0])[0] === activeTagTab
                      ) {
                        return true;
                      }
                    }

                    return (
                      (props?.votes?.voteType === 'likes' ||
                        props?.votes?.voteType === 'budgeting') &&
                      selectedResources.length === 0
                    );
                  })()}>
                  {(() => {
                    if (currentStep < 3) {
                      if (
                        props.votes.voteType === 'countPerTag' ||
                        props.votes.voteType === 'budgetingPerTag'
                      ) {
                        const unmetTags = tagCounter.filter((tagObj) => {
                          const key = Object.keys(tagObj)[0];

                          if (
                            tagObj[key].min === 0 &&
                            tagObj[key].current === 0 &&
                            key !== activeTagTab &&
                            !visitedTagTabs.includes(key)
                          ) {
                            return true;
                          }

                          return tagObj[key].current < tagObj[key].min;
                        });

                        const nextUnmetTag = unmetTags.find((tagObj) => {
                          const key = Object.keys(tagObj)[0];
                          return key !== activeTagTab;
                        });

                        if (nextUnmetTag) {
                          const tagName = Object.keys(nextUnmetTag)[0];
                          return `Kies voor ${
                            tagName.charAt(0).toUpperCase() + tagName.slice(1)
                          }`;
                        }
                      }
                      return 'Volgende';
                    }
                    if (currentStep === 3) return 'Stem indienen';
                    if (currentStep === 4) return 'Klaar';
                  })()}
                </Button>
              </>
            ) : null}
          </div>
        </section>

        {currentStep === 0 ? (
          <>
            <StemBegrootResourceList
              header={
                <>
                  <Heading level={1} appearance="utrecht-heading-3">
                    {overviewTitle || 'Plannen'}
                  </Heading>
                  <Spacer size={1} />
                  {datastore ? (
                    <Filters
                      tagsLimitation={tagIdsToLimitResourcesTo}
                      dataStore={datastore}
                      sorting={props.sorting || []}
                      defaultSorting={props.defaultSorting || ''}
                      displaySorting={props.displaySorting || false}
                      displaySearch={props.displaySearch || false}
                      displayTagFilters={props.displayTagFilters || false}
                      searchPlaceholder={props.searchPlaceholder || 'Zoeken'}
                      resetText={props.resetText || 'Reset'}
                      applyText={props.applyText || 'Toepassen'}
                      tagGroups={props.tagGroups || []}
                      itemsPerPage={itemsPerPage}
                      resources={resources}
                      onUpdateFilter={(f) => {
                        if (f.tags.length === 0) {
                          setTags(tagIdsToLimitResourcesTo);
                        } else {
                          setTags(f.tags);
                        }
                        setSort(f.sort);
                        setSearch(f.search.text);
                      }}
                      preFilterTags={urlTagIdsArray}
                    />
                  ) : null}

                  <Spacer size={1} />
                </>
              }
              defineOriginalUrl={getOriginalResourceUrl}
              resourceBtnEnabled={resourceSelectable}
              resourceBtnTextHandler={createItemBtnString}
              resources={resources?.records?.length ? resources?.records : []}
              selectedResources={selectedResources}
              onResourcePlainClicked={(resource, index) => {
                setResourceDetailIndex(index);
                setOpenDetailDialog(true);
              }}
              displayPriceLabel={props.displayPriceLabel}
              displayRanking={props.displayRanking}
              showVoteCount={props.showVoteCount}
              showOriginalResource={props.showOriginalResource}
              originalResourceUrl={props.originalResourceUrl}
              resourceListColumns={resourceListColumns || 3}
              onResourcePrimaryClicked={(resource) => {
                votePendingStorage.clearAllVotePending();

                let newTagCounter = [...tagCounter];

                if (
                  props.votes.voteType === 'countPerTag' ||
                  props.votes.voteType === 'budgetingPerTag'
                ) {
                  newTagCounter = newTagCounter.map((tagObj) => {
                    if (tagObj[activeTagTab]) {
                      if (isInSelected(resource)) {
                        tagObj[activeTagTab].current -=
                          props.votes.voteType === 'budgetingPerTag'
                            ? resource.budget
                            : 1;
                        tagObj[activeTagTab].selectedResources = tagObj[
                          activeTagTab
                        ].selectedResources.filter(
                          (selectedResource: { id: number }) =>
                            selectedResource.id !== resource.id
                        );
                      } else {
                        tagObj[activeTagTab].current +=
                          props.votes.voteType === 'budgetingPerTag'
                            ? resource.budget
                            : 1;
                        tagObj[activeTagTab].selectedResources.push(resource);
                      }
                    }
                    return tagObj;
                  });

                  setTagCounter(newTagCounter);
                } else {
                  const resourceIndex = selectedResources.findIndex(
                    (r) => r.id === resource.id
                  );
                  if (resourceIndex === -1) {
                    setSelectedResources([...selectedResources, resource]);
                  } else {
                    const updatedResources = [...selectedResources];
                    updatedResources.splice(resourceIndex, 1);
                    setSelectedResources(updatedResources);
                  }
                }
              }}
              statusIdsToLimitResourcesTo={initStatuses}
              tagIdsToLimitResourcesTo={tags}
              sort={sort}
              allTags={allTags}
              tags={tags}
              activeTagTab={activeTagTab}
              setFilteredResources={setFilteredResources}
              filteredResources={filteredResources}
              voteType={props?.votes?.voteType || 'likes'}
              typeSelector={typeSelector}
              hideTagsForResources={hideTagsForResources}
              hideReadMore={hideReadMore}
              currentPage={page}
              pageSize={itemsPerPage}
              filterBehavior={filterBehavior}
            />
            <Spacer size={3} />

            {props.displayPagination && (
              <div className="osc-stem-begroot-paginator">
                <Paginator
                  page={page || 0}
                  totalPages={totalPages || 1}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    scrollToTop();
                  }}
                />
              </div>
            )}

            <Spacer size={2} />
          </>
        ) : null}
        <NotificationProvider />
      </div>
    </>
  );
}

StemBegroot.loadWidget = loadWidget;
export { StemBegroot };
