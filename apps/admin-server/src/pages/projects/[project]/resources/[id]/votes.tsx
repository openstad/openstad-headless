import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useVotes from '@/hooks/use-votes';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import toast from 'react-hot-toast';
import useUsers from "@/hooks/use-users";

export default function ProjectResourceVotes() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { data, remove } = useVotes(project as string);
  const [votes, setVotes] = useState(data);

  const { data: usersData } = useUsers();

  useEffect(() => {
    const loadedVotes = ((data || []) as { resourceId: number, createdAt: string }[])
      .filter(vote => vote.resourceId === parseInt(id as string, 10))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    setVotes(loadedVotes);
  }, [data]);

  return (
    <div>
        <div className="container px-0">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-7 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Stem ID
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
                Stemdatum
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Gebruiker ID
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Gebruiker IP
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Voorkeur
              </ListHeading>
            </div>
            <ul>
              {votes?.map((vote: any) => {
                const userId = vote.userId;
                const user = usersData?.find((user: any) => user.id === userId) || null;
                const currentUserKey = !!user && user.idpUser?.identifier && user.idpUser?.provider ? `${user.idpUser.provider}-*-${user.idpUser.identifier}` : ( user?.id?.toString() || 'unknown' );

                return (
                  <li
                    key={vote.id}
                    className="grid grid-cols-3 lg:grid-cols-7 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <div className="col-span-1 truncate">
                      <Paragraph>{vote.id}</Paragraph>
                    </div>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-2">
                      {vote.createdAt}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      <a href={`/users/${btoa(currentUserKey)}`} style={{textDecoration: 'underline'}}>{vote.userId}</a>
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      {vote.ip}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1 -mr-16">
                      {vote.opinion}
                    </Paragraph>
                    <div
                      onClick={(e) => e.preventDefault()}
                      className="hidden lg:flex ml-auto">
                      <RemoveResourceDialog
                        header="Stem verwijderen"
                        message="Weet je zeker dat je deze stem wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(vote.id)
                            .then(() =>
                              toast.success('Stem successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Stem kon niet worden verwijderd')
                            )
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
    </div>
  );
}
