import { PageLayout } from "../components/ui/page-layout";
import React from "react";

export default function Settings() {
    return (
        <div>
          <PageLayout
          pageHeader="Instellingen"
          breadcrumbs={[
            {
              name: 'Instellingen',
              url: '/instellingen',
            },
          ]}>
          <div className="container mx-auto py-10">
          </div>
          </PageLayout>
        </div>
      )
}