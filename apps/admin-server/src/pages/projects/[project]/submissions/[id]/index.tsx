import * as React from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import { useRouter } from 'next/router';
import useSubmissions from '@/hooks/use-submission';
import MapInput from '@/components/maps/leaflet-input';

export default function ProjectStatusEdit() {
    const router = useRouter();
    const { project, id, dataId } = router.query;
    const { data } = useSubmissions(project as string);


    const Header = ({ sub }: any) => {
        return (
            <table className="mb-10 w-full border border-gray-100">
                <tbody>
                    <tr className="even:bg-gray-50">
                        <td className="align-top p-2.5 w-40"><strong>Id</strong></td><td>{sub.id}</td>
                    </tr>
                    <tr className="even:bg-gray-50">
                        <td className="align-top p-2.5 w-40"><strong>User</strong></td><td>{sub.userId}</td>
                    </tr>
                    <tr className="even:bg-gray-50">
                        <td className="align-top p-2.5 w-40"><strong>Ingestuurd op</strong> </td><td>{new Date(sub.createdAt).toString()}</td>
                    </tr>
                    <tr className="even:bg-gray-50">
                        <td className="align-top p-2.5 w-40"><strong>Geüpdate op</strong> </td><td>{new Date(sub.updatedAt).toString()}</td>
                    </tr>
                    <tr className="even:bg-gray-50">
                        <td className="align-top p-2.5 w-40"><strong>Status</strong></td><td>{sub.status}</td>
                    </tr>
                    <tr className="even:bg-gray-50">
                        <td className="align-top p-2.5 w-40"><strong>Widget</strong></td><td>
                            <a
                                className="underline cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(`/projects/${project}/widgets/enquete/${id}`);
                                }}
                            >
                                Enquete {id}
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    };

    const Content = ({ sub }: any) => {
        const renderValue = (value: any) => {
            if (typeof value === 'object' && value !== null) {

                if (value.lat && value.lng) {
                    return (
                        <div className={'w-full'}>
                            <MapInput field={{ value: JSON.stringify({ lat: value.lat, lng: value.lng }) }} center={{'lat': value.lat, 'lng':value.lng}} />
                        </div>
                    );
                }

                if (value[0]?.url && value[0]?.name) {
                    return (
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(value).map(([key, val]) => (
                                <a href={value[key].url} title={value[key].name} target={'_blank'} key={key}>
                                    <img src={value[key].url} alt={value[key].name} className="w-full h-auto" />
                                </a>
                            ))}
                        </div>
                    )
                }

                return null;

            }
            return value;
        };

        return (
            <table className="w-full border border-gray-100">
                <tbody>
                    {Object.entries(sub).map(([key, value]) => (
                        <tr key={key} className="even:bg-gray-50">
                            <td className="align-top p-2.5 w-40"><strong>{key}</strong></td>
                            <td className="align-top p-2.5">{renderValue(value)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div>
            <PageLayout
                pageHeader="Projecten"
                breadcrumbs={[
                    {
                        name: 'Projecten',
                        url: '/projects',
                    },
                    {
                        name: 'Inzendingen',
                        url: `/projects/${project}/submissions`,
                    },
                    {
                        name: 'Inzending',
                        url: `/projects/${project}/submissions/${id}`,
                    },
                ]}>
                <div className="container py-6">
                    <div className="p-6 bg-white rounded-md">
                        {data && (
                            data.map((submission: any) => {
                                if (submission.id === dataId) {
                                    return (
                                        <div key={submission.id}>
                                            <h2 className="text-xl font-bold mb-4">Informatie</h2>
                                            <Header sub={submission} />

                                            <h2 className="text-xl font-bold mb-4">Ingezonden data</h2>
                                            <Content sub={submission.submittedData} />
                                        </div>
                                    );
                                }
                            })
                        )}
                    </div>
                </div>
            </PageLayout>
        </div>
    );
}
