import React, { useEffect, useState } from 'react';

import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import Likes, { LikeProps } from '@openstad-headless/likes/src/likes';
import { useWidgetConfig } from '@/hooks/use-widget-config';

// Can we type config better? Or should we define types for all widgetConfigs and use them as seperate props. A.k.a. likeConifg?:LikeConfig, argConfig?: ArgConfig
type Props = {
  type:
    | 'like'
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
  if (!projectId) {
    return <>No project id</>;
  }
  const { data: widget } = useWidgetConfig();

  const loginUrl = `/api/auth/project/${projectId}/login?useAuth=default&redirectUri=[[REDIRECT_URI]]`;
  const logoutUrl = `/api/auth/project/${projectId}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;

  // @todo: get the correct defaults
  // Dit moet alleen doorgegeven worden in config prop
  const widgetConfig: LikeProps = {
    apiUrl: '/api/openstad',
    login: {
      url: loginUrl,
    },
    logout: {
      url: logoutUrl,
    },
    projectId: projectId,
    ideaId: 1,
    title: 'Vind je dit een goed idee?',
    hideCounters: true,
    variant: 'medium',
    yesLabel: 'Ik ben voor',
    noLabel: 'Ik ben tegen',
    ...widget?.config?.[type],
    ...config,
    ...config?.[type],
  };

  const [objUrl, setObjUrl] = useState<string>();

  useEffect(() => {
    const previewContainer = document.querySelector(
      '#widget-preview-script-holder'
    );

    fetch(`/api/openstad/widget/preview`, {
      headers: {
        'Content-Type': 'application/json',
        'Widget-Config': JSON.stringify({
          widgetType: 'likes',
          ...widgetConfig,
        }),
      },
    })
      .then((v) => {
        if (v.ok) {
          v.blob().then((script) => {
            const objectUrl = URL.createObjectURL(script);
            setObjUrl(objectUrl);
          });
        }
      })
      .catch((e) => console.error(e));
  }, [projectId]);

  console.log(objUrl);

  return (
    <div id="widget-preview-container" className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Preview
      </Heading>
      <Separator className="mb-4" />
      <div id="widget-preview-script-holder" style={{ minHeight: 400 }}></div>

      <script src={objUrl} async={true}></script>

      {/* Ideally we would just import the widget here, but with the Likes widget for instance, i'm getting some weird import issues that I need to solve first */}
      {/* {widgetId ? ( */}
    </div>
  );
}
