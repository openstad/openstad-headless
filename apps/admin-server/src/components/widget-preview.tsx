import React, {useEffect, useState} from 'react';

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

    /*const [widgetScript, setWidgetScript] = useState<string>('');

    useEffect(() => {
        const apiUrl = `/api/openstad/widget/preview`;
        const widgetConfig = {
            ...config,
            widgetType: type
        }

        // Send widgetConfig as header to the API
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Widget-Config': JSON.stringify(widgetConfig)
            }
        })
            .then(response => response.text())
            .then(data => {
                setWidgetScript(data + `document.dispatchEvent(new CustomEvent('OpenStadReactLoaded'));`);
            });
    }, [config]);*/

  return (
    <div id="widget-preview-container" className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Preview
      </Heading>
      <Separator className="mb-4" />
      {/* <Likes {...config}></Likes>*/ }

    </div>
  );
}
