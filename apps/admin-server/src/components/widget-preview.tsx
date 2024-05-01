import React, { useCallback, useEffect, useContext } from 'react';

import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { WidgetDefinition } from '@/lib/widget-definitions';
import { SessionContext } from '../auth';

// Can we type config better? Or should we define types for all widgetConfigs and use them as seperate props. A.k.a. likeConifg?:LikeConfig, argConfig?: ArgConfig
type Props = {
  type: WidgetDefinition;
  config?: any;
  projectId: string;
};

export default function WidgetPreview({ type, config, projectId }: Props) {

  const sessionData = useContext(SessionContext);

  useEffect(() => {
    let userAsString = JSON.stringify({ id: sessionData.id, role: sessionData.role, jwt: sessionData.jwt });
    const script = document.createElement('script');
    if (sessionData.id) {
      script.innerHTML = `var globalOpenStadUser = ${userAsString || ''};`;
    }
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, [sessionData]);

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
