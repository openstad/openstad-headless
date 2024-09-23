import * as React from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import { useRouter } from 'next/router';
import useNotificationTemplate from '@/hooks/use-notification-template';
import { NotificationForm } from '@/components/notification-form';
import { Separator } from '@/components/ui/separator';
import AccordionUI from "@/components/ui/accordion";

export default function ProjectNotifications() {
  type NotificationType =
      'login email'
      | 'login sms'
      | 'new published resource - user feedback'
      | 'new published resource - admin update'
      | 'updated resource - user feedback'
      | 'user account about to expire'
      | 'new enquete - admin'
      | 'new enquete - user';

  const defaultDefinitions: { [type in NotificationType]: any[] } = {
    "login email": [],
    "login sms": [],
    "new published resource - user feedback": [],
    "new published resource - admin update": [],
    "updated resource - user feedback": [],
    "user account about to expire": [],
    "new enquete - admin": [],
    "new enquete - user": []
  };

  const [typeDefinitions, setTypeDefinitions] = React.useState<{ [type in NotificationType]: any[] }>(defaultDefinitions);

  const router = useRouter();
  const project = router.query.project as string;
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
  Hieronder worden per bruikbaar onderdeel alle variabelen opgenoemd.`

  React.useEffect(() => {
    if (Array.isArray(data)) {
      const currentTypeDefinitions = Object.assign({}, defaultDefinitions);

      data.forEach(template => {
        if (template.type in currentTypeDefinitions) {
          currentTypeDefinitions[template.type as NotificationType].push(template);
        }
      });

      setTypeDefinitions(currentTypeDefinitions);
    }
  }, [data]);

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
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
          <div className='p-6 bg-white rounded-md'>
            <div className="space-y-4 lg:w-1/2">
              <h2 className="font-futura font-bold tracking-tight text-2xl">Stel de notificatie e-mails in</h2>
              <p>
                De mails die worden gebruikt zijn volledig opgezet met behulp van MJML.
                Hieronder geven we een link naar de documentatie van MJML,
                een voorbeeld van hoe MJML is opgezet en de bruikbare variabelen.
              </p>
              <br />
              <p>
                <a href="https://documentation.mjml.io" className='text-blue-600'>MJML documentatie</a>
              </p>
              <br />

              <AccordionUI items={[
                {
                  header: 'Meer uitleg over MJML',
                  content:(<>
              <code>{mjmlText}</code>
              <br />
              <br />
              <p>
                {variableText}
              </p>
              <br />
              <p>
                user:<br />
                -name<br />
                -email<br />
                -nickName<br />
                -phoneNumber<br />
                -address<br />
                -city<br />
                -fullName<br />
                -postcode
              </p>
              <br />
              <p>
                resource:<br />
                -startDateHumanized<br />
                -title<br />
                -summary<br />
                -description<br />
                -budget<br />
                -location<br />
                -modBreakDateHumanized<br />
                -publishDateHumanized
              </p>
              <br />
              <p>
                comment:<br />
                -sentiment<br />
                -description<br />
                -label<br />
                -createDateHumanized
              </p>
              <br />
              <p>
                submission:<br />
                -status<br />
                -submittedData
              </p>
              <br />
              <p>
                Voor een overzicht van ingevulde waardes van een resource kan dit gebruikt worden:<br />
                &#123;&#123; submissionContent | safe &#125;&#125;
              </p>
              <br />
              <p>
                Voor een overzicht van ingevulde waardes van een enquete kan dit gebruikt worden:<br />
                &#123;&#123; enqueteContent | safe &#125;&#125;
              </p>

            <br />
                </>)
              }
                ]} />
            </div>

              {Object.entries(typeDefinitions).map(([type, templateList], index) => (
                  <React.Fragment key={index}>
                    {templateList.length === 0 && (
                        <div key={type}>
                          <NotificationForm type={type as NotificationType} />
                          {index !== Object.entries(typeDefinitions).length - 1 && <Separator />}
                        </div>
                    )}
                    {templateList.map((template) => (
                        <div key={template.id}>
                          <NotificationForm type={template.type} engine={template.engine} id={template.id} label={template.label} subject={template.subject} body={template.body} />
                        </div>
                    ))}
                  </React.Fragment>
              ))}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
