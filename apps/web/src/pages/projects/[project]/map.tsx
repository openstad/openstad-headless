import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useSWR from 'swr';

export default function Map() {
  const router = useRouter();
  const { project } = router.query;

  const { data, isLoading } = useSWR(`/api/openstad/api/project/${project}`);
  if (!data) return null;

  const Map = dynamic(() => import('../../../components/maps/base-map'), {
    ssr: false,
  });

  return (
    <Map projectId={data.id} areaId={data.areaId} style={{ height: '400px' }} />
  );
}
