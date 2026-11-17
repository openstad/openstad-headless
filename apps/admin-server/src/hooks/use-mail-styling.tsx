import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export type MailStyling = {
  logo: string;
  accentColor: string;
};

export default function useMailStyling(projectId?: string) {
  const projectNumber = validateProjectNumber(projectId);

  return useSWR<MailStyling>(
    projectNumber
      ? `/api/openstad/notification/project/${projectNumber}/template/styling`
      : null
  );
}
