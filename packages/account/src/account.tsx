import { loadWidget } from '@openstad-headless/lib/load-widget';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  FormFieldTextbox,
  Heading,
  Paragraph,
  Button,
  Checkbox,
  FieldsetLegend,
  FormLabel, FormField,
  Fieldset
} from '@utrecht/component-library-react';
import React, { useEffect, useState } from 'react';
import './account.css';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from "../../lib/has-role";
import { Banner, Spacer } from '@openstad-headless/ui/src';

export type AccountWidgetProps = BaseProps &
  AccountProps &
  ProjectSettingProps & {
    resourceId?: string;
  };

export type AccountProps = {
  allowNickname?: boolean;
  minLength?: number;
  maxLength?: number;
  allowUserEdit?: boolean;
  formData?: object;
  overview_title?: string;
  overview_description?: string;
  info_title?: string;
  info_description?: string;
  user_title?: string;
  user_description?: string;
  loginButtonText?: string;
  loginRequiredText?: string;
  showLogoutButton?: boolean;
  showEmailConsentField?: boolean;
};

type FormData = {
  email: {
    label: string | undefined;
    value: string | undefined;
    description?: string | undefined;
  };
  name?: {
    label: string | undefined;
    value: string | undefined;
    description?: string | undefined;
  };
  straatnaam?: {
    label: string | undefined;
    value: string | undefined;
    description?: string | undefined;
  };
  huisnummer?: {
    label: string | undefined;
    value: string | undefined;
    description?: string | undefined;
  };
  postalCode?: {
    label: string | undefined;
    value: string | undefined;
    description?: string | undefined;
  };
  city?: {
    label: string | undefined;
    value: string | undefined;
    description?: string | undefined;
  };
  nickname?: {
    label: string | undefined;
    value: string | undefined;
    description?: string | undefined;
  };
  emailNotificationConsent?: {
    label: string | undefined;
    value: boolean | undefined;
    description?: string | undefined;
  };
}
function Account({
  allowNickname = false,
  minLength = 2,
  maxLength = 140,
  allowUserEdit = true,
  overview_title,
  overview_description,
  info_title,
  info_description,
  user_title,
  user_description,
  formData = {
    email: {
      value: '',
      label: 'E-mailadres',
      description: '',
    },
    name: {
      value: '',
      label: 'Naam',
      description: '',
    },
    straatnaam: {
      value: '',
      label: 'Straatnaam',
      description: '',
    },
    huisnummer: {
      value: '',
      label: 'Huisnummer',
      description: '',
    },
    postalCode: {
      value: '',
      label: 'Postcode',
      description: '',
    },
    city: {
      value: '',
      label: 'Woonplaats',
      description: '',
    },
    nickname: {
      value: '',
      label: 'Gebruikersnaam',
      description: '',
    },
    emailNotificationConsent: {
      value: false,
      label: 'E-mail toestemming',
      description: 'Toestemming om e-mail notificaties te ontvangen wanneer er een reactie is geplaatst op jouw inzending of reactie.',
    }
  },
  loginButtonText = undefined,
  loginRequiredText = undefined,
  showLogoutButton = false,
  showEmailConsentField = false,
  ...props
}: AccountWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId = urlParams.get('openstadResourceId') || props.resourceId || '';

  const [canEditNickname, setCanEditNickname] = useState(false);
  const [canEditUser, setCanEditUser] = useState(false);
  const [editButtonText] = useState([['Gegevens bewerken'], ['Gegevens opslaan']]);
  const [userFormData, setUserFormData] = useState<FormData>(formData as FormData);
  const [fetchedUser, setFetchedUser] = useState(false);

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const currentUser = datastore.useCurrentUser({ ...props, projectId: props.projectId });

  const saveUserData = async (data: any) => {
    if (currentUser?.data?.id === undefined) {
      return;
    }

    // Change street and number to address
    const copyObj = Object.assign({}, data) as { [key: string]: any }; // Changed type to any to accommodate different value types
    if (copyObj.huisnummer !== undefined && copyObj.straatnaam !== undefined) {
      console.log(copyObj.straatnaam);
      copyObj.address = {
        label: 'Adres',
        value: `${copyObj.straatnaam.value ?? ''} ${copyObj.huisnummer.value ?? ''}`,
      }
      delete copyObj.huisnummer; // Remove huisnummer from the object
      delete copyObj.straatnaam; // Remove straatnaam from the object
    }

    if (copyObj?.nickname !== undefined) {
      copyObj.nickName = copyObj.nickname;
      delete copyObj.nickname;
    }

    // only get values and add id using the modified copyObj
    let updatedData = {
      ...Object.fromEntries(
        Object.entries(copyObj).map(([key, value]) => [key, typeof value === 'object' && value !== null ? value.value : value])
      ),
      id: currentUser?.data?.id,
    };

    await datastore.api.user.update({
      projectId: props.projectId,
      user: {
        ...updatedData,
      }
    });
  }

  useEffect(() => {
    if (currentUser !== undefined && currentUser?.data !== undefined && fetchedUser === false) {
      setFetchedUser(currentUser);

      // Assuming address is a string like "Main Street 24"
      const address = currentUser?.data?.address;
      const addressParts = address?.split(' ');
      const huisnummer = addressParts?.pop();
      const straatnaam = addressParts?.join(' ');

      setUserFormData((prev: FormData) => {
        return {
          ...prev,
          email: {
            label: prev?.email?.label,
            value: currentUser?.data?.email,
            description: prev?.email?.description,
          },
          name: {
            label: prev?.name?.label,
            value: currentUser?.data?.name,
            description: prev?.name?.description,
          },
          straatnaam: {
            label: prev?.straatnaam?.label,
            value: straatnaam,
            description: prev?.straatnaam?.description,
          },
          huisnummer: {
            label: prev?.huisnummer?.label,
            value: huisnummer,
            description: prev?.huisnummer?.description,
          },
          postalCode: {
            label: prev?.postalCode?.label,
            value: currentUser?.data?.postcode,
            description: prev?.postalCode?.description,
          },
          city: {
            label: prev?.city?.label,
            value: currentUser?.data?.city,
            description: prev?.city?.description,
          },
          nickname: {
            label: prev?.nickname?.label,
            value: currentUser?.data?.nickName,
            description: prev?.nickname?.description,
          },
          emailNotificationConsent: {
            label: prev?.emailNotificationConsent?.label,
            value: currentUser?.data?.emailNotificationConsent || false,
            description: prev?.emailNotificationConsent?.description,
          }
        }
      });
    }
  }, [currentUser]);

  function lowercaseFirstLetter(str: string) {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  return (
    <section className="account osc">
      {!hasRole(currentUser?.data, 'member') ? (
        <>
          <Banner className="big">
            <Heading level={4} appearance='utrecht-heading-6'>{loginRequiredText || 'Je moet ingelogd zijn om verder te gaan.'}</Heading>
            <Spacer size={1} />
            <Button
              type="button"
              onClick={() => {
                document.location.href = props.login?.url || '';
              }}
              appearance="primary-action-button"
            >
              {loginButtonText || 'Inloggen'}
            </Button>
          </Banner>
          <Spacer size={2} />
        </>
      ) : (
        <>
          <div>
            {overview_title && <Heading level={2}>{overview_title}</Heading>}
            {overview_description && <Paragraph>{overview_description}</Paragraph>}

            {Object.entries(formData).map((field, index) => (
              field[0] === 'email' && (
                <FormFieldTextbox
                  label={field[1].label}
                  name={field[1].label}
                  description="Niet aanpasbaar"
                  placeholder={field[1].label}
                  maxLength={maxLength}
                  minLength={minLength}
                  value={userFormData?.email?.value}
                  readOnly
                  key={index}
                />
              )
            ))}
          </div>
          <div>
            {info_title && <Heading level={2}>{info_title}</Heading>}
            {info_description && <Paragraph> {info_description} </Paragraph>}

            {Object.entries(userFormData).map((field, index) => {
              return ( field[0] === 'emailNotificationConsent' ) ? (
                showEmailConsentField && (
                  <Fieldset role="group" className="consent-checkbox-container">
                    <FieldsetLegend>
                      {field[1].label}
                    </FieldsetLegend>
                    <FormField type="checkbox" key={index}>
                      <Paragraph className="utrecht-form-field__label utrecht-form-field__label--checkbox">
                        <FormLabel htmlFor={field[0]} type="checkbox" className="--label-grid" disabled={!canEditUser}>
                          <Checkbox
                            className="utrecht-form-field__input"
                            id={field[0]}
                            name={field[0]}
                            checked={field[1].value as boolean}
                            onChange={(e) => {
                              const target = e.target as HTMLInputElement; // Type assertion
                              setUserFormData((prev) => ({
                                ...prev,
                                [field[0]]: {
                                  label: field[1].label,
                                  value: target.checked,
                                  description: field[1].description,
                                },
                              }));
                            }}
                            disabled={!canEditUser}
                          />
                          <span>{field[1]?.description}</span>
                        </FormLabel>
                      </Paragraph>
                    </FormField>
                  </Fieldset>
                )
              ) : ( field[0] !== 'nickname' && field[0] !== 'email' ) && (
                <FormFieldTextbox
                  label={field[1].label}
                  name={field[1].label}
                  placeholder={field[1].label}
                  maxLength={maxLength}
                  minLength={minLength}
                  value={field[1].value as string}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement; // Type assertion
                    setUserFormData((prev) => ({
                      ...prev,
                      [field[0]]: {
                        label: target.name,
                        value: target.value,
                        description: field[1].description,
                      },
                    }));
                  }}
                  readOnly={!canEditUser}
                  key={index}
                />
              )
            }
          )}

            {allowUserEdit && (
              <Button className="account-edit-button" appearance={'primary-action-button'} onClick={() => {
                if (canEditUser) {
                  saveUserData(userFormData);
                }
                setCanEditUser(!canEditUser);
              }}>{canEditUser ? editButtonText[1] : editButtonText[0]}</Button>
            )}


          </div>
          {allowNickname && (
            <div>
              {user_title && <Heading level={2}>{user_title}</Heading>}
              {user_description && <Paragraph>{user_description}</Paragraph>}

              {Object.entries(formData).map((field, index) => (
                field[0] === 'nickname' && (
                  <FormFieldTextbox
                    label={field[1].label}
                    name={field[1].label}
                    maxLength={maxLength}
                    minLength={minLength}
                    placeholder={field[1].label}
                    value={userFormData?.nickname?.value}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement; // Type assertion
                      setUserFormData({
                        ...userFormData,
                        nickname: {
                          value: target.value,
                          label: userFormData?.nickname?.label || '', // Use optional chaining and default to an empty string if undefined
                          description: field[1].description,
                        },
                      });
                    }}
                    readOnly={!canEditNickname}
                    key={index}
                  />
                )
              ))}


              {allowUserEdit && (
                <Button className="account-edit-button" appearance={'primary-action-button'} onClick={() => {
                  if (canEditNickname) {
                    saveUserData(userFormData);
                  }
                  setCanEditNickname(!canEditNickname)
                }}>{canEditNickname ? editButtonText[1] : editButtonText[0]}</Button>
              )}

            </div>
          )}

          {showLogoutButton && (
            <div className="account-logout-button-wrapper">
              <Button
                className="account-logout-button"
                appearance="primary-action-button"
                onClick={() => {
                  document.location.href = props.logout?.url || '';
                }}
              >
                Uitloggen
              </Button>
            </div>
          )}

        </>
      )}
    </section>
  );
}

Account.loadWidget = loadWidget;
export { Account };
