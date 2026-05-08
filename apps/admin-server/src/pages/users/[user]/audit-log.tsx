import AuditLogTable from '@/components/audit-log-table';
import useUser from '@/hooks/use-user';
import React from 'react';

export default function UserAuditLog() {
  const { data } = useUser();

  if (!data?.id) return null;

  return <AuditLogTable userId={data.id} />;
}
