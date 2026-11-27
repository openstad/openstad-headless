import { getResourceImage } from '@openstad-headless/lib/resource-image';
import { IconButton, Image, headingLevels } from '@openstad-headless/ui/src';
import {
  ButtonLink,
  Heading,
  Paragraph,
} from '@utrecht/component-library-react';
import React, { useEffect, useRef } from 'react';

import { elipsizeHTML } from '../../../lib/ui-helpers';
import './map-preview-card.css';

type Props = {
  datastore: any;
  projectId?: number | string;
  resourceId: number | string;
  detailUrl: string;
  summaryMaxLength?: number;
  headingLevel?: string;
  buttonText?: string;
  onClose: () => void;
};

export function MapPreviewCard({
  datastore,
  projectId,
  resourceId,
  detailUrl,
  summaryMaxLength = 20,
  headingLevel,
  buttonText,
  onClose,
}: Props) {
  const { data: resource, error } = datastore.useResource({
    projectId,
    resourceId,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isLoaded = !!resource?.id;
  const resourceImage = isLoaded ? getResourceImage(resource) : { url: '' };
  const imageUrl = resourceImage.url;

  const close = () => {
    onCloseRef.current();
    returnFocusRef.current?.focus?.();
  };

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
  }, [resourceId]);

  useEffect(() => {
    if (isLoaded) headingRef.current?.focus();
  }, [isLoaded, resource?.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section
      className="osc-map-preview-card"
      aria-label="Voorbeeld van inzending">
      <div className="osc-map-preview-card__close">
        <IconButton
          className="subtle-button"
          icon="ri-close-line"
          aria-label="Sluit voorbeeld"
          onClick={close}
        />
      </div>
      {error ? (
        <Paragraph className="osc-map-preview-card__status">
          Deze inzending kon niet worden geladen.
        </Paragraph>
      ) : !isLoaded ? (
        <Paragraph className="osc-map-preview-card__status">Laden...</Paragraph>
      ) : (
        <>
          {imageUrl ? (
            <Image
              src={imageUrl}
              focalPoint={resourceImage.focalPoint}
              className="osc-map-preview-card__image"
            />
          ) : null}
          <div className="osc-map-preview-card__body">
            <Heading
              level={headingLevels(headingLevel)[1]}
              appearance="utrecht-heading-4"
              className="osc-map-preview-card__title"
              ref={headingRef}
              tabIndex={-1}>
              {resource.title}
            </Heading>
            {resource.summary ? (
              <Paragraph
                className="osc-map-preview-card__summary"
                dangerouslySetInnerHTML={{
                  __html: elipsizeHTML(resource.summary, summaryMaxLength),
                }}
              />
            ) : null}
            <ButtonLink appearance="primary-action-button" href={detailUrl}>
              {buttonText || 'Lees meer'}
            </ButtonLink>
          </div>
        </>
      )}
    </section>
  );
}
