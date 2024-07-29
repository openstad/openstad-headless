import React, { useState } from 'react';
import { useWidgetsHook } from '@/hooks/use-widgets';
import { PageLayout } from '@/components/ui/page-layout';
import { useRouter } from 'next/router';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import { WidgetDefinitions } from '@/lib/widget-definitions';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const getServerSideProps = withApiUrl;

export default function CreateWidget({ }: WithApiUrlProps) {
    const router = useRouter();
    const id = router.query.id;
    const projectId = router.query.project as string;
    const widgetTypes = Object.entries(WidgetDefinitions);
    const { createWidget } = useWidgetsHook(projectId);

    const [name, setName] = useState<string>('');
    const [filterSearchType, setFilterSearchType] = useState<string>('');

    const filteredWidgets = widgetTypes.filter(widget =>
        widget[1].toLowerCase().includes(filterSearchType.toLowerCase())
    );

    async function submit(type: any, description: any) {
        if (!projectId) return;
        try {
            const widget = await createWidget(type, description);
            if (widget) {
                toast.success('Widget aangemaakt! Je wordt nu doorgestuurd naar de widget.');
                setTimeout(() => {
                    router.push(`/projects/${projectId}/widgets/${widget.type}/${widget.id}`);
                }, 1500);
            }
        } catch (error) {
            toast.error('Widget kon niet worden aangemaakt!');
        }
    }


    return (
        <div>
            <PageLayout
                pageHeader="Widget overzicht"
                breadcrumbs={[
                    {
                        name: 'Projecten',
                        url: '/projects',
                    },
                    {
                        name: 'Widgets',
                        url: `/projects/${projectId}/widgets`,
                    },
                    {
                        name: 'Overzicht',
                        url: `/projects/${projectId}/widgets/create`,
                    },
                ]}>
                <div className="container py-6">
                    <div className="float-right mb-4 flex gap-4">
                        <p className="text-xs font-medium text-muted-foreground self-center">Filter op:</p>
                        <input
                            type="text"
                            className='p-2 rounded'
                            placeholder="Zoeken..."
                            onChange={(e) => setFilterSearchType(e.target.value)}
                        />
                    </div>


                    <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3 clear-right">
                        {filteredWidgets.map((type, key) => (
                            <Card key={key}>
                                <CardHeader>
                                    {/* <img src='https://placehold.co/395x265' /> */}
                                    <h2 className="text-lg font-regular">
                                        <b>{key + 1}</b> {type[1]}
                                    </h2>
                                    {/* <CardDescription>Korte beschrijving van dit component</CardDescription> */}
                                </CardHeader>
                                <CardFooter>
                                    <Dialog>
                                        <DialogTrigger><Button>Widget kiezen</Button></DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{type[1]}</DialogTitle>
                                                <DialogDescription>
                                                    Geef de widget hier een logische naame, zodat deze makkelijk terug te vinden is.
                                                    <br />
                                                    <br />
                                                    <div className="grid w-full items-center gap-4">
                                                        <Label htmlFor="name">Naam</Label>
                                                        <Input type="text" id="name" placeholder={type[1]} onChange={(e) => setName(e.target.value)} />
                                                    </div>
                                                    <br />
                                                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                                                        <DialogTrigger>Annuleren</DialogTrigger>
                                                        <Button onClick={() => submit(type[0], name)}>Aanmaken</Button>
                                                    </div>
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </PageLayout>
        </div>
    );
}
