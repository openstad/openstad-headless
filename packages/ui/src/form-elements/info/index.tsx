import React, { FC } from "react";
import {Paragraph, Strong} from "@utrecht/component-library-react";

export type InfoFieldProps = {
    title?: string;
    description?: string;
    fieldKey?: string;
    type?: string;
}

const InfoField: FC<InfoFieldProps> = ({
   title = '',
   description = ''
}) => {
    return (
        <div className="info-field-container">
          {title && <Paragraph><Strong>{title}</Strong></Paragraph>}
          {description && <Paragraph>{description}</Paragraph>}
        </div>
    );
};

export default InfoField;
