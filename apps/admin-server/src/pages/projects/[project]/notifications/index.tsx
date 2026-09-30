import { NotificationForm } from '@/components/notification-form';
import { NotificationStylingForm } from '@/components/notification-styling-form';
import AccordionUI from '@/components/ui/accordion';
import { PageLayout } from '@/components/ui/page-layout';
import { Separator } from '@/components/ui/separator';
import useNotificationTemplate from '@/hooks/use-notification-template';
import { NotificationStyling } from '@/lib/notification-content';
import { useRouter } from 'next/router';
import * as React from 'react';

export default function ProjectNotifications() {
  type NotificationType =
    | 'login email'
    | 'login sms'
    | 'new published resource - user feedback'
    | 'new published resource - admin update'
    | 'updated resource - user feedback'
    | 'user account about to expire'
    | 'new enquete - admin'
    | 'new enquete - user'
    | 'notification comment - user'
    | 'notification comment reply - user';

  const defaultDefinitions: { [type in NotificationType]: any[] } = {
    'login email': [],
    'login sms': [],
    'new published resource - user feedback': [],
    'new published resource - admin update': [],
    'updated resource - user feedback': [],
    'user account about to expire': [],
    'new enquete - admin': [],
    'new enquete - user': [],
    'notification comment - user': [],
    'notification comment reply - user': [],
  };

  const router = useRouter();
  const project = router.query.project as string;

  // Unsaved brand style, so every preview below follows the styling form live.
  const [livePreviewStyling, setLivePreviewStyling] =
    React.useState<NotificationStyling>();
  const { data } = useNotificationTemplate(project as string);
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

  // Built from `data` on every render instead of pushed into state: the shared
  // `defaultDefinitions` arrays are the same objects on every run, so pushing
  // into them duplicated every template when the effect ran twice.
  const typeDefinitions = React.useMemo(() => {
    const grouped = Object.fromEntries(
      Object.keys(defaultDefinitions).map((type) => [type, [] as any[]])
    ) as { [type in NotificationType]: any[] };

    if (Array.isArray(data)) {
      data.forEach((template) => {
        if (template.type in grouped) {
          grouped[template.type as NotificationType].push(template);
        }
      });
    }

    return grouped;
  }, [data]);

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Notificaties en e-mails',
            url: `/projects/${project}/notifications`,
          },
        ]}>
        <div className="container py-10">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="font-futura font-bold tracking-tight text-2xl">
                  Stel de notificatie e-mails in
                </h2>
                <p>
                  De mails die worden gebruikt zijn volledig opgezet met behulp
                  van MJML. Hieronder geven we een link naar de documentatie van
                  MJML, een voorbeeld van hoe MJML is opgezet en de bruikbare
                  variabelen.
                </p>
                <br />
                <p>
                  <a
                    href="https://documentation.mjml.io"
                    className="text-blue-600">
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
                onStylingChange={setLivePreviewStyling}
              />
            </div>

            {Object.entries(typeDefinitions).map(
              ([type, templateList], index) => (
                <React.Fragment key={index}>
                  {templateList.length === 0 && (
                    <div key={type}>
                      <NotificationForm
                        type={type as NotificationType}
                        stylingOverride={livePreviewStyling}
                      />
                      {index !== Object.entries(typeDefinitions).length - 1 && (
                        <Separator />
                      )}
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
                        stylingOverride={livePreviewStyling}
                      />
                    </div>
                  ))}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
