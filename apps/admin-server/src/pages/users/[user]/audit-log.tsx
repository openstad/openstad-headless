import AuditLogTable from '@/components/audit-log-table';
import { useRouter } from 'next/router';
import React from 'react';

export default function UserAuditLog() {
  const router = useRouter();
  const { user } = router.query;

  return <AuditLogTable userId={user as string} />;
}
