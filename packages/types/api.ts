// Entity types as returned (JSON) by the api-server, derived from
// apps/api-server/src/models. Dates are ISO strings, nullable columns are
// `| null`, and associations that only appear with an `include*` scope are
// optional. Named `Api*` to avoid clashing with the widget-oriented `Comment`
// export and the DOM `Comment` global.

// Free-form JSON whose keys are defined per project/widget configuration
// (extraData, config, settings, submittedData); there is no fixed schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DynamicJson = Record<string, any>;

export type ApiTimestamps = {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
  links?: {
    self: string;
    first: string;
    last: string;
    previous?: string;
    next?: string;
  };
};

// Shape of list endpoints when `page` or `noPagination=true` is passed.
export type Paginated<T> = {
  metadata: PaginationMetadata;
  records: T[];
};

export type ApiRole =
  | 'superuser'
  | 'admin'
  | 'moderator'
  | 'editor'
  | 'member'
  | 'anonymous'
  | 'all';

export type ApiLocation = {
  lat: number;
  lng: number;
};

export type ApiFile = {
  url: string;
  name?: string;
};

export type ApiUser = ApiTimestamps & {
  id: number;
  projectId: number | null;
  idpUser: {
    identifier?: string | number;
    provider?: string;
    accesstoken?: string;
  };
  role: string;
  extraData: DynamicJson;
  email: string | null;
  nickName: string | null;
  name: string | null;
  firstname?: string | null;
  lastname?: string | null;
  listableByRole?: ApiRole | null;
  detailsViewableByRole?: ApiRole | null;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  fullName?: string;
  displayName?: string;
  lastLogin?: string;
  isNotifiedAboutAnonymization?: string | null;
  emailNotificationConsent?: boolean | null;
  autoAddToNewProjects?: boolean;
  privacyConsentAt?: string | null;
  // Associations
  project?: Partial<ApiProject>;
};

export type ApiTag = ApiTimestamps & {
  id: number;
  projectId: number;
  name: string;
  type: string | null;
  seqnr: number;
  addToNewResources: boolean;
  label: string | null;
  color: string | null;
  backgroundColor: string | null;
  mapIcon: string | null;
  listIcon: string | null;
  extraData: DynamicJson;
  useDifferentSubmitAddress: boolean | null;
  newSubmitAddress: string | null;
  defaultResourceImage: string | null;
  documentMapIconColor: string | null;
};

export type ApiStatusExtraFunctionality = {
  editableByUser?: boolean;
  canComment?: boolean;
  canLike?: boolean;
};

export type ApiStatus = ApiTimestamps & {
  id: number;
  projectId: number;
  name: string;
  seqnr: number;
  addToNewResources: boolean;
  label: string | null;
  color: string | null;
  backgroundColor: string | null;
  mapIcon: string | null;
  listIcon: string | null;
  extraFunctionality: ApiStatusExtraFunctionality;
  extraData: DynamicJson;
};

export type ApiResource = ApiTimestamps & {
  id: number;
  projectId: number;
  widgetId: number | null;
  userId: number | null;
  startDate: string;
  // DECIMAL columns are serialised as strings by mysql2.
  score: string;
  sort: number;
  viewableByRole: ApiRole | null;
  title: string;
  summary: string | null;
  description: string | null;
  images: ApiFile[] | null;
  documents: ApiFile[] | null;
  budget: number | null;
  extraData: DynamicJson;
  timeline?: DynamicJson | null;
  location: ApiLocation | null;
  modBreaks?: DynamicJson[] | null;
  publishDate: string | null;
  isSpam: boolean;
  // Virtuals
  startDateHumanized?: string;
  createDateHumanized?: string;
  publishDateHumanized?: string;
  modBreak?: string;
  modBreakDateHumanized?: string;
  modBreaksHumanized?: string;
  progress?: number;
  netVotes?: number;
  // includeVoteCount / summary / includeCommentsCount
  yes?: number;
  no?: number;
  commentCount?: number;
  // Associations
  user?: Partial<ApiUser> | null;
  tags?: Partial<ApiTag>[];
  statuses?: Partial<ApiStatus>[];
  commentsFor?: ApiComment[];
  commentsAgainst?: ApiComment[];
  commentsNoSentiment?: ApiComment[];
  userVote?: ApiVote | null;
  poll?: ApiPoll | null;
};

export type ApiCommentSentiment = 'for' | 'against' | 'no sentiment';

export type ApiComment = ApiTimestamps & {
  id: number;
  parentId: number | null;
  resourceId: number;
  userId: number;
  sentiment: ApiCommentSentiment;
  description: string;
  label: string | null;
  location: ApiLocation | null;
  // DECIMAL columns are serialised as strings by mysql2.
  score?: string;
  // Virtuals
  yes?: number;
  // includeVoteCount
  no?: number;
  netVotes?: number;
  hasUserLiked?: boolean;
  hasUserDisliked?: boolean;
  confirmationSent?: boolean;
  createDateHumanized?: string;
  // Associations
  user?: Partial<ApiUser> | null;
  replies?: ApiComment[];
  tags?: Partial<ApiTag>[];
  resource?: Partial<ApiResource>;
};

export type ApiProject = ApiTimestamps & {
  id: number;
  name: string | null;
  title: string | null;
  url: string | null;
  config: DynamicJson;
  emailConfig: DynamicJson;
  hostStatus: DynamicJson;
  areaId: number | null;
  auditIncidentAt?: string | null;
  // Virtuals
  safeConfig?: DynamicJson;
  installationUrls?: DynamicJson;
};

export type ApiWidget = ApiTimestamps & {
  id: number;
  projectId: number;
  type: string;
  description: string;
  config: DynamicJson;
};

export type ApiArea = ApiTimestamps & {
  id: number;
  name: string;
  hidePolygon: boolean;
  polygon: DynamicJson;
  geoJSON?: DynamicJson;
  tags?: Partial<ApiTag>[];
  outsideTags?: Partial<ApiTag>[];
};

export type ApiDatalayer = ApiTimestamps & {
  id: number;
  name: string;
  layer: DynamicJson;
  icon: DynamicJson;
};

// Marker as persisted by the admin markers editor (zod defaults applied).
export type ApiMapMarker = {
  lat: number;
  lng: number;
  title: string;
  description: string;
  color: string;
  icon: string;
  iconUploader?: string;
  url: string;
  openInNewTab: boolean;
  buttonText: string;
};

export type ApiMarkers = ApiTimestamps & {
  id: number;
  projectId?: number;
  name: string;
  markers: ApiMapMarker[];
};

export type ApiSubmission = ApiTimestamps & {
  id: string;
  projectId: number | null;
  userId: number | null;
  widgetId?: number | null;
  status: 'approved' | 'pending' | 'unapproved';
  submittedData: DynamicJson;
  isSpam: boolean;
  user?: Partial<ApiUser> | null;
};

export type ApiVote = ApiTimestamps & {
  id: number;
  resourceId: number;
  userId: number;
  confirmed: boolean | null;
  confirmReplacesVoteId: number | null;
  ip: string | null;
  opinion: string | null;
  checked: boolean | null;
  resource?: Partial<ApiResource>;
  user?: Partial<ApiUser> | null;
};

export type ApiPoll = ApiTimestamps & {
  id: number;
  resourceId: number;
  userId: number;
  status: 'OPEN' | 'CLOSED';
  question: string;
  choices: string | null;
  userVote?: DynamicJson;
  voteCount?: DynamicJson;
};

export type ApiNotificationTemplate = ApiTimestamps & {
  id: number;
  projectId: number;
  engine: 'email' | 'sms' | 'carrier pigeon';
  type: string | null;
  label: string;
  subject: string | null;
  body: string | null;
};

export type ApiAuditLog = ApiTimestamps & {
  id: number;
  projectId: number | null;
  userId: number | null;
  userName: string | null;
  userRole: string | null;
  action: string;
  modelName: string;
  modelId: number | null;
  previousData: DynamicJson | null;
  newData: DynamicJson | null;
  ipAddress: string | null;
  hostname: string | null;
  userAgent: string | null;
  routePath: string | null;
  referer: string | null;
  statusCode: number | null;
  source: 'api' | 'auth';
};

export type ApiAction = ApiTimestamps & {
  id: number;
  projectId: number | null;
  accountId: number | null;
  status: 'active' | 'inactive';
  priority: number | null;
  name: string | null;
  type: 'continuously' | 'once' | null;
  runDate: string;
  finished: boolean | null;
  settings: DynamicJson;
  conditions: DynamicJson | null;
  action: string | null;
};

export type ApiTemplate = {
  id: number;
  name: string;
  data: DynamicJson;
  createdAt: string;
  updatedAt: string;
};

// Audit-log list endpoint uses its own pagination wrapper.
export type ApiAuditLogList = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  records: (ApiAuditLog & { projectName: string | null })[];
};

// auth-server (apps/auth-server/model) entities.
export type AuthAccessCode = {
  id: number;
  code: string;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type AuthUniqueCode = {
  id: number;
  code: string;
  userId: number | null;
  clientId: number;
  createdAt: string;
  updatedAt: string;
};

export type AuthCodeList<T> = {
  total: number;
  data: T[];
};

export type ApiTokenStatus = 'active' | 'expired' | 'revoked';

export type ApiToken = {
  id: number;
  userId: number;
  projectId: number;
  name: string | null;
  tokenPrefix: string;
  lastFour: string;
  // Every token expires; there is no "never expires" state.
  expiresAt: string;
  lastUsedAt: string | null;
  createdAt: string;
  status: ApiTokenStatus;
  // Only present on the project-level overview endpoint
  owner?: { id: number; name: string | null } | null;
  // True when the token belongs to a superuser on the admin project and is
  // shown in another project's overview (read-only there)
  isSuperUserToken?: boolean;
  // Only present immediately after creation
  token?: string;
};
