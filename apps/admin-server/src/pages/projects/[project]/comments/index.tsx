import { PageLayout } from '../../../../components/ui/page-layout';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useComments from '@/hooks/use-comments';
import Link from 'next/link';

export default function ProjectComments() {
  const router = useRouter();
  const { project } = router.query;
  const { data } = useComments(project as string);
  const [comments, setComments] = useState<{ [key: string]: any }>({})

  useEffect(() => {
    if (data) {
      let comments = []
      for (let i = 0; i < data.length; i++) {
        if(data[i]?.commentsFor) {
          for (let j = 0; j < data[i]?.commentsFor.length; j++) {
            comments.push(data[i]?.commentsFor[j])
          }
        }
        if(data[i]?.commentsAgainst) {
          for (let k = 0; k < data[i]?.commentsAgainst.length; k++) {
            comments.push(data[i]?.commentsAgainst[k])
          }
        }
        setComments(comments)
      }
    }
  }, [data]);

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          { 
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Argumenten',
            url: `/projects/${project}/comments`,
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-7 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-2">
                Argument ID
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Resource ID
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
                Geplaatst op
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Sentiment
              </ListHeading>
            </div>
            <ul>
              {comments?.map((comment: any) => (
               <Link href={`/projects/${project}/comments/${comment.id}`} key={comment.id}>
                  <li key={comment.id} className="grid grid-cols-3 lg:grid-cols-7 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <div className="col-span-2 truncate">
                      <Paragraph>{comment.id}</Paragraph>
                    </div>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1 -mr-16">
                      {comment.resourceId}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-2">
                      {comment.createdAt}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      {comment.sentiment}
                    </Paragraph>
                  </li>
               </Link>
              ))}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
