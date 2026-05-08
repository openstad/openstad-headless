import AuditLogTable from '@/components/audit-log-table';
import { useRouter } from 'next/router';
import React from 'react';

export default function ProjectResourceAuditLog() {
  const router = useRouter();
  const { project, id } = router.query;

  return (
    <AuditLogTable
      modelName="Resource"
      modelId={id as string}
      projectId={project as string}
    />
  );
}
