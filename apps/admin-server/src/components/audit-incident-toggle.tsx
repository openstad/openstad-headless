import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Heading, Paragraph } from '@/components/ui/typography';
import { DialogClose } from '@radix-ui/react-dialog';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

type AuditIncidentToggleProps = {
  projectId: string | number;
  auditIncidentAt: string | null;
  onUpdate: () => void;
};

export default function AuditIncidentToggle({
  projectId,
  auditIncidentAt,
  onUpdate,
}: AuditIncidentToggleProps) {
  const [open, setOpen] = useState(false);
  const isActive = !!auditIncidentAt;

  async function handleConfirm() {
    try {
      const method = isActive ? 'DELETE' : 'PUT';
      const res = await fetch(
        `/api/openstad/api/project/${projectId}/audit-log/incident`,
        { method }
      );

      if (!res.ok) {
        throw new Error('Request failed');
      }

      toast.success(
        isActive
          ? 'Beveiligingsincident opgeheven'
          : 'Beveiligingsincident gemeld'
      );
      onUpdate();
    } catch (err) {
      toast.error('Er is een fout opgetreden');
    }
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-4">
      {isActive && (
        <Paragraph className="text-sm text-red-600">
          Beveiligingsincident actief sinds{' '}
          {new Date(auditIncidentAt!).toLocaleString('nl-NL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Paragraph>
      )}

      <Dialog open={open} modal={true} onOpenChange={setOpen}>
        <Button
          variant={isActive ? 'outline' : 'destructive'}
          onClick={() => setOpen(true)}>
          {isActive ? 'Incident opheffen' : 'Beveiligingsincident melden'}
        </Button>

        <DialogContent
          onEscapeKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
          onInteractOutside={(e: Event) => {
            e.stopPropagation();
            setOpen(false);
          }}>
          <div>
            <Heading size="lg">
              {isActive
                ? 'Beveiligingsincident opheffen'
                : 'Beveiligingsincident melden'}
            </Heading>
            <Paragraph className="mb-8">
              {isActive
                ? 'Weet je zeker dat je het beveiligingsincident wilt opheffen?'
                : 'Weet je zeker dat je een beveiligingsincident wilt melden? Dit verlengt de retentieperiode van audit logs naar 36 maanden.'}
            </Paragraph>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                  }}
                  type="button"
                  variant="ghost">
                  Annuleren
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant={isActive ? 'default' : 'destructive'}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirm();
                }}>
                {isActive ? 'Opheffen' : 'Incident melden'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
