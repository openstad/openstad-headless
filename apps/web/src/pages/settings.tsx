import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/ui/page-layout";

export default function Settings() {
    return (
        <div>
          <PageLayout
          pageHeader="Instellingen"
          breadcrumbs={[
            {
              name: 'Instellingen',
              url: '/settings',
            },
          ]}>
          <div className="container mx-auto py-10">
            <Button variant="create" className="float-right">
                New +
            </Button>
          </div>
          </PageLayout>
        </div>
      )
}