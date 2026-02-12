import { useState, useEffect } from 'react';

let cachedExternalCertificatesEnabled: boolean | null = null;

export function useExternalCertificatesEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(cachedExternalCertificatesEnabled);

  useEffect(() => {
    if (cachedExternalCertificatesEnabled !== null) {
      setEnabled(cachedExternalCertificatesEnabled);
      return;
    }

    const check = async () => {
      try {
        const response = await fetch('/api/external-certificates-enabled');
        const data = await response.json();
        cachedExternalCertificatesEnabled = data.externalCertificatesEnabled === 'true';
        setEnabled(cachedExternalCertificatesEnabled);
      } catch (error) {
        console.error('Error fetching external certificates status:', error);
        setEnabled(false);
      }
    };

    check();
  }, []);

  return enabled;
}
