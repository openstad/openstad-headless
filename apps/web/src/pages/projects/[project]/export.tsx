import React from 'react'
import { PageLayout } from '../../../components/ui/page-layout'
import { Button } from '../../../components/ui/button'
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useProject } from '@/hooks/use-project';

export default function ProjectExport() {
    const router = useRouter();
    const { project } = router.query;
    const { data, isLoading } = useProject();

    if (!data) return null;

    const downloadExcel = (data: any) => {
        const worksheet = XLSX.utils.json_to_sheet([data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "DataSheet.xlsx");
      };

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
                    <p>Gebruik deze knop om de gegevens van je project te exporteren.</p>
                    <p>Deze gegevens kunnen vervolgens weer geïmporteerd worden in het geval dat je een project wilt kopiëren.</p>
                    <p>Alleen de configuratieinstellingen van een project zelf worden gegeven; de widget gegevens zullen niet meegegeven worden.</p>
                    <br />
                    <Button type="submit" variant={"default"} onClick={() => downloadExcel(data)}>Exporteer</Button>
                </div>
            </PageLayout>
        </div>
    )
}