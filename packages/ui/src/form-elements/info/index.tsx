import React, { FC } from "react";
import {AccordionProvider, Paragraph, Strong} from "@utrecht/component-library-react";
import {Spacer} from "../../spacer";

export type InfoFieldProps = {
    title?: string;
    description?: string;
    fieldKey?: string;
    type?: string;
    image?: string;
    imageAlt?: string;
    imageDescription?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
}

const InfoField: FC<InfoFieldProps> = ({
   title = '',
   description = '',
   image = '',
   imageAlt = '',
   imageDescription = '',
   showMoreInfo = false,
   moreInfoButton = 'Meer informatie',
   moreInfoContent = '',
   infoImage = '',
}) => {
    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    return (
      <div className="info-field-container">
        {title && <Paragraph><Strong>{title}</Strong></Paragraph>}
        {description && <Paragraph>{description}</Paragraph>}

          {showMoreInfo && (
              <>
                  <AccordionProvider
                      sections={[
                          {
                              headingLevel: 3,
                              body: <HtmlContent html={moreInfoContent} />,
                              expanded: undefined,
                              label: moreInfoButton,
                          }
                      ]}
                  />
                  <Spacer size={.5} />
              </>
          )}

          {infoImage && (
              <figure className="info-image-container">
                  <img src={infoImage} alt=""/>
                  <Spacer size={.5} />
              </figure>
          )}

        <figure className="info-image-container">
          <img src={image} alt={imageAlt}/>
          {imageDescription && (
            <figcaption>{imageDescription}</figcaption>
          )}
        </figure>
      </div>
    );
};

export default InfoField;
