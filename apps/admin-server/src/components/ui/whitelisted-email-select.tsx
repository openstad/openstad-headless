import {
  Select,
  SelectContentScrollable,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as React from 'react';

type Props = {
  field: any;
  whitelistedEmails: string[];
};

export function WhitelistedEmailSelect({ field, whitelistedEmails }: Props) {
  const emailOptions = Array.from(
    new Set([field.value, ...whitelistedEmails])
  ).filter((email): email is string => Boolean(email));

  return (
    <Select
      key={field.value}
      name={field.name}
      onValueChange={field.onChange}
      value={field.value}>
      <SelectTrigger>
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContentScrollable>
        {emailOptions.map((email) => {
          const isWhitelisted = whitelistedEmails.includes(email);

          return (
            <SelectItem key={email} value={email}>
              {email}
              {!isWhitelisted && ' (Let op: ongeldige afzendadres)'}
            </SelectItem>
          );
        })}
      </SelectContentScrollable>
    </Select>
  );
}
