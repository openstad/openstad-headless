const sortingOptions = require('../../../config/sorting.js').ideasOnMapOptions;
const ideaForm = require('./idea-form');

module.exports = function createConfig({ widget, data, config, apos}) {

  console.log('data?.global?.options', data?.global?.options);

  //@TODO correct attachment url, needs formatting?
  const attachmentUrl = widget.imagePlaceholderImageSrc ?? ''; // apos.attachments.url(widget.imagePlaceholderImageSrc);
  let contentConfig = {
    ignoreReactionsForIdeaIds: widget.ignoreReactionsForIdeaIds,
  };
  if (widget.noSelectionHTML) contentConfig.noSelectionHTML = widget.noSelectionHTML; // tmp voor oude data
  if (widget.noSelectionLoggedInHTML) contentConfig.noSelectionLoggedInHTML = widget.noSelectionLoggedInHTML;
  if (widget.noSelectionNotLoggedInHTML) contentConfig.noSelectionNotLoggedInHTML = widget.noSelectionNotLoggedInHTML;
  if (widget.selectionActiveLoggedInHTML) contentConfig.selectionActiveLoggedInHTML = widget.selectionActiveLoggedInHTML;
  if (widget.selectionInactiveLoggedInHTML) contentConfig.selectionInactiveLoggedInHTML = widget.selectionInactiveLoggedInHTML;
  if (widget.mobilePreviewLoggedInHTML) contentConfig.mobilePreviewLoggedInHTML = widget.mobilePreviewLoggedInHTML;
  if (widget.selectionActiveNotLoggedInHTML) contentConfig.selectionActiveNotLoggedInHTML = widget.selectionActiveNotLoggedInHTML;
  if (widget.selectionInactiveNotLoggedInHTML) contentConfig.selectionInactiveNotLoggedInHTML = widget.selectionInactiveNotLoggedInHTML;
  if (widget.mobilePreviewNotLoggedInHTML) contentConfig.mobilePreviewNotLoggedInHTML = widget.mobilePreviewNotLoggedInHTML;
  contentConfig.showNoSelectionOnMobile = widget.showNoSelectionOnMobile;

  // image settings; todo: deze moeten syncen naar de api en dan moet de voorwaardelijkheid omgedraaid
  let allowMultipleImages = typeof widget.imageAllowMultipleImages != 'undefined' ? widget.imageAllowMultipleImages : ( ( config && config.ideas && typeof config.ideas.allowMultipleImages != 'undefined' ) ? config.ideas.allowMultipleImages : false );
  let placeholderImageSrc = typeof widget.imagePlaceholderImageSrc != 'undefined' ?  attachmentUrl : ( ( config && config.ideas && typeof config.ideas.placeholderImageSrc != 'undefined' ) ? config.ideas.placeholderImageSrc : undefined );
  
  let themeTypes;
  try {
    themeTypes = data?.global?.themes || [];
    themeTypes = themeTypes.map(type => { return {
      name: type.value,
      color: type.color,
      mapicon: JSON.parse(type.mapicon),
      listicon: JSON.parse(type.listicon || '{}'),
    }})
  } catch (err) {}
  let ideaTypes = config && config.ideas && typeof config.ideas.types != 'undefined' ? config.ideas.types : undefined;
  let typeField = widget.typeField || 'typeId';
  let types = typeField == 'typeId' ? ideaTypes : themeTypes;

  let mapLocationIcon = widget.mapLocationIcon;
  try {
    mapLocationIcon = JSON.parse(mapLocationIcon);
  } catch (err) {}
  
  const newConfig = {

    divId: 'ocs-component-ideas-on-map-' + parseInt(Math.random() * 1000000).toString(),

		display: {
      type: widget.displayType,
		  width: widget.displayWidth,
		  height: widget.displayHeight,
    },

    canSelectLocation: widget.canSelectLocation,
    onMarkerClickAction: widget.onMarkerClickAction,
    startWithListOpenOnMobile: widget.startWithListOpenOnMobile,

		linkToCompleteUrl: widget.linkToCompleteUrl && data.siteUrl + widget.linkToCompleteUrl,
    linkToUserPageUrl: widget.linkToUserPageUrl && data.siteUrl + widget.linkToUserPageUrl,

    search: {
      searchIn: { 'ideas and addresses': ['ideas', 'addresses'], 'ideas': ['ideas'], 'addresses': ['addresses'], 'none': [] }[ widget.searchIn ] || [],
      placeholder: widget.searchPlaceHolder,
      showButton: true,  // todo: naar settings?
      showSuggestions: true,  // todo: naar settings?
      defaultValue: '',  // todo: naar settings?
      addresssesMunicipality: widget.searchAddresssesMunicipality || null,
    },

    content: contentConfig,
    ideaName: widget.ideaName,

    typeField,
    types,
    filter: [{
      label: '',
      showFilter: true,
      fieldName: typeField,
      filterOptions: [{ value: '', label: widget.typesFilterLabel }].concat( types && types.map(function(type) { return { value: type.id, label: type.label || type.name } }) ),
      defaultValue: '',
    }],

    sort: {
      sortOptions: widget.selectedSorting ? widget.selectedSorting.map(key => sortingOptions.find(option => option.value == key ) ) : [],
      showSortButton: widget.selectedSorting && widget.selectedSorting.length ? true : false,
      defaultValue: widget.defaultSorting,
    },

    image: {
      aspectRatio: widget.imageAspectRatio || '16x9',
      allowMultipleImages,
      placeholderImageSrc,
    },
    
		idea: {
      formUrl: widget.formUrl && data.siteUrl + widget.formUrl,
      showVoteButtons: config && config.ideas && typeof config.ideas.showVoteButtons != 'undefined' ? config.ideas.showVoteButtons : true,
      showLabels: config && config.ideas && typeof config.ideas.showLabels != 'undefined' ? config.ideas.showLabels : true,
      canAddNewIdeas: config && config.ideas && typeof config.ideas.canAddNewIdeas != 'undefined' ? config.ideas.canAddNewIdeas : true,
			titleMinLength: ( config && config.ideas && config.ideas.titleMinLength ) || 30,
			titleMaxLength: ( config && config.ideas && config.ideas.titleMaxLength ) || 200,
			summaryMinLength: ( config && config.ideas && config.ideas.summaryMinLength ) || 30,
			summaryMaxLength: ( config && config.ideas && config.ideas.summaryMaxLength ) || 200,
			descriptionMinLength: ( config && config.ideas && config.ideas.descriptionMinLength ) || 30,
			descriptionMaxLength: ( config && config.ideas && config.ideas.descriptionMaxLength ) || 200,
			allowMultipleImages,
      fields: ideaForm.getWidgetFormFields(widget),
      shareChannelsSelection: widget.showShareButtons ? widget.shareChannelsSelection : [],
      metaDataTemplate: widget.metaDataTemplate,
		},

    poll: config && config.polls,

    argument: {
      isActive: widget.showReactions,
      title: widget.reactionsTitle,
      formIntro: widget.reactionsFormIntro,
      placeholder: widget.reactionsPlaceholder,
			descriptionMinLength: ( config && config.arguments && config.arguments.descriptionMinLength ) || 30,
			descriptionMaxLength: ( config && config.arguments && config.arguments.descriptionMaxLength ) || 100,
      isClosed: typeof widget.reactionsClosed != 'undefined' ? !!widget.reactionsClosed : (config && config.arguments && typeof config.arguments.isClosed != 'undefined' ? config.arguments.isClosed : false),
      closedText: typeof widget.reactionsClosedText != 'undefined' ? widget.reactionsClosedText : (config && config.arguments && typeof config.arguments.closedText != 'undefined' ? config.arguments.closedText : true),
      closeReactionsForIdeaIds: widget.reactionsClosed === '' && widget.closeReactionsForIdeaIds || '',
		},

    map: {
      variant: widget.mapVariant || '',
      mapTiles: {
        url: widget.mapTilesUrl,
        subdomains: widget.mapTilesSubdomains || '',
        attribution: widget.mapTilesAttribution || '',
      },
      zoom: 16,
      clustering: {
        isActive: widget.mapClustering,
        maxClusterRadius: widget.mapMaxClusterRadius,
      },
      locationIcon: mapLocationIcon,
      autoZoomAndCenter: widget.mapAutoZoomAndCenter,
      area: data?.global?.mapPolygons || ( config && config.openstadMap && config.openstadMap.polygon ) || undefined,
      showCoverageOnHover: false,
		},

    vote: {
      isViewable: config && config.votes && config.votes.isViewable,
      isActive: config && config.votes && config.votes.isActive,
      isActiveFrom: config && config.votes && config.votes.isActiveFrom,
      isActiveTo: config && config.votes && config.votes.isActiveTo,
      requiredUserRole: config && config.votes && config.votes.requiredUserRole || 'admin',
      voteType: config && config.votes && config.votes.voteType,
      voteValues: config && config.votes && config.votes.voteValues,
    },

  }

  return newConfig;

}
