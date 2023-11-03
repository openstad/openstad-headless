import React from 'react'
import { PageLayout } from '../../../components/ui/page-layout'
import { Button } from '../../../components/ui/button'
import { useRouter } from 'next/router';
import { useProject } from '@/hooks/use-project';

export default function ProjectDuplicate() {
    const router = useRouter();
    const { project } = router.query;
    const { data, isLoading } = useProject();

    if (!data) return null;

    async function duplicate() {
        const duplicateData = {
            areaId: data.areaId,
            config: data.config,
            emailConfig: data.emailConfig,
            hostStatus: data.hostStatus,
            name: data.name,
            title: data.title
        }

        await fetch(`/api/openstad/api/project`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(duplicateData)
        })
    }

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
                    name: "Dupliceren",
                    url: "/projects/duplicate"
                }
            ]}
            >
                <div className='container mx-auto py-10 w-1/2 float-left'>
                    <p>Gebruik deze knop om de gegevens van je project te dupliceren.</p>
                    <p>Bij het dupliceren van je project zal er een compleet identieke versie van het project aangemaakt worden in de database.</p>
                    <p>Hou er wel rekening mee dat de gewenste gebruikers van het project eerst aan het project gekoppeld moeten worden.</p>
                    <br />
                    <Button type="submit" variant={"default"} onClick={duplicate}>Dupliceer</Button>
                </div>
            </PageLayout>
        </div>
    )
}