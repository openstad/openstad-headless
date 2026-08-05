import React from 'react';

type AuthorBadgeProps = {
  staffRole?: 'admin' | 'editor' | null;
  adminLabel?: string;
  editorLabel?: string;
};

export function AuthorBadge({
  staffRole,
  adminLabel,
  editorLabel,
}: AuthorBadgeProps) {
  if (staffRole !== 'admin' && staffRole !== 'editor') return null;

  const isAdmin = staffRole === 'admin';
  const label = isAdmin ? adminLabel : editorLabel;
  if (!label) return null;

  return <span className={isAdmin ? '--isAdmin' : '--isEditor'}>{label}</span>;
}
