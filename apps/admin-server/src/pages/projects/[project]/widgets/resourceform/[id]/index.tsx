import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourceFormGeneral from './general';
import WidgetResourceFormTitle from './title';
import WidgetResourceFormSummary from './summary';
import WidgetResourceFormDescription from './description';
import WidgetResourceFormImages from './images';
import WidgetResourceFormThemes from './themes';
import WidgetResourceFormAreas from './areas';
import WidgetResourceFormLocation from './location';
import WidgetResourceFormCosts from './costs';
import WidgetResourceFormRole from './role';
import WidgetResourceFormPhone from './phone';
import WidgetResourceFormTip from './tip';
import WidgetResourceFormSubmit from './submit';
import WidgetResourceFormBudget from './budget';
import WidgetResourceFormInfo from './info';
import WidgetResourceFormConfirmation from './confirmation';
import { useRouter } from 'next/router';
import Preview from '@/components/widget-preview';

export default function WidgetResourceForm() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  return (
    <div className="w-full overflow-hidden">
      <PageLayout
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Widgets',
            url: `/projects/${projectId}/widgets`,
          },
          {
            name: 'Resource Form',
            url: `/projects/${projectId}/widgets/resourceform/${id}`,
          },
        ]}>
        <div className="container py-6 overflow-hidden">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="title">Titel</TabsTrigger>
              <TabsTrigger value="summary">Samenvatting</TabsTrigger>
              <TabsTrigger value="description">Beschrijving</TabsTrigger>
              <TabsTrigger value="images">Uploaden afbeeldingen</TabsTrigger>
              <TabsTrigger value="themes">Themas</TabsTrigger>
              <TabsTrigger value="areas">Gebieden</TabsTrigger>
              <TabsTrigger value="location">Locatie</TabsTrigger>
              <TabsTrigger value="costs">Geschatte kosten</TabsTrigger>
              <TabsTrigger value="role">Rol</TabsTrigger>
              <TabsTrigger value="phone">Telefoonnummer</TabsTrigger>
              <TabsTrigger value="tip">Tips</TabsTrigger>
              <TabsTrigger value="submit">Opleveren</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="confirmation">Bevestiging</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-0">
              {/* <Preview type="resourceform" /> */}
            </TabsContent>
            <TabsContent value="general" className="p-0">
              <WidgetResourceFormGeneral />
            </TabsContent>
            <TabsContent value="title" className="p-0">
              <WidgetResourceFormTitle />
            </TabsContent>
            <TabsContent value="summary" className="p-0">
              <WidgetResourceFormSummary />
            </TabsContent>
            <TabsContent value="description" className="p-0">
              <WidgetResourceFormDescription />
            </TabsContent>
            <TabsContent value="images" className="p-0">
              <WidgetResourceFormImages />
            </TabsContent>
            <TabsContent value="themes" className="p-0">
              <WidgetResourceFormThemes />
            </TabsContent>
            <TabsContent value="areas" className="p-0">
              <WidgetResourceFormAreas />
            </TabsContent>
            <TabsContent value="location" className="p-0">
              <WidgetResourceFormLocation />
            </TabsContent>
            <TabsContent value="costs" className="p-0">
              <WidgetResourceFormCosts />
            </TabsContent>
            <TabsContent value="role" className="p-0">
              <WidgetResourceFormRole />
            </TabsContent>
            <TabsContent value="phone" className="p-0">
              <WidgetResourceFormPhone />
            </TabsContent>
            <TabsContent value="tip" className="p-0">
              <WidgetResourceFormTip />
            </TabsContent>
            <TabsContent value="submit" className="p-0">
              <WidgetResourceFormSubmit />
            </TabsContent>
            <TabsContent value="budget" className="p-0">
              <WidgetResourceFormBudget />
            </TabsContent>
            <TabsContent value="confirmation" className="p-0">
              <WidgetResourceFormConfirmation />
            </TabsContent>
            <TabsContent value="info" className="p-0">
              <WidgetResourceFormInfo />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
