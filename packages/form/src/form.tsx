import 'remixicon/fonts/remixicon.css';
import React from 'react';
import loadWidget from '../../lib/load-widget.js';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/index.css";

import TextInput from "../../form-elements/text-input/main";
import TextArea from "../../form-elements/textarea/main";
import MapField from "../../form-elements/map/main";

type Props = {
  config: {
    maxCharacters?: number;
  };
};

function Form({
  title = 'Form Widget',
  ...props
}: Props) {
  const maxCharacters = props?.config?.maxCharacters || 50;

  const polygon = [[[4.34195181309704, 52.11450735485124], [4.296984715840466, 52.128662352451926], [4.176920283571974, 52.05321064796675], [4.263658846808255, 52.02035353887331], [4.311365056588272, 52.00939580227944], [4.353821300697405, 52.037627594088974], [4.418875223124616, 52.02105586635574], [4.433027304495141, 52.05307028434851], [4.381897204061175, 52.06724478301348], [4.379842869668295, 52.09291583330716], [4.34195181309704, 52.11450735485124]]];

  return (
    <div className="osc">
      <div className="form-widget-container">
        {title ? <h5 className="like-widget-title">{title}</h5> : null}

        <div className="form-container">
          <TextInput maxCharacters={maxCharacters}/>
          <br/>
          <TextArea />
          <MapField
              // lat={survey.questionable.latitude}
              // long={survey.questionable.longitude}
              zoom={12}
              minZoom={12}
              maxZoom={5}
              polygon={polygon.map((subArray) =>
                  subArray.map((subSubArray) => subSubArray.reverse())
              )}
          ></MapField>
        </div>
      </div>
    </div>
  );
}

Form.loadWidget = loadWidget;

export { Form as named, Form };
