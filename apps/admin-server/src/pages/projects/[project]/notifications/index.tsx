import * as React from 'react';
import * as z from 'zod';
import { PageLayout } from '@/components/ui/page-layout';
import { useRouter } from 'next/router';
import useNotificationTemplate from '@/hooks/use-notification-template'
import { NotificationForm } from '@/components/notification-form';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  label: z.string(),
  subject: z.string(),
  body: z.string(),
});

export default function ProjectNotifications() {
  const type = ['login email', 'login sms', 'new published resource - user feedback', 'updated resource - user feedback', 'user account about to expire']
  const router = useRouter();
  const project = router.query.project as string;
  const { data } = useNotificationTemplate(project as string);
  const [value, setValue] = React.useState<any[]>([]);
  const text = `<mjml>
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
  
  React.useEffect(() => {
    if (data !== undefined) {
      let test: any[] = [];
      for (let i = 0; i < type.length; i++) {
        let integer = 0;
        for (let j = 0; j < data.length; j++) {
          if (type[i] === data[j].type) {
            integer++;
            test.push(data[j])
          }
        }
        if (!integer) {
          test.push(type[i])
        }
      }
      setValue(test)
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
            name: 'Notificaties',
            url: `/projects/${project}/notifications`,
          },
        ]}>
        <div className="container py-6">
          <div className='p-6 bg-white rounded-md'>
            <p>
              De mails die worden gebruikt zijn volledig opgezet met behulp van MJML.
              Hieronder geven we een link naar de documentatie van MJML,
              een voorbeeld van hoe MJML is opgezet en de bruikbare variabelen.
            </p>
            <br/>
            <p>
              https://documentation.mjml.io
            </p>
            <br/>
              <code>{text}</code>
            <br/>
            <br/>
            <p>
              Variabelen van gekoppelde onderdelen kunnen gebruikt worden binnen de mail.
              Als je bijvoorbeeld de naam van een gebruiker wilt gebruiken,
              dan wordt deze toegevoegd via de variabele user.name .
              Hieronder worden per bruikbaar onderdeel alle variabelen opgenoemd.
            </p>
            <br/>
            <p>
              user:
              -name
              -email
              -nickName
              -phoneNumber
              -address
              -city
              -fullName
              -postcode
            </p>
            <br/>
            <p>
              resource:
              -startDateHumanized
              -title
              -summary
              -description
              -budget
              -location
              -modBreakDateHumanized
              -publishDateHumanized
            </p>
            <br/>
            <p>
              comment:
              -sentiment
              -description
              -label
              -createDateHumanized
            </p>
            <br/>
            <p>
              submission:
              -status
              -submittedData
            </p>
            <br/>
            {value?.map((type: any) => (
              typeof type === "object" ? 
              <div>
                <Separator/>
                <NotificationForm type={type.type} engine={'email'} id={type.id} label={type.label} subject={type.subject} body={type.body} key={type.id}/>
              </div>
              : 
              <div>
                <Separator/>
                <NotificationForm type={type} engine={'email'} key={type}/>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
