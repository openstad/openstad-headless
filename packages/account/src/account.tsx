import { loadWidget } from '@openstad-headless/lib/load-widget';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { FormFieldTextbox, Heading, Paragraph, Button } from '@utrecht/component-library-react';
import React, { useEffect, useState } from 'react';
import './account.css';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import DataStore from '@openstad-headless/data-store/src';

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
};

type FormData = {
  email: {
    label: string | undefined;
    value: string | undefined;
  };
  name?: {
    label: string | undefined;
    value: string | undefined;
  };
  straatnaam?: {
    label: string | undefined;
    value: string | undefined;
  };
  huisnummer?: {
    label: string | undefined;
    value: string | undefined;
  };
  postalCode?: {
    label: string | undefined;
    value: string | undefined;
  };
  city?: {
    label: string | undefined;
    value: string | undefined;
  };
  nickname?: {
    label: string | undefined;
    value: string | undefined;
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
    },
    name: {
      value: '',
      label: 'Naam',
    },
    straatnaam: {
      value: '',
      label: 'Straatnaam',
    },
    huisnummer: {
      value: '',
      label: 'Huisnummer',
    },
    postalCode: {
      value: '',
      label: 'Postcode',
    },
    city: {
      value: '',
      label: 'Woonplaats',
    },
    nickname: {
      value: '',
      label: 'Gebruikersnaam',
    }
  },
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
          },
          name: {
            label: prev?.name?.label,
            value: currentUser?.data?.name,
          },
          straatnaam: {
            label: prev?.straatnaam?.label,
            value: straatnaam,
          },
          huisnummer: {
            label: prev?.huisnummer?.label,
            value: huisnummer,
          },
          postalCode: {
            label: prev?.postalCode?.label,
            value: currentUser?.data?.postcode,
          },
          city: {
            label: prev?.city?.label,
            value: currentUser?.data?.city,
          },
          nickname: {
            label: prev?.nickname?.label,
            value: currentUser?.data?.nickName,
          }
        }
      });
    }
  }, [currentUser]);

  function lowercaseFirstLetter(str: string) {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  useEffect(() => {
    console.log('userFormData', userFormData);
  }, [userFormData]);

  return (
    <section className="account">
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

        {Object.entries(userFormData).map((field, index) => (
          field[0] !== 'nickname' && field[0] !== 'email' && (
            <FormFieldTextbox
              label={field[1].label}
              name={field[1].label}
              placeholder={field[1].label}
              maxLength={maxLength}
              minLength={minLength}
              value={field[1].value}
              onChange={(e) => {
                const target = e.target as HTMLInputElement; // Type assertion
                setUserFormData((prev) => ({
                  ...prev,
                  [field[0]]: {
                    label: target.name,
                    value: target.value
                  },
                }));
              }}
              readOnly={!canEditUser}
              key={index}
            />
          )
        ))}

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
    </section>
  );
}

Account.loadWidget = loadWidget;
export { Account };
