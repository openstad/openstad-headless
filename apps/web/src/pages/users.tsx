import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/ui/page-layout";

export default function Users() {
    return (
        <div>
          <PageLayout
          pageHeader="Gebruikers"
          breadcrumbs={[
            {
              name: 'Gebruikers',
              url: '/users',
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