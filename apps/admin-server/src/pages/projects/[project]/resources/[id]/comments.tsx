import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useComments from '@/hooks/use-comments';
import Link from 'next/link';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import toast from 'react-hot-toast';

export default function ProjectResourceArguments() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { data, removeComment } = useComments(project as string);
  const [comments, setComments] = useState<any[]>([]);

  type Comment = {
    id: number;
    resourceId: number;
    createdAt: string;
    replies?: Comment[];
  }

  useEffect(() => {
    const allComments = (data || []) as { commentsFor?: Comment[], commentsAgainst?: Comment[] }[];

    const comments = allComments.flatMap(({ commentsFor = [], commentsAgainst = [] }) => [
      ...commentsFor,
      ...(commentsFor.flatMap((comment: Comment) => comment.replies || []) as Comment[]),
      ...commentsAgainst,
      ...(commentsAgainst.flatMap((comment: Comment) => comment.replies || []) as Comment[]),
    ]).filter((comment: Comment) => comment.resourceId === parseInt(id as string, 10))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    setComments(comments);
  }, [data, id]);

  return (
    <div>
        <div className="container px-0">
          <div className="p-6 bg-white rounded-md">
            <div
              className="grid lg:grid-cols-5 items-center py-2 px-2 border-b border-border"
              style={{gridTemplateColumns: "1fr 1fr 3fr 2fr 1fr 1fr"}}
            >
              <ListHeading className="hidden lg:flex">
                Reactie ID
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                Reactie op argument
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                Argument
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                Geplaatst op
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                Sentiment
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1 ml-auto"></ListHeading>
            </div>
            <ul>
              {comments?.map((comment: any) => (
                <Link href={`/projects/${project}/comments/${comment.id}`} key={comment.id}>
                  <li
                    key={comment.id}
                    className="grid lg:grid-cols-5 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b"
                    style={{gridTemplateColumns: "1fr 1fr 3fr 2fr 1fr 1fr"}}
                  >
                    <Paragraph
                      className="hidden lg:flex truncate"
                    >
                      {comment.id}
                    </Paragraph>
                    <Paragraph
                      className="hidden lg:flex truncate"
                    >
                      {comment.parentId || ''}
                    </Paragraph>
                    <Paragraph
                      className="hidden lg:flex truncate"
                      style={{marginRight: '1rem'}}
                    >
                      {comment.description}
                    </Paragraph>
                    <Paragraph
                      className="hidden lg:flex truncate"
                      style={{marginRight: '1rem'}}
                    >
                      {comment.createdAt}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {comment.sentiment}
                    </Paragraph>
                    <div
                      className="hidden lg:flex"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Reactie verwijderen"
                        message="Weet je zeker dat je deze reactie wilt verwijderen?"
                        onDeleteAccepted={() =>
                          removeComment(comment.id)
                            .then(() =>
                              toast.success('Reactie successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Reactie kon niet worden verwijderd')
                            )
                        }
                      />
                    </div>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>
    </div>
  );
}
