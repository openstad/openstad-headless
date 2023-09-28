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
              <Link href="/projects/1/widgets/create">
                + Nieuwe widget
              </Link>
            </Button>  
          }
          >
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className='w-[300px]'>Widget lijst</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                <TableCell><Link href="/projects/1/widgets/begrootmodule">Begrootmodule</Link></TableCell>
                </TableRow>
                <TableRow>
                <TableCell><Link href="/projects/1/widgets/arguments">Argumenten</Link></TableCell>
                </TableRow>
                <TableRow>
                <TableCell><Link href="/projects/1/widgets/ideasmap">Ideeën map</Link></TableCell>
                </TableRow>
                <TableRow>
                <TableCell><Link href="/projects/1/widgets/keuzewijzer">Keuzewijzer</Link></TableCell>
                </TableRow>
                <TableRow>
                <TableCell><Link href="/projects/1/widgets/like">Likes module</Link></TableCell>
                </TableRow>
                <TableRow>
                <TableCell><Link href="/projects/1/widgets/map">Map module</Link></TableCell>
                </TableRow>
                <TableRow>
                <TableCell><Link href="/projects/1/widgets/resourceform">Resource formulier</Link></TableCell>
                </TableRow>
                <TableRow>
                <TableCell><Link href="/projects/1/widgets/resourceoverview">Resource overview</Link></TableCell>
                </TableRow>
            </TableBody>  
            </Table>
          </PageLayout>
        </div>
    )
}