import React, {FC} from "react";
import {Paragraph, FormLabel, FormFieldDescription, FormField} from "@utrecht/component-library-react";
import './map.css';
// import {EditorMap} from "@openstad-headless/leaflet-map/src/editor-map";

export type MapProps = {
    title: string;
    description: string;
    fieldKey: string;
    fieldRequired: boolean;
    onChange?: (e: {name: string, value: string | FileList | []}) => void;
}

const MapField: FC<MapProps> = ({
    title,
    description,
    fieldKey,
    fieldRequired= false,
    onChange
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // TODO: Get map value when setting a marker. The function to retrieve the value is not yet implemented

    return (
      <FormField type="text">
          <Paragraph className="utrecht-form-field__label">
              <FormLabel htmlFor={randomID}>{title}</FormLabel>
          </Paragraph>
          <FormFieldDescription>{description}</FormFieldDescription>
          <div
            className="form-field-map-container"
            id={`map`}
          >
              {/*<EditorMap fieldName={fieldKey}/>*/}
          </div>
      </FormField>
    );
}

export default MapField;
