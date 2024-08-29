import React, { FC } from "react";
import {Paragraph, Strong} from "@utrecht/component-library-react";

export type InfoFieldProps = {
    title?: string;
    description?: string;
    fieldKey?: string;
    type?: string;
    image?: string;
    imageAlt?: string;
    imageDescription?: string;
}

const InfoField: FC<InfoFieldProps> = ({
   title = '',
   description = '',
   image = '',
   imageAlt = '',
   imageDescription = '',
}) => {
    return (
      <div className="info-field-container">
        {title && <Paragraph><Strong>{title}</Strong></Paragraph>}
        {description && <Paragraph>{description}</Paragraph>}

        <figure>
          <img src={image} alt={imageAlt}/>
          {imageDescription && (
            <figcaption>{imageDescription}</figcaption>
          )}
        </figure>
      </div>
    );
};

export default InfoField;
