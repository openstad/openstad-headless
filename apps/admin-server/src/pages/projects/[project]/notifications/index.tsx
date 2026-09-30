import { NotificationSettings } from '@/components/notification-settings';
import { PageLayout } from '@/components/ui/page-layout';
import { projectNotificationScope } from '@/lib/notification-scope';
import { useRouter } from 'next/router';
import * as React from 'react';

export default function ProjectNotifications() {
  const router = useRouter();
  const project = router.query.project as string;

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
          <NotificationSettings scope={projectNotificationScope(project)} />
        </div>
      </PageLayout>
    </div>
  );
}
