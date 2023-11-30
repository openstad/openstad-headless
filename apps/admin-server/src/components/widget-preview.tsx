import React from 'react';

import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';

// Can we type config better? Or should we define types for all widgetConfigs and use them as seperate props. A.k.a. likeConifg?:LikeConfig, argConfig?: ArgConfig
type Props = {
  type:
    | 'like'
    | 'arguments'
    | 'resourceoverview'
    | 'resourceform'
    | 'begrootmodule'
    | 'resourcesmap'
    | 'map'
    | 'keuzewijzer';
  config?: any;
};

export default function Preview({ type, config }: Props) {
  return (
    <div id="widget-preview-container" className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Preview
      </Heading>
      <Separator className="mb-4" />
      <div id="widget-preview">
        {/* Load the correct widget based on the type prop and pass the widget config */}
      </div>
    </div>
  );
}
