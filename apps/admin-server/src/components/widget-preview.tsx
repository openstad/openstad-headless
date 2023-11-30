import React from 'react';

import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import Likes from "@openstad/likes/src/likes";

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
};

export default function WidgetPreview({ type, config }: Props) {

  return (
    <div id="widget-preview-container" className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Preview
      </Heading>
      <Separator className="mb-4" />
        {/* Ideally we would just import the widget here, but with the Likes widget for instance, i'm getting some weird import issues that I need to solve first */ }
      {/* <Likes {...config}></Likes>*/ }

    </div>
  );
}
