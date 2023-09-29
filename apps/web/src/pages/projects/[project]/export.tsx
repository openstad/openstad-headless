import React from 'react'
import { PageLayout } from '../../../components/ui/page-layout'

import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'

export default function ProjectExport() {
    return (
        <div>
            <PageLayout
            pageHeader='Projecten'
            breadcrumbs={[
                {
                    name: "Projecten",
                    url: "/projects"
                },
                {
                    name: "Exporteren",
                    url: "/projects/export"
                }
            ]}
            >
                <div className='container mx-auto py-10 w-1/2 float-left'>
                    <p>De volgende gegevens worden altijd geëxporteerd.</p>
                    <p>- Mongo database</p>
                    <p>- Oauth gegevens</p>
                    <br />
                    <p>Selecteer extra elementen die je zou willen toevoegen aan de geëxporteerde waarden.</p>
                    <br />
                    <div className='items-top flex space-x-2'>
                        <Checkbox id="CMS" />
                        <div className='grid gap-1.5 leading-none'>
                            <label htmlFor='CMS'
                            className='text-sm font-medium leading-none'
                            >
                                CMS toevoegingen
                            </label>
                        </div>
                    </div>
                    <br />
                    <Button type="submit" variant={"default"}>Exporteer</Button>
                </div>
            </PageLayout>
        </div>
    )
}