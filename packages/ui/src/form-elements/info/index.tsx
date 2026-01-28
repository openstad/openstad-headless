import React, { FC } from "react";
import { AccordionProvider, Paragraph, Strong } from "@utrecht/component-library-react";
import { Spacer } from "../../spacer";
import { FormValue } from "@openstad-headless/form/src/form";
import { InfoImage } from "../../infoImage";

export type InfoFieldProps = {
  overrideDefaultValue?: FormValue;
  title?: string;
  description?: string;
  fieldKey?: string;
  type?: string;
  image?: string;
  imageAlt?: string;
  imageDescription?: string;
  infoBlockStyle?: string;
  infoBlockShareButton?: boolean;
  infoBlockExtraButton?: string;
  infoBlockExtraButtonTitle?: string;
  showMoreInfo?: boolean;
  moreInfoButton?: string;
  moreInfoContent?: string;
  infoImage?: string;
  defaultValue?: string;
  prevPageText?: string;
  nextPageText?: string;
  fieldOptions?: { value: string; label: string }[];
  images?: Array<{
    url: string;
    name?: string;
    imageAlt?: string;
    imageDescription?: string;
  }>;
  createImageSlider?: boolean;
  imageClickable?: boolean;
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
  images = [],
  createImageSlider = false,
  imageClickable = false,
}) => {
  class HtmlContent extends React.Component<{ html: any }> {
    render() {
      let { html } = this.props;
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }
  }

  return (
    <div className="info-field-container">
      {title && <Paragraph className="info-field-title"><Strong dangerouslySetInnerHTML={{ __html: title }}></Strong></Paragraph>}
      {description &&
        <Paragraph className="info-field-description" dangerouslySetInnerHTML={{ __html: description }} />
      }

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
          <Spacer size={1.5} />
        </>
      )}

      {InfoImage({
        imageFallback: infoImage || image,
        imageAltFallback: imageAlt,
        imageDescriptionFallback: imageDescription,
        images: images,
        createImageSlider: createImageSlider,
        addSpacer: !!infoImage,
        imageClickable: imageClickable
      })}
    </div>
  );
};

export default InfoField;
