import { CoreWidgetDefinitions } from '@/lib/widget-definitions';
import useSWR from 'swr';

type WidgetDefinitionEntry = {
  name: string;
  description: string;
  image: string;
};

export type WidgetDefinitionsMap = Record<string, WidgetDefinitionEntry>;

export function useWidgetDefinitions(): WidgetDefinitionsMap {
  const { data } = useSWR<WidgetDefinitionsMap>('/api/widget-definitions');

  return data || CoreWidgetDefinitions;
}
