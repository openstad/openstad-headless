import React, { FC } from "react";
import { AccordionProvider, Paragraph, Strong } from "@utrecht/component-library-react";
import { Spacer } from "../../spacer";
import { FormValue } from "@openstad-headless/form/src/form";
import { InfoImage } from "../../infoImage";
import RteContent from "../../rte-formatting/rte-content";

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
      return <RteContent content={html} unwrapSingleRootDiv={true} />;
    }
  }

  return (
    <div className="info-field-container">
      {title && <Paragraph className="info-field-title"><RteContent content={title} inlineComponent={Strong} unwrapSingleRootDiv={true} forceInline={true} /></Paragraph>}
      {description &&
        <Paragraph className="info-field-description">
          <RteContent content={description} inlineComponent="span" unwrapSingleRootDiv={true} forceInline={true} />
        </Paragraph>
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
