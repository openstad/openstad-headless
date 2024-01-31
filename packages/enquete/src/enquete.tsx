import './enquete.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import {
  Icon,
  Image,
  ImageSelect,
  Input,
  RangeSlider,
  Spacer,
} from '@openstad-headless/ui/src';
import { useState } from 'react';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
export type EnqueteWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    displayTitle?: boolean;
    title?: string;
    displayDescription?: boolean;
    description?: string;
    items?: Array<{
      trigger: string;
      title?: string;
      description?: string;
      questionType?: string;
      images?: Array<{
        src: string;
      }>;
      options: Array<{
        trigger: string;
        key: string;
        titles: Array<string>;
        images: Array<{
          src: string;
        }>;
      }>;
    }>;
  };

function Enquete(props: EnqueteWidgetProps) {
  const [value, setValue] = useState<string>('3');

  return (
    <div className="osc">
      <Spacer size={2} />

      <section className="osc-enquete">
        <div className="osc-enquete-item-content">
          {props.displayTitle && props.title && <h4>{props.title}</h4>}
          <div className="osc-enquete-item-description">
            {props.displayDescription && props.description && (
              <p>{props.description}</p>
            )}
          </div>
        </div>
        {props?.items &&
          props?.items?.length > 0 &&
          props.items
            ?.sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
            .map((item) => (
              <div key={item.trigger} className="osc-enquete-item">
                <div className="osc-enquete-item-content">
                  {item.title && <h5>{item.title}</h5>}
                  {item.description && <p>{item.description}</p>}
                  {item.images && item.images?.length > 0 && (
                    <Image
                      src={item.images?.at(0)?.src || ''}
                      onClick={() => console.log({ image: item.images })}
                    />
                  )}
                  {item.questionType === 'scale' && (
                    <RangeSlider
                      onValueChange={(value) => setValue(value)}
                      value={value}
                      labels={[
                        <Icon icon="ri-emotion-sad-line" />,
                        <Icon icon="ri-emotion-unhappy-line" />,
                        <Icon icon="ri-emotion-normal-line" />,
                        <Icon icon="ri-emotion-happy-line" />,
                        <Icon icon="ri-emotion-laugh-line" />,
                      ]}
                    />
                  )}
                  {item.questionType === 'open' && (
                    <textarea title={item.title} rows={5} />
                  )}
                  {item.options &&
                    item.options?.length > 0 &&
                    item.questionType === 'images' && (
                      <ImageSelect
                        items={item.options[0].titles}
                        images={[
                          item.options.at(0)?.images?.at(0)?.src || '',
                          item.options.at(0)?.images?.at(0)?.src || '',
                        ]}
                      />
                    )}
                  {item.options &&
                    item.options?.length > 0 &&
                    (item.questionType === 'multiple' ||
                      item.questionType === 'multiplechoice') && (
                      <div className="osc-enquete-column">
                        {item.options.map((option, index) => (
                          <div className="osc-enquete-item-checkbox-container">
                            {item.questionType === 'multiple' ? (
                              <Input
                                id={option.titles[0]}
                                type="checkbox"
                                key={index}
                                value={option.titles[0]}
                                className="osc-enquete-item-checkbox"
                                onChange={(e) => console.log(e.target.value)}
                              />
                            ) : (
                              <Input
                                id={option.titles[0]}
                                type="radio"
                                key={index}
                                value={option.titles[0]}
                                name={item.trigger}
                                className="osc-enquete-item-radio"
                                onChange={(e) => console.log(e.target.value)}
                              />
                            )}
                            <label htmlFor={option.titles[0]}>
                              <p>{option.titles[0]}</p>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}
      </section>
    </div>
  );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
