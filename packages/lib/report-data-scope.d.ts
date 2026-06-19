// Type declarations for report-data-scope.js (reporting API data scope, #1647).

export interface PersonalField {
  key: string;
  label: string;
}

export interface ComponentDefinition {
  label: string;
  pathPattern: RegExp;
  safeFields: string[];
  personalFields: PersonalField[];
}

export type ComponentKey =
  | 'plans'
  | 'votes'
  | 'comments'
  | 'surveys'
  | 'choiceguides';

export interface ComponentConfig {
  enabled?: boolean;
  personalFields?: string[];
}

export const COMPONENTS: Record<ComponentKey, ComponentDefinition>;
export const COMPONENT_KEYS: ComponentKey[];

export function matchComponent(path: string): ComponentKey | null;
export function getExposedFields(
  componentKey: string,
  componentConfig: ComponentConfig | undefined | null
): string[] | null;
export function filterRecord<T extends object>(
  record: T,
  allowedFields: string[]
): Partial<T>;
export function filterPayload(payload: unknown, allowedFields: string[]): unknown;
