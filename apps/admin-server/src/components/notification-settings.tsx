/**
 * The notification mails of one scope: the styling and a form per mail type. Used both on
 * a project page and on the global settings page, where the templates act as the default
 * for every project that has not saved that mail itself.
 */
import { NotificationForm } from '@/components/notification-form';
import { NotificationStylingForm } from '@/components/notification-styling-form';
import AccordionUI from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useGlobalSettings } from '@/hooks/use-global-settings';
import useNotificationTemplate from '@/hooks/use-notification-template';
import { useProject } from '@/hooks/use-project';
import {
  NOTIFICATION_TYPE_LABELS,
  type NotificationStyling,
  type NotificationType,
  resolveInheritedStyling,
} from '@/lib/notification-content';
import { NotificationScope, isGlobalScope } from '@/lib/notification-scope';
import * as React from 'react';

// The mail types the admin can edit, in the order they are shown. Taken from the label
// catalog so there is one list, and deliberately not from the /defaults endpoint: that
// reads every file in default-templates/, including internal ones without a screen.
const NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_TYPE_LABELS
) as NotificationType[];

const mjmlText = `<mjml>
                  <mj-body>
                    <mj-section>
                      <mj-column>
                        <mj-image width="100px" src="https://mjml.io/assets/img/logo-small.png"></mj-image>
                        <mj-divider border-color="#F45E43"></mj-divider>
                        <mj-text font-size="20px" color="#F45E43" font-family="helvetica">Hello World</mj-text>
                      </mj-column>
                    </mj-section>
                  </mj-body>
                </mjml>`;

const variableText = `Variabelen van gekoppelde onderdelen kunnen gebruikt worden binnen de mail.
  Als je bijvoorbeeld de naam van een gebruiker wilt gebruiken,
  dan wordt deze toegevoegd via de variabele {{user.name}}.
  Welke variabelen je kunt gebruiken verschilt per e-mail; die lijst staat bij de e-mail zelf.`;

type Props = {
  scope: NotificationScope;
};

export function NotificationSettings({ scope }: Props) {
  const globalScope = isGlobalScope(scope);
  const { data } = useNotificationTemplate(scope);
  const { data: projectData } = useProject();
  // Read through the project scoped route on a project page: the unscoped one is
  // admin-only. In project scope the globals are the fallback, not the source.
  const { data: globalSettings } = useGlobalSettings(
    globalScope ? undefined : scope.kind === 'project' ? scope.projectId : null
  );
  const globalStyling: NotificationStyling | undefined =
    globalSettings?.emailConfig?.styling;

  // One place decides which styling this page's mails are rendered with, so the forms do
  // not each repeat the fallback. A project inherits the global brand per field.
  const savedStyling: NotificationStyling = globalScope
    ? globalStyling || {}
    : resolveInheritedStyling(projectData?.emailConfig?.styling, globalStyling);

  // Unsaved edits in the styling form, so the previews below follow a colour change right
  // away instead of only after the save has come back.
  const [liveStyling, setLiveStyling] = React.useState<NotificationStyling>();
  const effectiveStyling = liveStyling || savedStyling;

  // One list per type: a type without a row shows an empty form to create it.
  const templatesByType = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    NOTIFICATION_TYPES.forEach((type) => {
      grouped[type] = [];
    });
    if (Array.isArray(data)) {
      data.forEach((template) => {
        if (template.type in grouped) grouped[template.type].push(template);
      });
    }
    return grouped;
  }, [data]);

  return (
    <div className="p-6 bg-white rounded-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-futura font-bold tracking-tight text-2xl">
            Stel de notificatie e-mails in
          </h2>
          <p>
            De mails die worden gebruikt zijn volledig opgezet met behulp van
            MJML. Hieronder geven we een link naar de documentatie van MJML, een
            voorbeeld van hoe MJML is opgezet en de bruikbare variabelen.
          </p>
          {globalScope && (
            <p>
              Wat je hier instelt geldt voor elk project dat de betreffende mail
              niet zelf heeft opgeslagen. Past een project een mail aan, dan
              houdt dat project die eigen versie.
            </p>
          )}
          {globalScope && (
            <p>
              <strong>Inloggen via e-mail</strong> is de uitzondering: die mail
              wordt door de auth-server verstuurd. Nieuwe projecten krijgen deze
              tekst mee bij het aanmaken; bestaande projecten houden hun huidige
              inlogmail.
            </p>
          )}
          <br />
          <p>
            <a href="https://documentation.mjml.io" className="text-blue-600">
              MJML documentatie
            </a>
          </p>
          <br />

          <AccordionUI
            items={[
              {
                header: 'Meer uitleg over MJML',
                content: (
                  <>
                    <code>{mjmlText}</code>
                    <br />
                    <br />
                    <p>{variableText}</p>
                  </>
                ),
              },
            ]}
          />
        </div>

        <NotificationStylingForm
          scope={scope}
          onStylingChange={setLiveStyling}
        />
      </div>

      {Object.entries(templatesByType).map(([type, templateList], index) => (
        <React.Fragment key={type}>
          {templateList.length === 0 && (
            <div>
              <NotificationForm
                type={type as NotificationType}
                scope={scope}
                styling={effectiveStyling}
              />
              {index !== NOTIFICATION_TYPES.length - 1 && <Separator />}
            </div>
          )}
          {templateList.map((template) => (
            <div key={template.id}>
              <NotificationForm
                type={template.type}
                engine={template.engine}
                id={template.id}
                label={template.label}
                subject={template.subject}
                body={template.body}
                content={template.content}
                scope={scope}
                styling={effectiveStyling}
              />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
