import useSWR from 'swr';

export type AuditLogOptions = {
  modelName?: string;
  modelId?: string | number;
  userId?: string | number;
  projectId?: string | number;
  action?: string;
  source?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
};

export default function useAuditLog(options: AuditLogOptions) {
  const params = new URLSearchParams();

  if (options.modelName) params.set('modelName', options.modelName);
  if (options.modelId) params.set('modelId', String(options.modelId));
  if (options.userId) params.set('userId', String(options.userId));
  if (options.action) params.set('action', options.action);
  if (options.source) params.set('source', options.source);
  if (options.fromDate) params.set('fromDate', options.fromDate);
  if (options.toDate) params.set('toDate', options.toDate);
  params.set('page', String(options.page || 1));
  params.set('pageSize', String(options.pageSize || 20));

  const projectPath = options.projectId ? `/project/${options.projectId}` : '';
  const url = `/api/openstad/api${projectPath}/audit-log?${params.toString()}`;

  const swr = useSWR(url);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: !swr.data && !swr.error,
    mutate: swr.mutate,
  };
}
