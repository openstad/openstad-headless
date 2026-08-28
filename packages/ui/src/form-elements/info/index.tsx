import { FormValue } from '@openstad-headless/form/src/form';
import {
  AccordionProvider,
  Heading2,
  Heading3,
  Heading4,
  Paragraph,
} from '@utrecht/component-library-react';
import React, { FC } from 'react';

import { InfoImage } from '../../infoImage';
import RteContent, {
  hasBlockLevelContent,
} from '../../rte-formatting/rte-content';
import { unwrapSingleRootDiv } from '../../rte-formatting/rte-formatting';
import { Spacer } from '../../spacer';

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
  headingLevel?: 2 | 3 | 4;
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
};

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
  headingLevel = 3,
}) => {
  class HtmlContent extends React.Component<{ html: any }> {
    render() {
      let { html } = this.props;
      return <RteContent content={html} unwrapSingleRootDiv={true} />;
    }
  }

  // ponytail: titel is een echte kop, niet <strong> (WCAG 1.3.1). Niveau instelbaar
  // zodat de redacteur de koppenhiërarchie kloppend kan houden.
  const HeadingComponent =
    headingLevel === 2 ? Heading2 : headingLevel === 4 ? Heading4 : Heading3;

  return (
    <div className="info-field-container">
      {title && (
        <HeadingComponent className="info-field-title">
          <RteContent
            content={title}
            unwrapSingleRootDiv={true}
            forceInline={true}
          />
        </HeadingComponent>
      )}
      {description &&
        (hasBlockLevelContent(unwrapSingleRootDiv(description)) ? (
          <div className="info-field-description">
            <RteContent content={description} unwrapSingleRootDiv={true} />
          </div>
        ) : (
          <Paragraph className="info-field-description">
            <RteContent content={description} unwrapSingleRootDiv={true} />
          </Paragraph>
        ))}

      {showMoreInfo && (
        <>
          <AccordionProvider
            sections={[
              {
                headingLevel: 3,
                body: <HtmlContent html={moreInfoContent} />,
                expanded: undefined,
                label: moreInfoButton,
              },
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
        imageClickable: imageClickable,
      })}
    </div>
  );
};

export default InfoField;
