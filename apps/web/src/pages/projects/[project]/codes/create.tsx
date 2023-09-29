import { PageLayout} from "@/components/ui/page-layout"
import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProjectCodeCreate() {
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
                        url: "/projects/1/codes"
                    },
                    {
                        name: "Creëer nieuwe codes",
                        url: "projects/1/codes/create"
                    }
                ]}
                action={
                    <div className="flex">
                        <Link href="/projects/1/codes/export" className="pl-6">
                            <Button variant="default">
                                Exporteer unieke codes
                            </Button>
                        </Link>
                    </div>
                }
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Creëer unieke codes</CardTitle>
                        <CardDescription>Let op: de stemcodes worden op de achtergrond gegenereerd. Zie de statusmelding boven het overzicht om te controleren of alle codes gegenereerd zijn, voordat je deze exporteerd.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div>
                                <div>
                                    <Label>Hoeveelheid codes</Label>
                                    <Input className="w-1/4"/>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="default">Creëer</Button>
                    </CardFooter>
                </Card>
            </PageLayout>
        </div>
    )
}