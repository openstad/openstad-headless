import { PageLayout } from "@/components/ui/page-layout";
import { ListHeading, Paragraph } from "@/components/ui/typography";
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
          >
            <div className="container mx-auto py-10">
              <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-2 px-2 border-b border-border">
                <ListHeading className="hidden md:flex md:col-span-2">
                  Widget
                </ListHeading>
              </div>
              <ul>
                <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                  <Paragraph className='hidden md:flex md:col-span-2'>
                    <Link href="/projects/1/widgets/begrootmodule">Begrootmodule</Link>
                  </Paragraph>
                </li>
              </ul>
              <ul>
                <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                  <Paragraph className='hidden md:flex md:col-span-2'>
                  <Link href="/projects/1/widgets/arguments">Argumenten</Link>
                  </Paragraph>
                </li>
              </ul>
              <ul>
                <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                  <Paragraph className='hidden md:flex md:col-span-2'>
                    <Link href="/projects/1/widgets/ideasmap">Ideeën map</Link>
                  </Paragraph>
                </li>
              </ul>
              <ul>
                <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                  <Paragraph className='hidden md:flex md:col-span-2'>
                    <Link href="/projects/1/widgets/keuzewijzer">Keuzewijzer</Link>
                  </Paragraph>
                </li>
              </ul>
              <ul>
                <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                  <Paragraph className='hidden md:flex md:col-span-2'>
                    <Link href="/projects/1/widgets/like">Likes module</Link>
                  </Paragraph>
                </li>
              </ul>
              <ul>
                <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                  <Paragraph className='hidden md:flex md:col-span-2'>
                    <Link href="/projects/1/widgets/map">Map module</Link>
                  </Paragraph>
                </li>
              </ul>
              <ul>
                <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                  <Paragraph className='hidden md:flex md:col-span-2'>
                    <Link href="/projects/1/widgets/resourceform">Resource formulier</Link>
                  </Paragraph>
                </li>
              </ul>
              <ul>
                <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                  <Paragraph className='hidden md:flex md:col-span-2'>
                    <Link href="/projects/1/widgets/resourceoverview">Resource overview</Link>
                  </Paragraph>
                </li>
              </ul>
            </div>
          </PageLayout>
        </div>
    )
}