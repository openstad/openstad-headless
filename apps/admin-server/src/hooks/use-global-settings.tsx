import { readSaved } from '@/lib/read-json';
import useSWR from 'swr';

export type GlobalBranding = {
  logo?: string;
  favicon?: string;
  accentColor?: string;
};

export type GlobalEmailSettings = {
  login?: {
    fromAddress?: string;
    fromName?: string;
    helpAddress?: string;
  };
  notifications?: {
    fromAddress?: string;
    fromName?: string;
    replyTo?: string;
  };
};

export type GlobalSettings = {
  branding: GlobalBranding;
  email: GlobalEmailSettings;
};

const url = '/api/openstad/api/global-settings';

export default function useGlobalSettings() {
  const globalSettingsSwr = useSWR<GlobalSettings>(url);

  async function updateGlobalSettings(
    values: Partial<GlobalSettings>
  ): Promise<GlobalSettings> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    const saved = await readSaved(
      res,
      'De instellingen konden niet worden opgeslagen.'
    );
    await globalSettingsSwr.mutate(saved, false);
    return saved;
  }

  return { ...globalSettingsSwr, updateGlobalSettings };
}
