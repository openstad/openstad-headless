import DataStore from '@openstad-headless/data-store/src';
import { Comments } from '@openstad-headless/comments/src/comments';
import hasRole from '../../lib/has-role';
import 'remixicon/fonts/remixicon.css';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading,
  Heading6,
  Textarea,
  Button,
  ButtonLink,
  FormLabel,
  Checkbox,
  Link
} from '@utrecht/component-library-react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, { useState, useRef, useEffect } from 'react';
import './document-map.css';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { MapContainer, ImageOverlay, useMapEvents, Popup, Marker, MarkerProps } from 'react-leaflet';
import { LatLngBoundsLiteral, CRS, Icon } from 'leaflet';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';

import 'leaflet/dist/leaflet.css';
import { Likes, LikeWidgetProps } from '@openstad-headless/likes/src/likes';

import MarkerIcon from '@openstad-headless/leaflet-map/src/marker-icon';
import { Filters } from "@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter";
import SelectField from "@openstad-headless/ui/src/form-elements/select";
import { MultiSelect } from "@openstad-headless/ui/src";
import toast, { Toaster } from "react-hot-toast";
import { Spacer } from '@openstad-headless/ui/src';

export type DocumentMapProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
    resourceIdRelativePath?: string;
    documentWidth?: number;
    documentHeight?: number;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    iconDefault?: string;
    iconHighlight?: string;
    sentiment?: string;
    canComment?: boolean;
    requiredUserRole?: string;
    accessibilityUrlVisible?: boolean;
    accessibilityUrl?: string;
    accessibilityUrlText?: string;
    definitiveUrlVisible?: boolean;
    definitiveUrl?: string;
    definitiveUrlText?: string;
    statusId?: string;
    displayLikes?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    extraFieldsTagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    defaultTags?: string;
    includeOrExclude?: string;
    extraFieldsDisplayTagGroupName?: boolean;
    onlyIncludeOrExcludeTagIds?: string;
    addCommentText?: string;
    addMarkerText?: string;
    submitCommentText?: string;
    displayResourceInfo?: string;
    displayMapSide?: string;
    displayResourceDescription?: string;
    infoPopupContent?: string;
    likeWidget?: Omit<
      LikeWidgetProps,
      keyof BaseProps | keyof ProjectSettingProps | 'resourceId'
    >;
    largeDoc?: boolean;
    emptyListText?: string;
    loginText?: string;
    backUrlContent?: string;
    backUrlText?: string;
  };


function DocumentMap({
  zoom = 1,
  minZoom = -6,
  maxZoom = 10,
  iconDefault,
  iconHighlight = 'https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740_1280.png',
  sentiment = 'no sentiment',
  accessibilityUrlVisible,
  definitiveUrlVisible,
  statusId,
  displayLikes = true,
  includeOrExclude = 'include',
  onlyIncludeOrExcludeTagIds = '',
  tagGroups = [],
  extraFieldsTagGroups = [],
  defaultTags = '',
  addCommentText = 'Voeg een reactie toe',
  addMarkerText = 'Toon Markers',
  submitCommentText = 'Versturen',
  displayResourceInfo = 'left',
  displayMapSide = 'left',
  displayResourceDescription = 'no',
  infoPopupContent = 'Op deze afbeelding kun je reacties plaatsen. Klik op de afbeelding om een reactie toe te voegen. Klik op een marker om de bijbehorende reacties te bekijken.',
  largeDoc = false,
  ...props
}: DocumentMapProps) {

  let resourceId: string | undefined = String(getResourceId({
    resourceId: parseInt(props.resourceId || ''),
    url: document.location.href,
    targetUrl: props.resourceIdRelativePath,
  })); // todo: make it a number throughout the code

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  const tagIds = !!onlyIncludeOrExcludeTagIds && onlyIncludeOrExcludeTagIds.startsWith(',') ? onlyIncludeOrExcludeTagIds.substring(1) : onlyIncludeOrExcludeTagIds;

  const { data: allTags } = datastore.useTags({
    projectId: props.projectId,
    type: ''
  });

  const tagIdsArray = tagIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

  function determineTags(includeOrExclude: string, allTags: any, tagIdsArray: Array<number>) {
    let filteredTagIdsArray: Array<number> = [];
    try {
      if (includeOrExclude === 'exclude' && tagIdsArray.length > 0) {
        const filteredTags = allTags.filter((tag: { id: number }) => !tagIdsArray.includes((tag.id)));
        const filteredTagIds = filteredTags.map((tag: { id: number }) => tag.id);
        filteredTagIdsArray = filteredTagIds;
      } else if (includeOrExclude === 'include') {
        filteredTagIdsArray = tagIdsArray;
      }

      const filteredTagsIdsString = filteredTagIdsArray.join(',');

      return {
        tagsString: filteredTagsIdsString || '',
        tags: filteredTagIdsArray || []
      };

    } catch (error) {
      console.error('Error processing tags:', error);

      return {
        tagsString: '',
        tags: []
      };
    }
  }

  const {
    tagsString: filteredTagsIdsString,
    tags: filteredTagIdsArray
  } = determineTags(includeOrExclude, allTags, tagIdsArray);

  const [selectedTags, setSelectedTags] = useState<Array<number>>([]);
  const [selectedTagsString, setSelectedTagsString] = useState<string>('');

  const useCommentsData = {
    projectId: props.projectId,
    resourceId: resourceId,
    sentiment: sentiment,
    onlyIncludeTagIds: filteredTagsIdsString || undefined,
  };

  const { data: comments } = datastore.useComments(useCommentsData);

  const [allComments, setAllComments] = useState<Array<Comment>>(comments);
  const [filteredComments, setFilteredComments] = useState<Array<Comment>>(comments);
  const [commentValue, setCommentValue] = useState<string>('');
  const [refreshComments, setRefreshComments] = useState(false);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentValue(e.target.value);
  };


  const [init, setInit] = useState(false);
  useEffect(() => {
    if (init) return;
    setInit(true);
    setAllComments(comments);
  }, [comments]);

  useEffect(() => {
    const selectedTagsForFiltering = Array.isArray(selectedTags) ? selectedTags : [];
    const originalTagsForFiltering = Array.isArray(filteredTagIdsArray) ? filteredTagIdsArray : [];
    const allTagsToFilter = selectedTagsForFiltering.length > 0 ? selectedTagsForFiltering : originalTagsForFiltering;

    const finalAllTagsToFilter = allTagsToFilter.map((tag: string | number) => typeof (tag) === 'string' ? parseInt(tag, 10) : tag);

    const filtered = allComments && allComments
      .filter((comment: any) => {
        if (finalAllTagsToFilter.length === 0) {
          return true;
        } else if (typeof comment.tags === 'undefined') {
          return false;
        }

        return comment?.tags.some((tag: any) => finalAllTagsToFilter.includes(tag.id));
      });

    const tagsNewString = !!finalAllTagsToFilter ? finalAllTagsToFilter.join(',') : '';

    setSelectedTagsString(tagsNewString);
    setFilteredComments(filtered);
  }, [selectedTags, allComments]);

  const [popupPosition, setPopupPosition] = useState<any>(null);
  const [selectedCommentIndex, setSelectedCommentIndex] = useState<number>();
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number>();
  const [selectedOptions, setSelected] = useState<Array<number>>([]);

  const updateTagListMultiple = (tagId: number) => {
    const tagAlreadySelected = selectedOptions.includes(tagId);
    const selected = [...selectedOptions];

    if (tagAlreadySelected) {
      const index = selected.indexOf(tagId);
      selected.splice(index, 1);
    } else {
      selected.push(tagId);
    }

    setSelected(selected);
  };


  const [docWidth, setDocumentWidth] = useState<number>(1920);
  const [docHeight, setDocumentHeight] = useState<number>(1080)
  const [isBoundsSet, setIsBoundsSet] = useState(false);
  const leafletMapRef = useRef<HTMLDivElement>(null);

  const imageUrl = resource.images ? resource.images[0].url : '';
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    const containerWidth = leafletMapRef.current?.offsetWidth || 1920;
    const imageWidth = containerWidth * 0.8;
    const imageHeight = (img.height / img.width) * imageWidth;
    setDocumentWidth(imageWidth);
    setDocumentHeight(imageHeight);
  };


  const imageBounds: LatLngBoundsLiteral = [
    [0, docWidth / 2],
    [-docHeight, -docWidth / 2]
  ];


  const contentRef = useRef<HTMLDivElement>(null);
  const [shortLengthError, setShortLengthError] = useState(false);
  const [longLengthError, setLongLengthError] = useState(false);
  const [randomId, setRandomId] = useState('');

  const [toggleMarker, setToggleMarker] = useState(true);

  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        setPopupPosition(e.latlng);
      },
      popupclose: () => {
        setSelectedCommentIndex(-1);
        setSelectedMarkerIndex(-1);
      },
    });


    useEffect(() => {
      if (map && imageBounds && !isBoundsSet) {
        map.fitBounds(imageBounds);
        map.scrollWheelZoom.disable();
        setIsBoundsSet(true);
      }
    }, [map, imageBounds, isBoundsSet]);

    return null;
  };

  const notifySuccess = () =>
    toast.success('Uw reactie is succesvol geplaatst!', { position: 'top-center' });

  const notifyFailed = () =>
    toast.error('Uw reactie kon niet geplaatst worden', { position: 'top-center' });

  const addComment = async (e: any, position: any) => {
    e.preventDefault();
    e.stopPropagation();

    setShortLengthError(false);
    setLongLengthError(false);

    if (commentValue.length < props.comments?.descriptionMinLength) {
      setShortLengthError(true);
    }

    if (commentValue.length > props.comments?.descriptionMaxLength) {
      setLongLengthError(true);
    }
    if (
      commentValue.length >= props.comments?.descriptionMinLength
      && commentValue.length <= props.comments?.descriptionMaxLength
    ) {
      try {
        const defaultTagsArray = defaultTags
          ? defaultTags.split(',').map(tag => parseInt(tag.trim(), 10)).filter(tag => !isNaN(tag))
          : [];

        const allTags = Array.from(new Set([...defaultTagsArray, ...selectedOptions]));

        const newComment = await comments.create({
          description: commentValue,
          location: position,
          createdAt: new Date(),
          sentiment: 'no sentiment',
          tags: allTags,
        });

        const addNewCommentToComments = [...filteredComments, newComment];
        const newIndex = addNewCommentToComments.length - 1;

        setFilteredComments(addNewCommentToComments);
        setPopupPosition(null);
        setCommentValue('');
        setShortLengthError(false);
        setLongLengthError(false);
        setSelected([]);
        setSelectedCommentIndex(newIndex);
        setSelectedMarkerIndex(newIndex);

        setRefreshComments(prev => !prev);
        scrollToComment(newIndex);

        notifySuccess();
      } catch (error) {
        notifyFailed();
        console.error('Error creating comment:', error);
      }
    } else {
      return;
    }
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  const [backUrl, setBackUrl] = useState<string>();


  useEffect(() => {
    setRandomId(generateRandomId());
    if (window.location.hash.includes('#doc')) {
      setBackUrl('/' + window.location.hash.split('=')[1] + (window.location.hash.split('=')[2] !== undefined ? '=' + window.location.hash.split('=')[2] : ''));
    }
  }, []);

  let args = {
    canComment: typeof props.comments?.canComment != 'undefined' ? props.comments.canComment : true,
    requiredUserRole: props.comments?.requiredUserRole || 'member',
  }

  const { data: currentUser } = datastore.useCurrentUser({ ...args });

  const [canComment, setCanComment] = useState(args.canComment)
  const [originalID, setOriginalID] = useState(undefined)
  const [isDefinitive, setIsDefinitive] = useState<boolean>()
  useEffect(() => {
    if (!resource) return;
    let statuses = resource.statuses || [];
    for (let status of statuses) {
      if (status.extraFunctionality?.canComment === false) {
        setCanComment(false)
      }
      if (status.id === Number(statusId)) {
        setIsDefinitive(true)
      }
    }
    if (resource.extraData?.originalId) {
      setOriginalID(resource.extraData?.originalId)
    }

  }, [resource]);


  if (canComment === false) args.canComment = canComment;

  interface ExtendedMarkerProps extends MarkerProps {
    id: string;
    index: number;
  }

  const scrollToComment = (index: number) => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 100;

    const tryScrollToComment = () => {
      const filteredComments = Array.from(document.getElementsByClassName('comment-item'));
      filteredComments.forEach((comment, i) => {
        if (i !== index) {
          comment.classList.remove('selected');
        }
      });

      const commentElement = document.getElementById(`comment-${index}`);
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        clearInterval(intervalId);
      } else if (attempts < maxAttempts) {
        attempts++;
      } else {
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(tryScrollToComment, interval);
  };

  const MarkerWithId: React.FC<ExtendedMarkerProps> = ({ id, index, ...props }) => {
    const markerRef = useRef<any>(null);

    return (
      <Marker
        {...props}
        ref={markerRef}
        icon={MarkerIcon({ icon: { className: index === selectedMarkerIndex ? '--highlightedIcon' : '--defaultIcon' } })}
        eventHandlers={{
          click: () => {
            if (index === selectedMarkerIndex) {
              setSelectedMarkerIndex(-1);
              setSelectedCommentIndex(-1);
            } else {
              setSelectedMarkerIndex(index);
              setSelectedCommentIndex(index);
              scrollToComment(index);
            }
          },
          keydown: (e: L.LeafletKeyboardEvent) => {
            if (e.originalEvent.key === 'Enter') {
              if (index === selectedMarkerIndex) {
                setSelectedMarkerIndex(-1);
                setSelectedCommentIndex(-1);
              } else {
                setSelectedMarkerIndex(index);
                setSelectedCommentIndex(index);
                scrollToComment(index);
              }
            }
          }
        }}
      />
    );
  };

  const getUrl = () => {
    if (props.accessibilityUrl?.includes('[id]')) {
      return props.accessibilityUrl?.split('[id]')[0] + resourceId + '#doc=' + window.location.href.split('/').reverse()[0];
    } else {
      return props.accessibilityUrl + '#doc=' + window.location.href.split('/').reverse()[0];
    }
  }

  const getDefinitiveUrl = (originalID: string) => {
    if (props.definitiveUrl?.includes('[id]')) {
      return props.definitiveUrl?.split('[id]')[0] + originalID + '#doc=' + window.location.href.split('/').reverse()[0];
    } else {
      return props.definitiveUrl + '#doc=' + window.location.href.split('/').reverse()[0];
    }
  }

  const toggleHelperDialog = (open: boolean) => {
    const dialog = document.querySelector('dialog.helper-dialog') as HTMLDialogElement;
    if (dialog) {
      if (open) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  };

  return (
    <div className={`documentMap--container ${largeDoc ? '--largeDoc' : ''}`}>
      <div className={`map-container ${!toggleMarker ? '--hideMarkers' : ''} ${displayMapSide}`}>

        {(displayResourceInfo === 'left' || accessibilityUrlVisible || backUrl || (definitiveUrlVisible && originalID !== undefined && isDefinitive)) && (
          <div className="content-container">
            <div className="documentMap--header">
              <div className='url-container'>
                <div className="url-list">
                  {accessibilityUrlVisible ? <Link href={getUrl()} title="Bekijk tekstuele versie" id={randomId}>{props.accessibilityUrlText}</Link> : null}
                  {definitiveUrlVisible && originalID !== undefined && isDefinitive ? <Link href={getDefinitiveUrl(originalID)} title="Bekijk originele versie" id={randomId}>{props.definitiveUrlText}</Link> : null}
                </div>
              </div>
            </div>
            {displayResourceInfo === 'left' && (
              <section className="content-intro">
                {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
                {resource.summary ? <Paragraph>{resource.summary}</Paragraph> : null}

                {(displayResourceDescription === 'yes' && resource.description) ? <Paragraph dangerouslySetInnerHTML={{ __html: resource.description }} /> : null}
              </section>
            )}
          </div>
        )}

        {displayResourceInfo === 'right' && (
          <div className="content-container mobileonly">
            <section className="content-intro">
              {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
              {resource.summary ? <Paragraph>{resource.summary}</Paragraph> : null}

              {(displayResourceDescription === 'yes' && resource.description) ? <Paragraph dangerouslySetInnerHTML={{ __html: resource.description }} /> : null}
            </section>
          </div>
        )}
        <div className='document-container'>
          <MapContainer
            center={[0, 0]}
            crs={CRS.Simple}
            maxZoom={maxZoom}
            minZoom={minZoom}
            zoom={zoom}
            zoomSnap={0}
          >
            <MapEvents />
            {filteredComments && filteredComments
              .filter((comment: any) => !!comment.location)
              .map((comment: any, index: number) => (
                <MarkerWithId
                  key={index}
                  id={`marker-${index}`}
                  index={index}
                  position={comment.location}
                >
                </MarkerWithId>
              ))}
            <ImageOverlay
              url={resource.images ? resource.images[0].url : ''}
              bounds={imageBounds}
              aria-describedby={randomId}
            />
            {popupPosition && !isDefinitive && (
              <Popup position={popupPosition}>
                {args.canComment && !hasRole(currentUser, args.requiredUserRole) ? (
                  <>
                    <Paragraph>Om een reactie te plaatsen, moet je ingelogd zijn.</Paragraph>
                    <Spacer size={1} />
                    <Button
                      appearance="primary-action-button"
                      onClick={() => {
                        if (props.login?.url) {
                          document.location.href = props.login?.url;
                        }
                      }}
                      type="button">
                      Inloggen
                    </Button>
                  </>
                ) :
                  <form>
                    <div>
                      <FormLabel htmlFor="commentBox">{addCommentText}</FormLabel>
                      {shortLengthError && <Paragraph className="--error">De reactie moet minimaal {props.comments?.descriptionMinLength} tekens bevatten</Paragraph>}
                      {longLengthError && <Paragraph className="--error">De reactie mag maximaal {props.comments?.descriptionMaxLength} tekens bevatten</Paragraph>}

                      <Textarea
                        id="commentBox"
                        name="comment"
                        onChange={handleCommentChange}
                        rows={3}
                        value={commentValue}
                      />
                    </div>

                    {extraFieldsTagGroups
                      && Array.isArray(extraFieldsTagGroups)
                      && extraFieldsTagGroups.length > 0
                      && extraFieldsTagGroups.map((group: { type: string; label?: string; multiple: boolean }, index) => {
                        return (
                          <div key={group.type}>
                            <FormLabel htmlFor={group.type}>{group.label}</FormLabel>

                            {group && group.multiple ? (
                              <MultiSelect
                                label={'Selecteer een optie'}
                                onItemSelected={(optionValue: string) => {
                                  const value = parseInt(optionValue, 10);
                                  updateTagListMultiple(value);
                                }}
                                options={(allTags?.filter((tag: { type: string }) => tag.type === group.type).map((tag: { id: number, name: string }) => ({
                                  value: tag.id,
                                  label: tag.name,
                                  checked: selectedOptions.includes(tag.id),
                                })))}
                              />

                            ) : (
                              <SelectField
                                choices={(allTags?.filter((tag: { type: string }) => tag.type === group.type).map((tag: { id: string | number, name: string }) => ({
                                  value: tag.id,
                                  label: tag.name
                                })))}
                                fieldKey={`tag[${group.type}]`}
                                onChange={(e: { name: string; value: string | [] | Record<number, never>; }) => {
                                  let selectedTag = e.value as string;

                                  updateTagListMultiple(parseInt(selectedTag, 10));
                                }}
                              />
                            )}
                          </div>
                        )
                      })}
                    <Button appearance="primary-action-button" type="submit" onClick={(e) => addComment(e, popupPosition)}>{submitCommentText}</Button>
                  </form>}

              </Popup>
            )}
          </MapContainer>

          <Button className='info-trigger' appearance='primary-action-button' onClick={() => toggleHelperDialog(true)}>
            <i className="ri-information-line"></i>
            <span className="sr-only">Hoe werkt het?</span>
          </Button>
        </div>
      </div>
      <div className="content" ref={contentRef}>
        {!isDefinitive && (
          <>
            {displayLikes && canComment && (
              <>
                <Likes
                  {...props}
                  resourceId={resourceId || ''}
                  title={props.likeWidget?.title}
                  yesLabel={props.likeWidget?.yesLabel}
                  noLabel={props.likeWidget?.noLabel}
                  hideCounters={props.likeWidget?.hideCounters}
                  variant={props.likeWidget?.variant}
                  showProgressBar={props.likeWidget?.showProgressBar}
                  progressBarDescription={
                    props.likeWidget?.progressBarDescription
                  }
                />
                <Spacer size={1} />
              </>
            )}
            {backUrl !== undefined && (
              <div className="osc back-url-container">
                <div className="banner">
                  <Spacer size={2} />
                  <Heading6>{props.backUrlContent}</Heading6>
                  <Spacer size={1} />
                  <ButtonLink appearance="primary-action-button" href={backUrl} title="Terug naar overzicht" id={randomId}>{props.backUrlText}</ButtonLink>
                  <Spacer size={2} />
                </div>
                <Spacer size={2} />
              </div>
            )}
            <div className='toggleMarkers'>
              <Checkbox id="toggleMarkers" defaultChecked onChange={() => setToggleMarker(!toggleMarker)} />
              <FormLabel htmlFor="toggleMarkers"> <Paragraph>{addMarkerText}</Paragraph> </FormLabel>
            </div>
          </>
        )}

        {displayResourceInfo === 'right' && (
          <section className="content-intro desktoponly">
            {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
            {resource.summary ? <Paragraph>{resource.summary}</Paragraph> : null}

            {(displayResourceDescription === 'yes' && resource.description) ? <Paragraph dangerouslySetInnerHTML={{ __html: resource.description }} /> : null}

          </section>
        )}

        {(tagGroups && Array.isArray(tagGroups) && tagGroups.length > 0 && datastore) ? (
          <Filters
            className="osc-flex-columned"
            dataStore={datastore}
            defaultSorting=""
            displaySearch={false}
            displaySorting={false}
            displayTagFilters={true}
            searchPlaceholder='Zoeken'
            applyText='Toepassen'
            resetText='Reset'
            onUpdateFilter={(f) => {
              if (f.tags.length === 0) {
                setSelectedTags([]);
              } else {
                setSelectedTags(f.tags);
              }
            }}
            resources={[]}
            sorting={[]}
            tagGroups={tagGroups}
            tagsLimitation={filteredTagIdsArray}
          />
        ) : null}

        {!isDefinitive && (
          <Comments
            {...props}
            key={refreshComments ? 'refresh' : 'no-refresh'}
            onlyIncludeTags={selectedTagsString || filteredTagsIdsString || ''}
            resourceId={resourceId || ''}
            selectedComment={selectedCommentIndex}
            setRefreshComments={setRefreshComments}
            showForm={false}
          />
        )}
      </div>
      <dialog className='helper-dialog'>
        <div className="info-dialog">
          <Heading level={2}>Hoe werkt het?</Heading>
          <Paragraph>{infoPopupContent}</Paragraph>
          <Spacer size={1} />
          <Button appearance='secondary-action-button' onClick={() => toggleHelperDialog(false)}>
            <i className="ri-close-fill"></i>
            <span>Info venster sluiten</span>
          </Button>
        </div>
      </dialog>
    </div>

  );
}

DocumentMap.loadWidget = loadWidget;

export { DocumentMap };