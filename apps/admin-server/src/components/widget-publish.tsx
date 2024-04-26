import React from 'react';
import { Input } from '@/components/ui/input';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function WidgetPublish({ apiUrl }: { apiUrl: string }) {
  const router = useRouter();
  const id = router.query.id;
  const widgetScriptTag = `<script src="${apiUrl}/widget/${id}" type="text/javascript"></script>`;
  const widgetUrl = `${apiUrl}/widget/${id}`;

  const onCopy = (textToBeCopied: string, toastStart: string) => {
    navigator.clipboard.writeText(textToBeCopied);
    toast.success(`${toastStart} gekopieerd naar klembord`);
  };

  return (
    <div className="p-6 bg-white rounded-md space-y-4 lg:w-full">
      <Heading size="xl" className="mb-4">
        Publiceren
      </Heading>
      <Separator className="mb-4" />
      <Input disabled={true} value={widgetScriptTag} />
      <p>
        <em>
          Voeg bovenstaande code toe op de plek waar u de widget wilt tonen.<br />
          Met de &apos;Kopieer code&apos; knop wordt bovenstaande code in zijn geheel gekopieerd.<br />
          Met de &apos;Kopieer widget URL&apos; knop wordt alleen de URL gekopieerd die bij de src tussen aanhalingstekens staat.
        </em>
      </p>
      <div className="flex gap-4 p-0">
        <Button onClick={() => onCopy(widgetScriptTag, 'Code')}>Kopieer code</Button>
        <Button className="offset-2" onClick={() => onCopy(widgetUrl, 'Widget URL')}>Kopieer widget URL</Button>
      </div>
    </div>
  );
}
