export type ProjectImportErrorCode = 'invalid-json' | 'not-a-project';

export class ProjectImportError extends Error {
  code: ProjectImportErrorCode;

  constructor(code: ProjectImportErrorCode) {
    super(code);
    this.name = 'ProjectImportError';
    this.code = code;
  }
}

export type MissingPart = 'config' | 'emailConfig';
export type NotImportedPart = 'statuses' | 'resources';

export type ProjectImportPayload = {
  name: string;
  title: string;
  config?: Record<string, unknown>;
  emailConfig?: Record<string, unknown>;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFilledArray = (value: unknown) =>
  Array.isArray(value) && value.length > 0;

export function buildProjectImportPayload(fileText: string, name: string) {
  let data: unknown;
  try {
    data = JSON.parse(fileText);
  } catch {
    throw new ProjectImportError('invalid-json');
  }

  if (!isPlainObject(data)) {
    throw new ProjectImportError('not-a-project');
  }

  const missing: MissingPart[] = [];
  const notImported: NotImportedPart[] = [];

  const title =
    typeof data.title === 'string' && data.title ? data.title : name;

  const payload: ProjectImportPayload = {
    name,
    title,
  };

  if (isPlainObject(data.config)) {
    payload.config = data.config;
  } else {
    missing.push('config');
  }

  if (isPlainObject(data.emailConfig)) {
    payload.emailConfig = data.emailConfig;
  } else {
    missing.push('emailConfig');
  }

  if (isFilledArray(data.statuses)) notImported.push('statuses');
  if (isFilledArray(data.resources)) notImported.push('resources');

  return { payload, missing, notImported };
}
