import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useComments from '@/hooks/use-comments';
import useUsers from '@/hooks/use-users';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import toast from 'react-hot-toast';

export default function ProjectResourceArguments() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { data, removeComment } = useComments(
    project as string,
    `/${id}/comment?includeRepliesOnComments=1`
  );
  const { data: usersData } = useUsers();

  function renderComments(comments: any, pre = '') {
    return (
      <ul className="admin-overview">
        {comments?.map((comment: any) => {
          const user =
            usersData?.find((u: any) => u.id === comment.userId) || null;
          const userKey =
            user?.idpUser?.identifier && user?.idpUser?.provider
              ? `${user.idpUser.provider}-*-${user.idpUser.identifier}`
              : (user?.id ?? comment.userId)?.toString() || null;

          return (
            <React.Fragment key={comment.id}>
              <li className="grid grid-cols-3 lg:grid-cols-10 items-center py-3 px-2 border-b border-border">
                <Paragraph className="col-span-1 lg:col-span-1 truncate">
                  {comment.id}
                </Paragraph>
                <Paragraph className="hidden lg:flex lg:col-span-1 truncate">
                  {userKey ? (
                    <a
                      href={`/users/${btoa(userKey)}`}
                      style={{ textDecoration: 'underline' }}>
                      {comment.userId}
                    </a>
                  ) : (
                    comment.userId
                  )}
                </Paragraph>
                <Paragraph className="col-span-1 lg:col-span-4 truncate pr-4">
                  {pre && <span className="pr-3">{pre}</span>}
                  {comment.description}
                </Paragraph>
                <Paragraph className="hidden lg:flex lg:col-span-2 truncate">
                  {comment.createdAt}
                </Paragraph>
                <Paragraph className="hidden lg:flex lg:col-span-1 truncate">
                  {comment.sentiment}
                </Paragraph>
                <div
                  className="col-span-1 lg:col-span-1 flex ml-auto"
                  onClick={(e) => e.preventDefault()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <MoreHorizontal className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/projects/${project}/resources/${id}?tab=createComment&parentId=${comment.id}`}>
                          Reageer
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <RemoveResourceDialog
                          header="Reactie verwijderen"
                          message="Weet je zeker dat je deze reactie wilt verwijderen?"
                          onDeleteAccepted={() =>
                            removeComment(comment.id)
                              .then(() =>
                                toast.success('Reactie succesvol verwijderd')
                              )
                              .catch(() =>
                                toast.error(
                                  'Reactie kon niet worden verwijderd'
                                )
                              )
                          }
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>

              {comment.replies && comment.replies.length > 0 && (
                <span>{renderComments(comment.replies, '└')}</span>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      <div className="container px-0">
        <div className="p-6 bg-white rounded-md">
          <div className="grid grid-cols-3 lg:grid-cols-10 items-center py-2 px-2 border-b border-border">
            <ListHeading className="hidden lg:flex lg:col-span-1">
              Reactie ID
            </ListHeading>
            <ListHeading className="hidden lg:flex lg:col-span-1">
              Gebruiker ID
            </ListHeading>
            <ListHeading className="hidden lg:flex lg:col-span-4">
              Argument
            </ListHeading>
            <ListHeading className="hidden lg:flex lg:col-span-2">
              Geplaatst op
            </ListHeading>
            <ListHeading className="hidden lg:flex lg:col-span-1">
              Sentiment
            </ListHeading>
            <ListHeading className="hidden lg:flex lg:col-span-1"></ListHeading>
          </div>
          <ul className="admin-overview">{renderComments(data)}</ul>
        </div>
      </div>
    </div>
  );
}
