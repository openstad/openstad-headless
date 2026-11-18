import useSWR from 'swr';

export type PluginCapabilities = {
  linkRequests: boolean;
  contactHandlers: Array<{ key: string; label: string }>;
  sources: Array<{ key: string; label: string }>;
  notificationTypes: Array<{ type: string; label: string }>;
};

const NO_CAPABILITIES: PluginCapabilities = {
  linkRequests: false,
  contactHandlers: [],
  sources: [],
  notificationTypes: [],
};

export default function usePluginCapabilities() {
  const { data, error, isLoading } = useSWR(
    '/api/openstad/api/plugin/registry'
  );

  return {
    capabilities: (data?.capabilities as PluginCapabilities) || NO_CAPABILITIES,
    isLoading,
    error,
  };
}
