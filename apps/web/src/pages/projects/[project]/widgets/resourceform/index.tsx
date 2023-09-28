import React from 'react'
import { PageLayout } from "../../../../../components/ui/page-layout"
import { Button } from '../../../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
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

export default function WidgetResourceForm() {
    return(
        <div>
            <PageLayout
            pageHeader='Project naam'
            breadcrumbs={[
                {
                    name: "Projecten",
                    url: "/projects"
                },
                {
                    name: "Widgets",
                    url: "/projects/1/widgets"
                },
                {
                    name: "Resource Form",
                    url: "/projects/1/widgets/resourceform"
                }
            ]}
            >
                <div>
                    <Tabs defaultValue="general">
                        <TabsList>
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
                            <TabsTrigger value="confirmation">Confirmatie</TabsTrigger>
                            <TabsTrigger value="info">Titel</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="w-1/2">
                            <WidgetResourceFormGeneral />
                        </TabsContent>
                        <TabsContent value="title" className="w-1/2">
                            <WidgetResourceFormTitle />
                        </TabsContent>
                        <TabsContent value="summary" className="w-1/2">
                            <WidgetResourceFormSummary />
                        </TabsContent>
                        <TabsContent value="description" className="w-1/2">
                            <WidgetResourceFormDescription />
                        </TabsContent>
                        <TabsContent value="images" className="w-1/2">
                            <WidgetResourceFormImages />
                        </TabsContent>
                        <TabsContent value="themes" className="w-1/2">
                            <WidgetResourceFormThemes />
                        </TabsContent>
                        <TabsContent value="areas" className="w-1/2">
                            <WidgetResourceFormAreas />
                        </TabsContent>
                        <TabsContent value="location" className="w-1/2">
                            <WidgetResourceFormLocation />
                        </TabsContent>
                        <TabsContent value="costs" className="w-1/2">
                            <WidgetResourceFormCosts />
                        </TabsContent>
                        <TabsContent value="role" className="w-1/2">
                            <WidgetResourceFormRole />
                        </TabsContent>
                        <TabsContent value="phone" className="w-1/2">
                            <WidgetResourceFormPhone />
                        </TabsContent>
                        <TabsContent value="tip" className="w-1/2">
                            <WidgetResourceFormTip />
                        </TabsContent>
                        <TabsContent value="submit" className="w-1/2">
                            <WidgetResourceFormSubmit />
                        </TabsContent>
                        <TabsContent value="budget" className="w-1/2">
                            <WidgetResourceFormBudget />
                        </TabsContent>
                        <TabsContent value="confirmation" className="w-1/2">
                            <WidgetResourceFormConfirmation />
                        </TabsContent>
                        <TabsContent value="info" className="w-1/2">
                            <WidgetResourceFormInfo />
                        </TabsContent>
                    </Tabs>
                </div>
            </PageLayout>
        </div>
    )
}