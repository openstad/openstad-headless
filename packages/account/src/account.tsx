import { loadWidget } from '@openstad-headless/lib/load-widget';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { FormFieldTextbox, Heading, Paragraph, Button } from '@utrecht/component-library-react';
import React, { useState } from 'react';
import './account.css';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

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
};

function Account({
  allowNickname = true,
  minLength = 2,
  maxLength = 140,
  allowUserEdit = true,
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
      label: 'Schermnaam',
    }
  },
  ...props
}: AccountWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId =
    urlParams.get('openstadResourceId') || props.resourceId || '';

  const [canEditNickname, setCanEditNickname] = useState(false);
  const [canEditUser, setCanEditUser] = useState(false);
  const [editButtonText] = useState([['Bewerken'], ['Opslaan']]);

  return (
    <section className="account">
      <div>
      {Object.entries(formData).map((field, index) => (
            field[0] === 'email' && (
              <FormFieldTextbox
                label={field[1].label}
                name={field[1].label}
                description="Niet aanpasbaar"
                maxLength={maxLength}
                minLength={minLength}
                defaultValue={field[1].value}
                readOnly
                key={index}
              />
            )
          ))}
      </div>
      <div>
        {allowUserEdit && (
          <Button className="account-edit-button" appearance={'primary-action-button'} onClick={() => (
            setCanEditUser(!canEditUser)
          )}>{canEditUser ? editButtonText[1] : editButtonText[0]}</Button>
        )}

        {Object.entries(formData).map((field, index) => (
          field[0] !== 'nickname' && field[0] !== 'email' && (
            <FormFieldTextbox
              label={field[1].label}
              name={field[1].label}
              maxLength={maxLength}
              minLength={minLength}
              defaultValue={field[1].value}
              readOnly={!canEditUser}
              key={index}
            />
          )
        ))}


      </div>
      {allowNickname && (
        <div>
          <Heading level={2}>Mijn gegevens voor deze site</Heading>
          <Paragraph>
            Deze gegevens zijn alleen van toepassing op deze website.
          </Paragraph>

          {allowUserEdit && (
            <Button className="account-edit-button" appearance={'primary-action-button'} onClick={() => (
              setCanEditNickname(!canEditNickname)
            )}>{canEditNickname ? editButtonText[1] : editButtonText[0]}</Button>
          )}

          {Object.entries(formData).map((field, index) => (
            field[0] === 'nickname' && (
              <FormFieldTextbox
                label={field[1].label}
                name={field[1].label}
                maxLength={maxLength}
                minLength={minLength}
                defaultValue={field[1].value}
                readOnly={!canEditNickname}
                key={index}
              />
            )
          ))}

        </div>
      )}
    </section>
  );
}

Account.loadWidget = loadWidget;
export { Account };
