import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useNotificationTemplate from '@/hooks/use-notification-template'
import toast from 'react-hot-toast';
import { NotificationForm } from '@/components/notification-form';

const formSchema = z.object({
  label: z.string(),
  subject: z.string(),
  body: z.string(),
});

export default function ProjectNotifications() {
  const type = ['login email', 'login sms', 'new resource', 'updated resource', 'user account about to expire']
  const router = useRouter();
  const project = router.query.project as string;
  const { data } = useNotificationTemplate(project as string);
  const [value, setValue] = React.useState<any[]>([]);
  
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
          {value?.map((type: any) => (
            typeof type === "object" ? <NotificationForm type={type.type} engine={'email'} id={type.id} label={type.label} subject={type.subject} body={type.body}/> : <NotificationForm type={type} engine={'email'}/>
            ))}
        </div>
      </PageLayout>
    </div>
  );
}
