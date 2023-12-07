import React, { useEffect } from 'react';

import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';

// Can we type config better? Or should we define types for all widgetConfigs and use them as seperate props. A.k.a. likeConifg?:LikeConfig, argConfig?: ArgConfig
type Props = {
  type:
    | 'likes'
    | 'arguments'
    | 'resourceoverview'
    | 'resourceform'
    | 'begrootmodule'
    | 'ideasmap'
    | 'map'
    | 'keuzewijzer';
  config?: any;
  projectId: string;
  widgetId: string;
};

export default function WidgetPreview({
  type,
  config,
  projectId,
  widgetId,
}: Props) {
  // @todo: get the correct defaults
  // Dit moet alleen doorgegeven worden in config prop
  const finalConfig = config;
  finalConfig['login'] = {
    url: `/api/auth/project/${projectId}/login?useAuth=default&redirectUri=[[REDIRECT_URI]]`,
  };

  finalConfig['logout'] = {
    url: `/api/auth/project/${projectId}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`,
  };

  console.log({ finalConfig });

  useEffect(() => {
    const sc = document.createElement('script');
    const previewContainer = document.querySelector(
      '#widget-preview-script-holder'
    );

    if (previewContainer && projectId && config) {
      fetch(`/api/openstad/widget/preview`, {
        headers: {
          'Content-Type': 'application/json',
          'Widget-Config': JSON.stringify({
            widgetType: type,
            ...finalConfig,
            widgetId,
          }),
        },
      })
        .then((v) => {
          if (v.ok) {
            v.text().then((script) => {
              sc.text = script;
              sc.setAttribute('type', 'text/javascript');
              previewContainer?.appendChild(sc);
            });
          }
        })
        .catch((e) => console.error(e));
    }

    return () => {
      if (previewContainer) {
        previewContainer.childNodes.forEach((node) => {
          previewContainer.removeChild(node);
        });
      }
    };
  }, [projectId, config]);

  return (
    <div id="widget-preview-container" className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Preview
      </Heading>
      <Separator className="mb-4" />
      <div id="widget-preview-script-holder"></div>
    </div>
  );
}
