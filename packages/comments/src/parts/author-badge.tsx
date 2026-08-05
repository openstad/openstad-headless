import React from 'react';

type AuthorBadgeProps = {
  isStaffMember?: boolean;
  label?: string;
};

export function AuthorBadge({ isStaffMember, label }: AuthorBadgeProps) {
  if (!isStaffMember || !label) return null;
  return <span className="--isStaff">{label}</span>;
}
