import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/ui/page-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default function ProjectWidgets() {
    return (
        <div>
          <PageLayout
          pageHeader="Project naam"
          breadcrumbs={[
            {
              name: 'Projecten',
              url: '/projects',
            },
            {
                name: 'Widgets',
                url: '/projects/1/widgets'
            }
          ]}
          action={
            <Button variant="default" className="float-right">
              <Link href="/projects/create">
                + Nieuwe widget
              </Link>
            </Button>  
          }
          >
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className='w-[300px]'>Widget naam</TableHead>
                <TableHead>Info</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                <TableCell>Begrootmodule</TableCell>
                <TableCell>Widget info</TableCell>
                </TableRow>
            </TableBody>  
            </Table>
          </PageLayout>
        </div>
    )
}