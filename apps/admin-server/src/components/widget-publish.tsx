import React from 'react';
import {
  Input
} from '@/components/ui/input';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import {Button} from "@/components/ui/button";
import { toast } from 'react-hot-toast';

export default function WidgetPublish() {
  const router = useRouter();
  const id = router.query.id;
  const widgetScriptTag = `<script src="${process.env.NEXT_PUBLIC_API_URL}/widget/${id}" type="text/javascript"></script>`;

  const onCopy = () => {
    navigator.clipboard.writeText(widgetScriptTag);
    toast.success('Code gekopieerd naar klembord');
  }

  return (
    <div className="p-6 bg-white rounded-md space-y-4 lg:w-full">
      <Heading size="xl" className="mb-4">
        Publiceren
      </Heading>
      <Separator className="mb-4" />
      <Input disabled={true} value={widgetScriptTag} />
        <p><em>Voeg bovenstaande code toe op de plek waar u de widget wilt tonen.</em></p>
        <Button onClick={onCopy}>Kopiëer code</Button>
    </div>
  );
}
