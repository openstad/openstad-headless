import React from 'react';

import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import Likes from '@openstad-headless/likes/src/likes';
import { useWidgetConfig } from "@/hooks/use-widget-config";

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
  projectId: number;
};



export default function WidgetPreview({ type, config, projectId }: Props) {

    if (!projectId) {
        return (<>No project id</>);
    }

    const {
      data: widget,
    } = useWidgetConfig();

    const loginUrl = `/api/auth/project/${projectId}/login?useAuth=default&redirectUri=[[REDIRECT_URI]]`;
    const logoutUrl = `/api/auth/project/${projectId}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;

    // @todo: get the correct defaults
    const widgetConfig = {
      apiUrl: '/api/openstad',
      login: {
        url: loginUrl,
      },
      logout: {
        url: logoutUrl,
      },
        projectId: projectId,
        ideaId: 1,
        title: "Vind je dit een goed idee?",
        hideCounters: true,
        variant: 'medium',
        yesLabel: "Ik ben voor",
        noLabel: "Ik ben tegen",
        ...config,
        ...widget?.config?.[type],
    };

  return (
    <div id="widget-preview-container" className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Preview
      </Heading>
      <Separator className="mb-4" />
      {/* Ideally we would just import the widget here, but with the Likes widget for instance, i'm getting some weird import issues that I need to solve first */}
     <Likes {...widgetConfig} />
    </div>
  );
}
