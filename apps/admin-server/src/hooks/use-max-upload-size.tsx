import { UPLOAD_LIMIT_URL } from '@/lib/upload-limits';
import useSWR from 'swr';

export default function useMaxUploadSizeMb(): number | null {
  const { data } = useSWR(UPLOAD_LIMIT_URL);
  return typeof data?.maxUploadSizeMb === 'number'
    ? data.maxUploadSizeMb
    : null;
}
