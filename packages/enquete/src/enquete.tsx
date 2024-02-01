import './enquete.css';
import { EnquetePropsType } from './types/';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import {
  Banner,
  Button,
  Icon,
  Image,
  ImageSelect,
  Input,
  RangeSlider,
  Spacer,
} from '@openstad-headless/ui/src';
import { useState } from 'react';
import hasRole from '../../lib/has-role';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';

export type EnqueteWidgetProps = BaseProps &
  ProjectSettingProps &
  EnquetePropsType;

function Enquete(props: EnqueteWidgetProps) {
  const [value, setValue] = useState<string>('3');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    console.log(Array.from(formData.entries()));

    // Hier gaan we wat doen met de data. via useSubmission.
  }

  const datastore = new DataStore(props);
  const [currentUser, currentUserError, currentUserIsLoading] =
    datastore.useCurrentUser({ ...props });

  return (
    <div className="osc">
      <form className="osc-enquete" onSubmit={onSubmit}>
        {!hasRole(currentUser, 'member') && (
          <>
            <Banner className="big">
              <h6>Inloggen om deel te nemen.</h6>
              <Spacer size={1} />
              <Button
                type="button"
                onClick={() => {
                  document.location.href = props.login?.url || '';
                }}>
                Inloggen
              </Button>
            </Banner>
            <Spacer size={2} />
          </>
        )}

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
            .map((item, index) => (
              <div key={`${item.key}-${index}`} className="osc-enquete-item">
                <div className="osc-enquete-item-content">
                  {item.title && <h5>{item.title}</h5>}
                  {item.description && <p>{item.description}</p>}
                  {item.images && item.images?.length > 0 && (
                    <Image
                      className="osc-enquete-item-image"
                      src={item.images?.at(0)?.src || ''}
                    />
                  )}
                  {item.questionType === 'scale' && (
                    <RangeSlider
                      onValueChange={(value) => setValue(value)}
                      value={value}
                      initialvalue="3"
                      min="1"
                      max="5"
                      step="1"
                      id={item.trigger}
                      name={item.key}
                      disabled={hasRole(currentUser, 'member') ? false : true}
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
                    <textarea
                      title={item.title}
                      rows={5}
                      name={item.key}
                      disabled={hasRole(currentUser, 'member') ? false : true}
                      className="osc-enquete-item-textarea"
                    />
                  )}
                  {item.questionType === 'images' &&
                    item.options &&
                    item.options?.length > 0 && (
                      <ImageSelect
                        disabled={hasRole(currentUser, 'member') ? false : true}
                        items={item.options[0].titles}
                        name={item.key}
                        images={[
                          item.options.at(0)?.images?.at(0)?.src || '',
                          item.options.at(0)?.images?.at(0)?.src || '',
                        ]}
                      />
                    )}
                  {(item.questionType === 'multiple' ||
                    item.questionType === 'multiplechoice') &&
                    item.options &&
                    item.options?.length > 0 && (
                      <div className="osc-enquete-column">
                        {item.options.map((option, index) => (
                          <div
                            className="osc-enquete-item-checkbox-container"
                            key={`${item.key}-${index}`}>
                            {item.questionType === 'multiple' ? (
                              <Input
                                id={option.titles[0].key}
                                type="checkbox"
                                name={item.key}
                                value={option.titles[0].key}
                                disabled={
                                  hasRole(currentUser, 'member') ? false : true
                                }
                                className="osc-enquete-item-checkbox"
                              />
                            ) : (
                              <Input
                                id={option.titles[0].key}
                                type="radio"
                                value={option.titles[0].key}
                                name={item.key}
                                className="osc-enquete-item-radio"
                                disabled={
                                  hasRole(currentUser, 'member') ? false : true
                                }
                              />
                            )}
                            <label htmlFor={option.titles[0].key}>
                              <p>{option.titles[0].text}</p>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}
        <Spacer size={2} />
        {hasRole(currentUser, 'member') && (
          <Button type="submit" className="osc-enquete-submit">
            Versturen
          </Button>
        )}
      </form>
    </div>
  );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
