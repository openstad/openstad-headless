import WidgetPreview from '@/components/widget-preview';
import { useSyncExternalStore } from 'react';

let versionsTabActive = false;
const listeners = new Set<() => void>();

export function setVersionsTabActive(active: boolean) {
  if (versionsTabActive === active) return;
  versionsTabActive = active;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

type WidgetEditorPreviewProps = {
  type: string;
  config: any;
  projectId: string;
  className?: string;
};

export default function WidgetEditorPreview({
  type,
  config,
  projectId,
  className = 'py-6 mt-6 bg-white rounded-md',
}: WidgetEditorPreviewProps) {
  const hidden = useSyncExternalStore(
    subscribe,
    () => versionsTabActive,
    () => false
  );
  if (hidden || !config) return null;
  return (
    <div className={className}>
      <WidgetPreview type={type} config={config} projectId={projectId} />
    </div>
  );
}
