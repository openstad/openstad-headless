import React, {} from 'react';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import useUser from '@/hooks/use-user';

export default function CreateSecurity() {
  const { data:users, reset2fa } = useUser();

  // TODO: Remove console logs
  const resetMfa = async () => {
    console.log(users);
    const response = await reset2fa({
      id: users[0].id,
      projectId: users[0].projectId
    });
    console.log(response);
  }

  return (
    <div className="p-6 bg-white rounded-md">
        <Heading size="xl">Beveiliging</Heading>
        <Separator className="my-4" />
        <button onClick={resetMfa}>Reset 2FA</button>
    </div>
  );
}
