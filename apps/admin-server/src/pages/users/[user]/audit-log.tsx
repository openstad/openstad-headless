import AuditLogTable from '@/components/audit-log-table';
import useUser from '@/hooks/use-user';
import React from 'react';

export default function UserAuditLog() {
  const { data } = useUser();
  const user = Array.isArray(data) ? data[0] : data;

  if (!user?.id) return null;

  return <AuditLogTable userId={user.id} />;
}
