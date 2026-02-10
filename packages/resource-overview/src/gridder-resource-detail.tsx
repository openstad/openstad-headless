import React from 'react';
import {
  IconButton,
  Image,
  Pill,
  SecondaryButton,
  Spacer,
} from '@openstad-headless/ui/src';
import './gridder-resource-detail.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import {
  Button,
  ButtonGroup,
  ButtonLink,
  Heading,
  Heading1,
  Heading4,
  Paragraph
} from "@utrecht/component-library-react";
import { Icon } from "../../ui/src/icon"
import {Likes, LikeWidgetProps} from '@openstad-headless/likes/src/likes';
import { BaseProps } from '@openstad-headless/types/base-props';
import { ProjectSettingProps } from '@openstad-headless/types/project-setting-props';
import {hasRole} from "../../lib";

export type GridderResourceDetailProps =
    BaseProps &
    ProjectSettingProps &
    {
  resource: any;
  onRemoveClick?: (resource: any) => void;
  currentUser?: any;
  displayDocuments?: boolean;
  displayLikeButton?: boolean;
  displayDislike?: boolean;
  clickableImage?: boolean;
  documentsTitle?: string;
  documentsDesc?: string;
  displayTags?: boolean;
  displayBudget?: boolean;
  dialogTagGroups?: string[];
  likeWidget?: Omit<
    LikeWidgetProps,
    keyof BaseProps | keyof ProjectSettingProps | 'resourceId'
  >;
};

export const GridderResourceDetail = ({
  resource,
  onRemoveClick,
  displayDocuments = false,
  displayLikeButton = false,
  displayDislike = false,
  documentsTitle = '',
  documentsDesc = '',
  clickableImage = false,
  displayTags = true,
  displayBudget = true,
  dialogTagGroups = undefined,
  currentUser,
  ...props
}: GridderResourceDetailProps) => {
  // When resource is correctly typed the we will not need :any

  let resourceFilteredTags = (dialogTagGroups && Array.isArray(dialogTagGroups) && Array.isArray(resource?.tags))
    ? resource?.tags.filter((tag: { type: string }) => dialogTagGroups.includes(tag.type))
    : resource?.tags;

  resourceFilteredTags = resourceFilteredTags?.length
    ? resourceFilteredTags?.sort((a: { seqnr?: number }, b: { seqnr?: number }) => {
      if (a.seqnr === undefined || a.seqnr === null) return 1;
      if (b.seqnr === undefined || b.seqnr === null) return -1;
      return a.seqnr - b.seqnr;
    })
    : [];

  const resourceUserId = resource?.userId || null;
  const canDelete = hasRole(currentUser, ['moderator', 'owner'], resourceUserId);

  type DocumentType = {
    name?: string;
    url?: string;
  }

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
  const canLike = Array.isArray(resource?.statuses)
    ? !resource.statuses.some(
        (status: { extraFunctionality?: { canLike?: boolean } }) =>
          status?.extraFunctionality?.canLike === false
      )
    : true;

  const renderImage = (image: string, clickableImage: boolean) => {
    const imageComponent = (
      <Image
        src={image}
        className="--aspectRatio-16-9"
      />
    );

    return clickableImage ? (
      <a href={image} target="_blank" rel="noreferrer">
        {imageComponent}
      </a>
    ) : (
      imageComponent
    )
  }

  return (
    <>
      <div className="osc-gridder-resource-detail">
        <section className={`osc-gridder-resource-detail-photo ${hasImages}`}>
          {renderImage(resource.images?.at(0)?.url || defaultImage, clickableImage)}

          <div className="osc-gridder-resource-detail-budget-theme-bar">

            {displayBudget && (
              <>
                <Heading4>Budget</Heading4>
                <Paragraph>&euro; {resource.budget > 0 ? resource.budget.toLocaleString('nl-NL') : 0}</Paragraph>
                <Spacer size={1} />
              </>
            )}

            {displayTags && (
              <>
                <Heading4>Tags</Heading4>
                <Spacer size={.5} />
                <div className="pill-grid">
                      {(resourceFilteredTags as Array<{ type: string; name: string }>)
                        ?.filter((t) => t.type !== 'status')
                        ?.map((t) => <Pill text={t.name} />)}
                </div>
              </>
            )}

          </div>
        </section>

        <section className="osc-gridder-resource-detail-texts-and-actions-container">
          <div>
            <div>
              <Heading1 dangerouslySetInnerHTML={{__html: resource.title}}></Heading1>
              <Paragraph className="strong" dangerouslySetInnerHTML={{__html: resource.summary}}></Paragraph>
              <Paragraph dangerouslySetInnerHTML={{__html: resource.description}}></Paragraph>
            </div>
          </div>

          { (!!displayDocuments && !!resource && Array.isArray(resource.documents) && resource.documents.length > 0 ) && (
            <>
              <Spacer size={2} />
              <div className="document-download-container">
                {!!documentsTitle && (<Heading level={2} appearance="utrecht-heading-4">{documentsTitle}</Heading>)}
                {!!documentsDesc && (<Paragraph>{documentsDesc}</Paragraph>)}
                <Spacer size={2} />
                <ButtonGroup>
                  {resource.documents?.map((document: DocumentType, index: number) => (
                    <ButtonLink
                      appearance="primary-action-button"
                      className="osc counter-container"
                      download
                      href={document.url}
                      key={index}
                    >
                      <Icon
                        icon="ri-download-2-fill"
                      />
                      {document.name}
                    </ButtonLink>
                  ))}
                </ButtonGroup>
              </div>
            </>
          )}
          <Spacer size={2} />
          <div className="osc-gridder-resource-detail-actions">

            { displayLikeButton && (
              <Likes
                {...props}
                disabled={!canLike}
                title={props.likeWidget?.title}
                yesLabel={props.likeWidget?.yesLabel}
                noLabel={props.likeWidget?.noLabel}
                displayDislike={displayDislike}
                hideCounters={props.likeWidget?.hideCounters}
                variant={props.likeWidget?.variant}
                showProgressBar={props.likeWidget?.showProgressBar}
                progressBarDescription={
                  props.likeWidget?.progressBarDescription
                }
                resourceId={resource.id}
              />
            )}

            {canDelete && (
              <Button
                appearance="primary-action-button"
                onClick={() => {
                  if (confirm("Deze actie verwijderd de resource"))
                    onRemoveClick && onRemoveClick(resource);
                }}
              >
                Verwijder
              </Button>
            )}

          </div>
        </section>
      </div>

      <Spacer size={2} />
    </>
  );
};
