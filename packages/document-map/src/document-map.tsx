import DataStore from '@openstad-headless/data-store/src';
import { Comments } from '@openstad-headless/comments/src/comments';
import hasRole from '../../lib/has-role';
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
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import { Likes, LikeWidgetProps } from '@openstad-headless/likes/src/likes';

import MarkerIcon from '@openstad-headless/leaflet-map/src/marker-icon';
import { Filters } from "@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter";
import SelectField from "@openstad-headless/ui/src/form-elements/select";
import { MultiSelect } from "@openstad-headless/ui/src";
import { Spacer } from '@openstad-headless/ui/src';
import NotificationService from "../../lib/NotificationProvider/notification-service";
import NotificationProvider from "../../lib/NotificationProvider/notification-provider";
import './gesture';

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
    infoPopupButtonText?: string;
    openInfoPopupOnInit?: string;
    closedText?: string;
    relativePathPrepend?: string;
    entireDocumentVisible?: 'entirely' | 'onlyTop';
    itemsPerPage?: number;
    displayPagination?: boolean;
    onlyAllowClickOnImage?: boolean;
    popupNotLoggedInText?: string;
    popupNotLoggedInButton?: string;
    minCharactersWarning?: string;
    maxCharactersWarning?: string;
    minCharactersError?: string;
    maxCharactersError?: string;
    filterBehavior?: string;
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
  loginText = 'Inloggen om deel te nemen aan de discussie',
  emptyListText = 'Nog geen reacties geplaatst',
  infoPopupButtonText = '',
  openInfoPopupOnInit = 'no',
  closedText = 'Het insturen van reacties is gesloten, u kunt niet meer reageren',
  relativePathPrepend = '',
  entireDocumentVisible = 'onlyTop',
  itemsPerPage = 9999,
  displayPagination = false,
  onlyAllowClickOnImage = false,
  popupNotLoggedInText = 'Om een reactie te plaatsen, moet je ingelogd zijn.',
  popupNotLoggedInButton = 'Inloggen',
  filterBehavior = 'or',
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

  const stringToArray = (str: string) => {
    return str.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
  }

  const tagIdsArray = stringToArray(tagIds);

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

  const urlParams = new URLSearchParams(window.location.search);
  const urlTagIds = urlParams.get('tagIds');
  const urlTagIdsArray = urlTagIds ? stringToArray(urlTagIds) : [];

  const [selectedTags, setSelectedTags] = useState<Array<number>>(urlTagIdsArray);
  const [selectedTagsString, setSelectedTagsString] = useState<string>( urlTagIdsArray?.join(',') || '' );

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

    if (e.target.value.length > 0) {
      characterHelpText(e.target.value.length);
    } else {
      setHelpText('');
    }
  };


  useEffect(() => {
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

        if (filterBehavior === 'and') {
          return finalAllTagsToFilter.every(tagId =>
            comment.tags?.some((tag: { id: number }) => tag.id === tagId)
          );
        } else {
          return comment.tags?.some((tag: { id: number }) =>
            finalAllTagsToFilter.includes(tag.id)
          );
        }
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


  const [docWidth, setDocumentWidth] = useState<number>(0);
  const [docHeight, setDocumentHeight] = useState<number>(0)
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

  const [bounds, setBounds] = useState<Array<Array<number>> | null>(null);

  useEffect(() => {
    if (!docWidth || !docHeight) return;

    const basicBounds: LatLngBoundsLiteral = [
      [0, docWidth / 2],
      [-docHeight, -docWidth / 2]
    ];

    const extendedBounds: LatLngBoundsLiteral = [
      [basicBounds[0][0] + (docHeight * .2), basicBounds[0][1] + (docWidth * .2)],
      [basicBounds[1][0] - (docHeight * .2), basicBounds[1][1] - (docWidth * .2)]
    ];

    setBounds(extendedBounds as number[][]);
  }, [docWidth, docHeight]);

  const contentRef = useRef<HTMLDivElement>(null);
  const [randomId, setRandomId] = useState('');
  const [helpText, setHelpText] = useState('');

  const characterHelpText = (count: number) => {
    let helpText = '';

    const min = props.comments?.descriptionMinLength || 0;

    const minWarningText = props?.minCharactersWarning || 'Nog minimaal {minCharacters} karakters';
    let minWarning = minWarningText.replace('{minCharacters}', (min - count).toString());

    const max = props.comments?.descriptionMaxLength || Infinity;

    if (count < min) {
      helpText = minWarning;
    } else if (count > max) {
      const maxWarningText = props?.maxCharactersWarning || 'Je hebt {maxCharacters} karakters teveel';
      helpText = maxWarningText.replace('{maxCharacters}', (count - max).toString());
    } else {
      helpText = '';
    }

    setHelpText(helpText);
  };

  const [toggleMarker, setToggleMarker] = useState(true);

  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        if ( onlyAllowClickOnImage ) {
          const imageBounds = bounds;
          const clickedLatLng = e.latlng;

          if (imageBounds && imageBounds.length) {
            // @ts-ignore
            const leafletBounds = L.latLngBounds(imageBounds);
            if (leafletBounds.contains(clickedLatLng)) {
              setPopupPosition(e.latlng);
            }
          }
        } else {
          setPopupPosition(e.latlng);
        }
      },
      popupclose: () => {
        setSelectedCommentIndex(-1);
        setSelectedMarkerIndex(-1);
        setPopupPosition(null);
      },
    });


    useEffect(() => {
      if (map && bounds && !!docHeight && !!docWidth && !isBoundsSet) {
        if (entireDocumentVisible === 'entirely') {
          map.fitBounds(bounds as LatLngBoundsLiteral);
        } else {
          map.setMaxBounds(bounds as LatLngBoundsLiteral);
          const topLeft = bounds[0];
          const topRight = [bounds[0][0], bounds[1][1]];

          const topBounds: LatLngBoundsLiteral = [
            [topLeft[0], topLeft[1]],
            [topRight[0], topRight[1]]
          ];

          try {
            map.flyToBounds(topBounds, { animate: true, duration: 0.2 });
            map.scrollWheelZoom.disable();
          } catch (e) {
            // Fall back to entire document view
            map.fitBounds(bounds as LatLngBoundsLiteral);
          }
        }
        setIsBoundsSet(true);
      }
    }, [map, bounds, isBoundsSet]);

    return null;
  };

  const notifySuccess = () => NotificationService.addNotification("Uw reactie is succesvol geplaatst!", "success");
  const notifyFailed = () => NotificationService.addNotification("Uw reactie kon niet geplaatst worden", "error");

  const addComment = async (e: any, position: any) => {
    e.preventDefault();
    e.stopPropagation();

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

        if (goToLastPage && displayPagination) {
          goToLastPage();
        }

        const addNewCommentToComments = [...filteredComments, newComment];
        const newIndex = newComment?.id;

        setFilteredComments(addNewCommentToComments);
        setPopupPosition(null);
        setCommentValue('');
        setHelpText('');
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
      setBackUrl(relativePathPrepend + '/' + window.location.hash.split('=')[1] + (window.location.hash.split('=')[2] !== undefined ? '=' + window.location.hash.split('=')[2] : ''));
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
    color: string;
  }

  const [overridePage, setoverridePage] = useState<number | undefined>(undefined);

  const isScrollable = function (ele: HTMLElement) {
    const hasScrollableContent = ele.scrollHeight > ele.clientHeight;
    const overflowYStyle = window.getComputedStyle(ele).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

    return hasScrollableContent && !isOverflowHidden;
  };

  const scrollToComment = (index: number) => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 100;

    const tryScrollToComment = () => {
      const getAllComments = Array.from(document.getElementsByClassName('comment-item'));
      getAllComments.forEach((comment, i) => {
        if (i !== index) {
          comment.classList.remove('selected');
        }
      });

      if (displayPagination) {
        const currentComment = filteredComments?.findIndex((comment: any) => parseInt(comment.id) === index);
        const commentPage = Math.floor(currentComment / itemsPerPage);

        setoverridePage(commentPage);
      }

      const commentElement = document.getElementById(`comment-${index}`);
      if (commentElement) {
        const containerElement = document.querySelector('.document-map-info-container');

        const commentEl = commentElement as HTMLElement;
        const containerEl = containerElement as HTMLElement;

        if (commentElement && containerElement) {
          const commentRect = commentEl.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const commentTop = commentRect.top + scrollTop;

          const canScrollCommentContainer = isScrollable(containerEl);

          if (canScrollCommentContainer) {
            containerEl.scrollTo({
              top: commentEl.offsetTop - containerEl.offsetTop,
              behavior: 'smooth'
            });
          } else {
            window.scrollTo({
              top: commentTop,
              behavior: 'smooth'
            });
          }

          commentEl.classList.add('selected');
          clearInterval(intervalId);
        } else if (attempts < maxAttempts) {
          attempts++;
        } else {
          clearInterval(intervalId);
        }
      };
    }
      const intervalId = setInterval(tryScrollToComment, interval);
    };

    const MarkerWithId: React.FC<ExtendedMarkerProps> = ({ id, index, color, ...props }) => {
      const markerRef = useRef<any>(null);
      const isDefaultColor = color === '#555588';

      return (
          <Marker
              {...props}
              ref={markerRef}
              icon={MarkerIcon({
                icon: {
                  className: `${index === selectedMarkerIndex ? '--highlightedIcon' : '--defaultIcon'} ${isDefaultColor ? 'basic-icon' : ''} id-${index}`,
                  color: !isDefaultColor ? color : undefined,
                },
              })}
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

    const modalRef = useRef<HTMLDivElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [manualFocus, setManualFocus] = useState(false);

    const setModalOpen = (state: boolean) => {
      setIsModalOpen(state);
      setManualFocus(state);
    };

    const trapFocus = (event: KeyboardEvent) => {
      if (!modalRef.current || !isModalOpen) return;

      const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input, select'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };


    const mapRef = useRef<any>(null);

    useEffect(() => {
      const map = mapRef.current;
      if (map) {
        if (popupPosition) {
          map.setMaxBounds( [] );
        } else {
          map.setMaxBounds(bounds);
        }
      }
    }, [popupPosition]);

    useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setModalOpen(false);
        }
      };

      if (isModalOpen) {
        document.addEventListener('keydown', trapFocus);
        document.addEventListener('keydown', handleEsc);
      } else {
        document.removeEventListener('keydown', trapFocus);
        document.removeEventListener('keydown', handleEsc);
      }

      return () => {
        document.removeEventListener('keydown', trapFocus);
        document.removeEventListener('keydown', handleEsc);
      };
    }, [isModalOpen]);

    // Focus management when modal opens
    useEffect(() => {
      if (isModalOpen && modalRef.current && manualFocus) {
        modalRef.current.focus();
      }
    }, [isModalOpen]);

    useEffect(() => {
      if (openInfoPopupOnInit === 'yes') {
        setIsModalOpen(true);
        setManualFocus(false);
      }
    }, []);

    const [showButton, setShowButton] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const handleScroll = () => {
        if (containerRef.current) {
          const containerTop = containerRef.current.offsetTop;
          const currentScroll = window.scrollY;

          if (currentScroll > containerTop) {
            setShowButton(true);
          } else {
            setShowButton(false);
          }
        }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    const scrollToTop = () => {
      if (containerRef.current) {
        const container = containerRef.current as HTMLElement;
        const containerRect = container.getBoundingClientRect();
        const scrollPosition = window.pageYOffset + containerRect.top;

        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    };

    const configVotingEnabled = props?.votes?.isActive || false;
    const votingEnabled = configVotingEnabled && args.canComment;

    // const [goToPage, setGoToPage] = useState<((page:number) => void) | null>(null);
    const [goToLastPage, setGoToLastPage] = useState<(() => void) | null>(null);

    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
      if ('ontouchstart' in window) {
        setIsTouchDevice(true);
      }
    }, []);

    useEffect(() => {
      const map = mapRef.current;
      let mapInteractionInstance: any;

      if (map && L && L.mapInteraction) {
        mapInteractionInstance = L.mapInteraction(map, {
          isTouch: isTouchDevice,
        });
      }

      return () => {
        if (mapInteractionInstance && mapInteractionInstance.destroy) {
          mapInteractionInstance.destroy();
        }
      };
    }, [mapRef.current, isTouchDevice]);

    return !bounds ? null : (
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
                  {resource.summary ? <Heading level={2} appearance='utrecht-heading-4' dangerouslySetInnerHTML={{ __html: resource.summary }}></Heading> : null}

                  {(displayResourceDescription === 'yes' && resource.description) ? <Paragraph dangerouslySetInnerHTML={{ __html: resource.description }} /> : null}
                </section>
              )}
            </div>
          )}

          {displayResourceInfo === 'right' && (
            <div className="content-container mobileonly">
              <section className="content-intro">
                {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
                {resource.summary ? <Heading level={2} appearance='utrecht-heading-4' dangerouslySetInnerHTML={{ __html: resource.summary }}></Heading> : null}

                {(displayResourceDescription === 'yes' && resource.description) ? <Paragraph dangerouslySetInnerHTML={{ __html: resource.description }} /> : null}
              </section>
            </div>
          )}
          <div className='document-container'>
            <MapContainer
                ref={mapRef}
                center={[0, 0]}
                crs={CRS.Simple}
                maxZoom={maxZoom}
                minZoom={minZoom}
                zoom={zoom}
                zoomSnap={0}
                maxBounds={popupPosition ? undefined : bounds as LatLngBoundsLiteral}
            >
              <MapEvents />
              {filteredComments && filteredComments
                .filter((comment: any) => !!comment.location)
                .map((comment: any) => {

                  const firstTag = comment.tags
                    ? comment.tags
                    .filter((tag: { seqnr: number }) => tag.seqnr !== undefined && tag.seqnr !== null)
                    .sort((a: { seqnr: number }, b: { seqnr: number }) => a.seqnr - b.seqnr)[0] || comment.tags[0]
                    : false;

                  const documentMapIconColor = firstTag && firstTag.documentMapIconColor ? firstTag.documentMapIconColor : '#555588';

                  return (
                      <MarkerWithId
                          key={comment?.id}
                          id={`marker-${comment?.id}`}
                          index={comment?.id}
                          position={comment.location}
                          color={documentMapIconColor}
                      />
                  );
                })}
              <ImageOverlay
                url={resource.images ? resource.images[0].url : ''}
                bounds={bounds as LatLngBoundsLiteral}
                aria-describedby={randomId}
              />
              {(popupPosition && !isDefinitive && args.canComment) && (
                <Popup
                  position={popupPosition}
                  eventHandlers={{
                    popupclose: () => setPopupPosition(null),
                  }}
                >
                  { !hasRole(currentUser, args.requiredUserRole) ? (
                    <>
                      <Paragraph>{popupNotLoggedInText}</Paragraph>
                      <Spacer size={1} />
                      <Button
                        appearance="primary-action-button"
                        onClick={() => {
                          if (props.login?.url) {
                            document.location.href = props.login?.url;
                          }
                        }}
                        type="button">
                        {popupNotLoggedInButton}
                      </Button>
                    </>
                  ) :
                    <form>
                      <div>
                        <FormLabel htmlFor="commentBox">{addCommentText}</FormLabel>
                        {helpText && <Paragraph className="--error">{helpText}</Paragraph>}

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

            { !!args.canComment && (
              <>
                <Button className={`info-trigger ${infoPopupButtonText ? 'button-has-text' : ''}`}
                        appearance='primary-action-button' onClick={() => setModalOpen(true)}>
                  <i className="ri-information-line"></i>
                  {infoPopupButtonText && (
                      <span className="trigger-text">{infoPopupButtonText}</span>
                  )}
                  <span className="sr-only">{infoPopupButtonText || 'Hoe werkt het?'}</span>
                </Button>


                <div className="modal-overlay" aria-hidden={isModalOpen ? "false" : "true"}>
                  <div
                      ref={modalRef}
                      className="modal"
                      role="dialog"
                      aria-labelledby="modal-title"
                      aria-modal="true"
                      tabIndex={-1}
                  >
                    <Button appearance='subtle-button' aria-label="Info venster sluiten" onClick={() => setModalOpen(false)}>
                      <i className="ri-close-fill"></i>
                      <span>Info venster sluiten</span>
                    </Button>
                    <Heading level={3}>Hoe werkt het?</Heading>
                    <Spacer size={1}/>
                    <Paragraph>{infoPopupContent}</Paragraph>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
        <div className="content document-map-info-container" ref={contentRef}>
          {!isDefinitive && (
            <>
              <div className='toggleMarkers'>
                <Checkbox id="toggleMarkers" defaultChecked onChange={() => setToggleMarker(!toggleMarker)} />
                <FormLabel htmlFor="toggleMarkers"> <Paragraph>{addMarkerText}</Paragraph> </FormLabel>
              </div>
              {displayLikes && (
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
                    displayDislike={props.likeWidget?.displayDislike}
                    disabled={!votingEnabled}
                  />
                  <Spacer size={1} />
                </>
              )}
              {backUrl !== undefined && (
                <div className="osc back-url-container">
                  <div className="banner">
                    <Spacer size={2}/>
                    <Heading6>{props.backUrlContent}</Heading6>
                    <Spacer size={1}/>
                    <a
                      href={backUrl}
                      className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
                      title="Terug naar overzicht"
                      id={randomId}
                    >
                      {props.backUrlText}
                    </a>
                    <Spacer size={2}/>
                  </div>
                  <Spacer size={2}/>
                </div>
              )}

            </>
          )}

          {displayResourceInfo === 'right' && (
            <section className="content-intro desktoponly">
              {resource.title ? <Heading level={1} appearance='utrecht-heading-2'>{resource.title}</Heading> : null}
              <Spacer size={1}/>
              {resource.summary ? <Heading level={2} appearance='utrecht-heading-4' dangerouslySetInnerHTML={{ __html: resource.summary }}></Heading> : null}

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
              preFilterTags={urlTagIdsArray}
            />
          ) : null}

          {!isDefinitive && (
            <div ref={containerRef}>
              <Comments
                {...props}
                key={refreshComments ? 'refresh' : 'no-refresh'}
                onlyIncludeTags={selectedTagsString || filteredTagsIdsString || ''}
                resourceId={resourceId || ''}
                selectedComment={selectedCommentIndex}
                setRefreshComments={setRefreshComments}
                showForm={false}
                emptyListText={emptyListText}
                loginText={loginText}
                closedText={closedText}
                itemsPerPage={itemsPerPage}
                displayPagination={displayPagination}
                onGoToLastPage={setGoToLastPage}
                overridePage={overridePage}
              />
            </div>
          )}
        </div>

        <button
              className={`back-to-top ${showButton ? "show" : ""}`}
              onClick={scrollToTop}
          >
            <i className="ri-arrow-up-line"></i>
          </button>

        <NotificationProvider />

      </div>

    );
  }

  DocumentMap.loadWidget = loadWidget;

  export { DocumentMap };
