import React, {FC} from "react";
import {Paragraph, FormLabel, FormFieldDescription, FormField} from "@utrecht/component-library-react";
import './map.css';

export type MapProps = {
    title: string;
    description: string;
    fieldKey: string;
    fieldRequired: boolean;
    onChange?: (e: {name: string, value: string | []}) => void;
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
              <FormFieldDescription>{description}</FormFieldDescription>
          </Paragraph>
          <div
            className="form-field-map-container"
            id={`map`}
          >
              {/*<EditorMap fieldName={fieldKey}/> TODO: Uncomment this line when the EditorMap component is implemented*/}
          </div>
      </FormField>
    );
}

export default MapField;
