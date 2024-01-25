import React, { useCallback, useEffect, useState } from 'react';

import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';

// Can we type config better? Or should we define types for all widgetConfigs and use them as seperate props. A.k.a. likeConifg?:LikeConfig, argConfig?: ArgConfig
type Props = {
  type:
    | 'likes'
    | 'comments'
    | 'resourceoverview'
    | 'resourcedetail'
    | 'resourceform'
    | 'begrootmodule'
    | 'resourcesmap'
    | 'map'
    | 'keuzewijzer'
    | 'datecountdownbar';
  config?: any;
  projectId: string;
};

export default function WidgetPreview({ type, config, projectId }: Props) {
  // @todo: get the correct defaults
  // Dit moet alleen doorgegeven worden in config prop
  config['login'] = {
    url: `/api/auth/project/${projectId}/login?useAuth=default&redirectUri=[[REDIRECT_URI]]`,
  };

  config['logout'] = {
    url: `/api/auth/project/${projectId}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`,
  };
  const randomId = Math.floor(Math.random() * 1000000);

  const fetchWidget = useCallback(() => {
    const previewContainer = document.querySelector(
      `#widget-preview-script-holder-${randomId}`
    );

    if (previewContainer && projectId && config) {
      fetch(`/api/openstad/widget/preview?projectId=${projectId}`, {
        headers: {
          'cache-control': 'no-cache',
          'Content-Type': 'application/json',
          'Widget-Config': JSON.stringify({
            widgetType: type,
            ...config,
          }),
        },
      })
        .then((v) => {
          if (v.ok) {
            v.text().then((script) => {
              while (previewContainer.firstChild) {
                previewContainer.removeChild(previewContainer.firstChild);
              }

              if (React) {
                const sc = document.createElement('script');
                sc.setAttribute('type', 'text/javascript');
                sc.setAttribute('id', `openstad-widget-script-${randomId}`);
                sc.text = script;

                previewContainer?.appendChild(sc);
              }
            });
          }
        })
        .catch((e) => console.error(e));
    }
  }, [config, projectId, type, randomId]);

  useEffect(() => {
    fetchWidget();
  }, [fetchWidget]);

  return (
    <div id="widget-preview-container" className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Preview
      </Heading>
      <Separator className="mb-4" />
      <div id={`widget-preview-script-holder-${randomId}`}></div>
    </div>
  );
}
