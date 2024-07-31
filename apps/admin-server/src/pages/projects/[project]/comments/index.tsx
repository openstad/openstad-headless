import { PageLayout } from '../../../../components/ui/page-layout';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useComments from '@/hooks/use-comments';
import Link from 'next/link';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import toast from 'react-hot-toast';
import { sortTable, searchTable } from '@/components/ui/sortTable';
import { Button } from '../../../../components/ui/button';
import * as XLSX from 'xlsx';


export default function ProjectComments() {
  const router = useRouter();
  const { project } = router.query;
  const { data, removeComment } = useComments(project as string);
  const [comments, setComments] = useState<any[]>([])

  const exportData = (data: any[], fileName: string) => {
    const flattenObject = (obj: any, parent: string = '', res: any = {}) => {
      for (let key in obj) {
        const propName = parent ? `${parent}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            res[propName] = obj[key].map((item: any) => JSON.stringify(item)).join(',');
          } else {
            flattenObject(obj[key], propName, res);
          }
        } else {
          res[propName] = obj[key];
        }
      }
      return res;
    };
  
    const flattenedData = data.map(item => flattenObject(item));
  
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    XLSX.writeFile(workbook, fileName);
  };
  function transform() {
    const today = new Date();
    const projectId = router.query.project;
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');
    exportData(comments, `${projectId}_reacties_${formattedDate}.xlsx`);
  }
  useEffect(() => {
    if (data) {
      let comments = []
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.commentsFor) {
          for (let j = 0; j < data[i]?.commentsFor.length; j++) {
            comments.push(data[i]?.commentsFor[j])
          }
        }
        if (data[i]?.commentsAgainst) {
          for (let k = 0; k < data[i]?.commentsAgainst.length; k++) {
            comments.push(data[i]?.commentsAgainst[k])
          }
        }

        setComments(comments)
      }
    }
  }, [data]);

  const [filterData, setFilterData] = useState(comments);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  useEffect(() => {
    setFilterData(comments);
  }, [comments])

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
            name: 'Reacties',
            url: `/projects/${project}/comments`,
          },
        ]}
        action={
          <div className='flex flex-row w-full md:w-auto my-auto gap-4'>
            <Button className="text-xs p-2 w-fit" type="submit" onClick={transform}>
              Exporteer reacties
            </Button>
          </div>
        }>
        <div className="container py-6">

          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">Filter op:</p>
            <select
              className="p-2 rounded"
              onChange={(e) => setFilterSearchType(e.target.value)}
            >
              <option value="">Alles</option>
              <option value="id">Reactie ID</option>
              <option value="resourceId">Resource ID</option>
              <option value="createdAt">Geplaatst op</option>
              <option value="sentiment">Sentiment</option>
            </select>
            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, filterData, comments)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-7 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-2">
                <button className="filter-button" onClick={(e) => {
                  const sortedData = sortTable('id', e, filterData);
                  setFilterData(sortedData ? sortedData : []);
                }}>
                  Reactie ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
              <button className="filter-button" onClick={(e) => {
                  const sortedData = sortTable('id', e, filterData);
                  setFilterData(sortedData ? sortedData : []);
                }}>
                  Resource ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
              <button className="filter-button" onClick={(e) => {
                  const sortedData = sortTable('id', e, filterData);
                  setFilterData(sortedData ? sortedData : []);
                }}>
                  Geplaatst op
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
              <button className="filter-button" onClick={(e) => {
                  const sortedData = sortTable('id', e, filterData);
                  setFilterData(sortedData ? sortedData : []);
                }}>
                  Sentiment
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((comment: any) => (
                <Link href={`/projects/${project}/comments/${comment.id}`} key={comment.id}>
                  <li key={comment.id} className="grid grid-cols-3 lg:grid-cols-7 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <div className="col-span-2 truncate">
                      <Paragraph>{comment.id}</Paragraph>
                    </div>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1 -mr-16">
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/projects/${project}/resources/${comment.resourceId}`);
                        }}
                        style={{ textDecoration: 'underline', zIndex: '1' }}>{comment.resourceId}
                      </a>
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-2">
                      {comment.createdAt}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      {comment.sentiment}
                    </Paragraph>
                    <div
                      className="hidden lg:flex ml-auto"
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
      </PageLayout>
    </div>
  );
}
