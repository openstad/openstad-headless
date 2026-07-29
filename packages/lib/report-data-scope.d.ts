export interface ComponentDefinition {
  label: string;
  pathPattern: string;
  safeFields: string[];
  personalFields: string[];
}

export type ComponentKey =
  | 'resources'
  | 'votes'
  | 'comments'
  | 'submissions'
  | 'choiceguides';

export declare const COMPONENTS: Record<ComponentKey, ComponentDefinition>;
export declare const ALWAYS_BLOCKED_TOP_LEVEL: Set<string>;
export declare const ALWAYS_BLOCKED_USER_KEYS: Set<string>;
export declare const ALWAYS_BLOCKED_BLOBS: Set<string>;

/**
 * Returns the component key for the given URL path segment, or null if no match.
 */
export declare function matchComponent(urlPath: string): ComponentKey | null;

/**
 * Returns the combined list of fields allowed for a component given
 * the admin-configured opt-in personal fields.
 */
export declare function getExposedFields(
  componentKey: ComponentKey,
  enabledPersonalFields: string[],
): string[];

/**
 * Projects a single record object down to allowed fields and strips PII.
 */
export declare function filterRecord(
  record: Record<string, unknown>,
  allowedFields: string[],
): Record<string, unknown>;

/**
 * Filters an API payload: array, paginated { data, metadata } wrapper,
 * or single record.
 */
export declare function filterPayload(
  payload: unknown,
  allowedFields: string[],
): unknown;
