import { PageLayout} from "@/components/ui/page-layout"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import React from "react";
import { useRouter } from "next/router";
import { ListHeading, Paragraph } from "@/components/ui/typography";
import * as XLSX from 'xlsx';
import useCodes from "@/hooks/use-codes";

export default function ProjectCodes() {
    const router = useRouter();
    const { project } = router.query;
    const { data, isLoading } = useCodes('uniquecode');

    if (!data) return null;

    const downloadExcel = (data: any) => {
        const worksheet = XLSX.utils.json_to_sheet([data.data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "DataSheet.xlsx");
    };

    return (
        <div>
            <PageLayout
                pageHeader="Projecten"
                breadcrumbs={[
                    {
                        name: "Projecten",
                        url: "/projects"
                    },
                    {
                        name: "Stem codes",
                        url: `/projects/${project}/codes`
                    }
                ]}
                action={
                    <div className="flex">
                        <Link href={`/projects/${project}/codes/create`}>
                            <Button variant="default">
                                <Plus size="20" />
                                Creëer unieke codes
                            </Button>
                        </Link>
                        <Button variant="default" className="ml-6" onClick={() => downloadExcel(data)}>
                            Exporteer unieke codes
                        </Button>
                    </div>
                }
            >
                <div className="container mx-auto py-10">
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 py-2 px-2 border-b border-border">
                        <ListHeading className="hidden md:flex md:col-span-3">
                        ID
                        </ListHeading>
                        <ListHeading className="hidden md:flex md:col-span-2">
                        Code
                        </ListHeading>
                        <ListHeading className="hidden md:flex md:col-span-2">
                        Al gebruikt
                        </ListHeading>
                    </div>
                    <ul className="container mx-auto">
                        {data?.data.map((code: any) => (
                            <li className="grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                                <Paragraph className="hidden md:flex md:col-span-2">
                                    {code.id || null}
                                </Paragraph>
                                <Paragraph className="hidden md:flex md:col-span-2">
                                    {code.code || null}
                                </Paragraph>
                                <Paragraph className="hidden md:flex md:col-span-2">
                                    {code.used}
                                </Paragraph>
                            </li>
                        ))}
                    </ul>
                </div>
            </PageLayout>
        </div>
    )
}