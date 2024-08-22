import DataStore from '@openstad-headless/data-store/src';
import { Comments } from '@openstad-headless/comments/src/comments';
import hasRole from '../../lib/has-role';
import 'remixicon/fonts/remixicon.css';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading,
  Textarea,
  Button,
  FormLabel,
  Checkbox,
  Link
} from '@utrecht/component-library-react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, { useState, useRef, useEffect } from 'react';
import './document-map.css';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import type { MarkerProps } from 'react-leaflet';
import { MapContainer, ImageOverlay, useMapEvents, Popup, Marker } from 'react-leaflet';
import type { LatLngBoundsLiteral} from 'leaflet';
import { CRS, Icon } from 'leaflet';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';

import 'leaflet/dist/leaflet.css';

import MarkerIcon from '@openstad-headless/leaflet-map/src/marker-icon';
import { Filters } from "@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter";
import SelectField from "@openstad-headless/ui/src/form-elements/select";
import {MultiSelect} from "@openstad-headless/ui/src";
import toast, {Toaster} from "react-hot-toast";

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
    includeOrExclude?: string;
    onlyIncludeOrExcludeTagIds?: string;
    displayTagFilters?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    extraFieldsTagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    displayTagGroupName?: boolean;
    extraFieldsDisplayTagGroupName?: boolean;
    defaultTags?: string;
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
  includeOrExclude = 'include',
  onlyIncludeOrExcludeTagIds = '',
  displayTagFilters = false,
  tagGroups = [],
  extraFieldsTagGroups = [],
  displayTagGroupName = false,
  defaultTags = '',
  ...props
}: DocumentMapProps) {

  const resourceId: string | undefined = String(getResourceId({
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

  const {data: allTags} = datastore.useTags({
    projectId: props.projectId,
    type: ''
  });

  const tagIdsArray = tagIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

  function determineTags(includeOrExclude: string, allTags: any, tagIdsArray: Array<number>) {
    let filteredTagIdsArray: Array<number> = [];
    try {
      if (includeOrExclude === 'exclude' && tagIdsArray.length > 0 ) {
        const filteredTags = allTags.filter(tag => !tagIdsArray.includes((tag.id)));
        const filteredTagIds = filteredTags.map(tag => tag.id);
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

  const { tagsString: filteredTagsIdsString, tags: filteredTagIdsArray } = determineTags(includeOrExclude, allTags, tagIdsArray);

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

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentValue(e.target.value);
  };

  useEffect(() => {
    setAllComments(comments);
  }, [comments]);

  useEffect(() => {
    const selectedTagsForFiltering = Array.isArray(selectedTags) ? selectedTags : [];
    const originalTagsForFiltering = Array.isArray(filteredTagIdsArray) ? filteredTagIdsArray : [];

    const allTagsToFilter = selectedTagsForFiltering.length > 0 ? selectedTagsForFiltering : originalTagsForFiltering;

    const filtered = allComments && allComments
        .filter((comment: any) => {
          if (allTagsToFilter.length === 0) {
            return true;
          } else if (typeof comment.tags === 'undefined') {
            return false;
          }

          return comment?.tags.some((tag: any) => allTagsToFilter.includes(tag.id));
        });

    const tagsNewString = !!allTagsToFilter ? allTagsToFilter.join(',') : '';

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
  const imageUrl = resource.images ? resource.images[0].url : '';
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    const imageWidth = img.width;
    const imageHeight = img.height;
    setDocumentWidth(imageWidth);
    setDocumentHeight(imageHeight);
  };
  const verticalOffset = docHeight * .20;
  const imageBounds: LatLngBoundsLiteral = [[-docHeight + verticalOffset, -docWidth/2], [verticalOffset, docWidth/2]];


  const contentRef = useRef<HTMLDivElement>(null);
  const [shortLengthError, setShortLengthError] = useState(false);
  const [longLengthError, setLongLengthError] = useState(false);
  const [randomId, setRandomId] = useState('');

  const [toggleMarker, setToggleMarker] = useState(true);

  function MapEvents() {
    const map = useMapEvents({
      click: (e) => {
        setPopupPosition(e.latlng);
      },
      popupclose: () => {
        setSelectedCommentIndex(-1);
        setSelectedMarkerIndex(-1);
      },
    });

    return null;
  }

  const notifySuccess = () =>
      toast.success('Je reactie is succescvol geplaatst!', { position: 'top-center' });

  const notifyFailed = () =>
      toast.error('Je reactie kon niet geplaatst worden', { position: 'top-center' });

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
        setSelectedCommentIndex( newIndex );
        setSelectedMarkerIndex( newIndex );

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
      setBackUrl(window.location.hash.split('=')[1] + '=' + window.location.hash.split('=')[2]);
    }
  }, []);

  const args = {
    canComment: typeof props.comments?.canComment != 'undefined' ? props.comments.canComment : true,
    requiredUserRole: props.comments?.requiredUserRole || 'member',
  }

  const { data: currentUser } = datastore.useCurrentUser({ ...args });

  const [canComment, setCanComment] = useState(args.canComment)
  const [originalID, setOriginalID] = useState(undefined)
  const [isDefinitive, setIsDefinitive] = useState<boolean>()
  useEffect(() => {
    if (!resource) return;
    const statuses = resource.statuses || [];
    for (const status of statuses) {
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

  const MarkerWithId: React.FC<ExtendedMarkerProps> = ({ id, index, ...props }) => {
    const markerRef = useRef<any>(null);

    const scrollToComment = (index: number) => {
      const filteredComments = Array.from(document.getElementsByClassName('comment-item'));
      filteredComments.forEach((comment) => comment.classList.remove('selected'));

      const commentElement = document.getElementById(`comment-${index}`);
      const commentPosition = commentElement?.offsetTop ?? 0;
      const containerPosition = contentRef.current?.offsetTop ?? 0;
      const scrollPosition = commentPosition - containerPosition;

      contentRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    };

    return (
      <Marker
        {...props}
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
        icon={MarkerIcon({ icon: { className: index === selectedMarkerIndex ? '--highlightedIcon' : '--defaultIcon' } })}
        ref={markerRef}
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


  return (
    <div className="documentMap--container">
      <div className="content" ref={contentRef}>
        <div className="documentMap--header">

          <div className='url-container'>
            {backUrl ? <Link href={backUrl} id={randomId} title="Terug naar overzicht">Terug</Link> : null}
            <div className="url-list">
              {accessibilityUrlVisible ? <Link href={getUrl()} id={randomId} title="Bekijk tekstuele versie">{props.accessibilityUrlText}</Link> : null}
              {definitiveUrlVisible && originalID !== undefined && isDefinitive ? <Link href={getDefinitiveUrl(originalID)} id={randomId} title="Bekijk originele versie">{props.definitiveUrlText}</Link> : null}
            </div>
          </div>
          {!isDefinitive && (
            <div className='toggleMarkers'>
              <Checkbox defaultChecked id="toggleMarkers" onChange={() => setToggleMarker(!toggleMarker)} />
              <FormLabel htmlFor="toggleMarkers"> <Paragraph>Toon Markers</Paragraph> </FormLabel>
            </div>
          )}
        </div>
        <section className="content-intro">
          {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
          {resource.summary ? <Heading appearance="utrecht-heading-5" level={2}>{resource.summary}</Heading> : null}
          {resource.description ? <Paragraph>{resource.description}</Paragraph> : null}
        </section>

        {(tagGroups && Array.isArray(tagGroups) && tagGroups.length > 0 && datastore) ? (
            <Filters
                className="osc-flex-columned"
                dataStore={datastore}
                defaultSorting=""
                displaySearch={false}
                displaySorting={false}
                displayTagFilters={displayTagFilters}
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
            onlyIncludeTags={selectedTagsString || filteredTagsIdsString || ''}
            resourceId={resourceId || ''}
            selectedComment={selectedCommentIndex}
            showForm={false}
          />
        )}
      </div>
      <div className={`map-container ${!toggleMarker ? '--hideMarkers' : ''}`}>
        <MapContainer center={[0, 0]} crs={CRS.Simple} maxZoom={maxZoom} minZoom={minZoom} zoom={zoom}  >
          <MapEvents />
          {filteredComments && filteredComments
            .filter((comment: any) => !!comment.location)
            .map((comment: any, index: number) => (
              <MarkerWithId
                id={`marker-${index}`}
                index={index}
                key={index}
                position={comment.location}
               />
            ))}
          <ImageOverlay
            aria-describedby={randomId}
            bounds={imageBounds}
            url={resource.images ? resource.images[0].url : ''}
          />
          {popupPosition && !isDefinitive && (
            <Popup position={popupPosition}>
              {args.canComment && !hasRole(currentUser, args.requiredUserRole) ? (
                <Paragraph>Om een reactie te plaatsen, moet je ingelogd zijn.</Paragraph>
              ) :
                <form>
                  <FormLabel htmlFor="commentBox">Voeg een opmerking toe</FormLabel>
                  {shortLengthError && <Paragraph className="--error">De opmerking moet minimaal {props.comments?.descriptionMinLength} tekens bevatten</Paragraph>}
                  {longLengthError && <Paragraph className="--error">De opmerking mag maximaal {props.comments?.descriptionMaxLength} tekens bevatten</Paragraph>}
                  <Textarea
                      id="commentBox"
                      name="comment"
                      onChange={handleCommentChange}
                      rows={3}
                      value={commentValue}
                  />

                  { extraFieldsTagGroups
                    && Array.isArray(extraFieldsTagGroups)
                    && extraFieldsTagGroups.length > 0
                    && extraFieldsTagGroups.map((group: { label: string | undefined, type: string, multiple: boolean }, index) => {
                    return (
                      <div key={group.type}>
                        <FormLabel htmlFor={group.type}>{group.label}</FormLabel>

                        { group && group.multiple ? (
                          <MultiSelect
                              label={'Selecteer een optie'}
                              onItemSelected={(value) => {
                                updateTagListMultiple(value);
                              }}
                              options={(allTags?.filter(tag => tag.type === group.type).map(tag => ({
                                value: tag.id,
                                label: tag.name,
                                checked: selectedOptions.includes(tag.id),
                              })))}
                          />

                        ) : (
                          <SelectField
                            choices={(allTags?.filter(tag => tag.type === group.type).map(tag => ({
                              value: tag.id,
                              label: tag.name
                            })))}
                            fieldKey={`tag[${group.type}]`}
                            onChange={(e) => {
                              let selectedTag = e.value;
                              selectedTag = isNaN(selectedTag) ? parseInt(selectedTag, 10) : selectedTag;

                              updateTagListMultiple(selectedTag);
                            }}
                          />
                        ) }
                      </div>
                    )
                  })}

                  <Button appearance="primary-action-button" onClick={(e) => addComment(e, popupPosition)} type="submit">Insturen</Button>
                </form>}

            </Popup>
          )}
        </MapContainer>
        <Toaster />
      </div>
    </div>
  );
}

DocumentMap.loadWidget = loadWidget;

export { DocumentMap };

