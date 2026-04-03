import { ConfirmActionDialog } from '@/components/dialog-confirm-action';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useComments from '@/hooks/use-comments';
import useResources from '@/hooks/use-resources';
import { exportComments } from '@/lib/export-helpers/comments-export';
import { Paginator } from '@openstad-headless/ui/src';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDebouncedValue } from 'rooks';

import { Button } from '../../../../components/ui/button';
import { PageLayout } from '../../../../components/ui/page-layout';

type SortDirection = 'asc' | 'desc';

const COMMENT_SORT_MAP: Record<string, string> = {
  id: 'id',
  resourceId: 'resourceId',
  description: 'description',
  createdAt: 'createdAt',
  sentiment: 'sentiment',
  'voted-yes': 'yes',
  'voted-no': 'no',
  score: 'score',
};

const COMMENT_SEARCH_FIELD_MAP: Record<string, string> = {
  description: 'description',
  id: 'text',
  resourceId: 'text',
  createdAt: 'text',
  sentiment: 'text',
};

export default function ProjectComments() {
  const router = useRouter();
  const { project } = router.query;

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [activeResource, setActiveResource] = useState('0');
  const [allResources, setAllResources] = useState<
    { id: number; name: string }[]
  >([]);
  const [apiSearchTerm] = useDebouncedValue(searchTerm, 400);
  const activeResourceId =
    activeResource !== '0' ? activeResource.split(' - ')[0] : '0';

  const { data, pagination, removeComment, fetchAll } = useComments(
    project as string,
    '?includeAllComments=1&includeVoteCount=1&includeTags',
    true,
    page,
    pageLimit,
    {
      sort: `${COMMENT_SORT_MAP[sortField] || 'createdAt'}_${sortDirection}`,
      searchField: COMMENT_SEARCH_FIELD_MAP[filterSearchType] || 'text',
      searchTerm: apiSearchTerm || undefined,
      sentiment:
        filterSearchType === 'sentiment' && apiSearchTerm
          ? apiSearchTerm
          : undefined,
      resourceId: activeResourceId,
    }
  );
  const { data: resources } = useResources(project as string);
  const [comments, setComments] = useState<any[]>([]);
  const [nestedComments, setNestedComments] = useState<any[]>([]);

  async function transform() {
    const today = new Date();
    const projectId = router.query.project;
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');
    const allData = await fetchAll();
    exportComments(allData, `${projectId}_reacties_${formattedDate}.xlsx`);
  }

  function categorizeTags(tags: { type: string; name: string }[]) {
    if (!tags) return {};
    return tags.reduce((acc: any, tag: { type: string; name: string }) => {
      if (!acc[tag.type]) {
        acc[tag.type] = [];
      }
      acc[tag.type].push(tag.name);
      return acc;
    }, {});
  }

  useEffect(() => {
    if (pagination) {
      const count = pagination.totalCount || 0;
      const pageCount = Math.ceil(count / pageLimit);
      setTotalPages(pageCount);
      setTotalCount(count);
    }
  }, [pagination, pageLimit]);

  useEffect(() => {
    if (data) {
      let comments = [];

      for (let i = 0; i < data.length; i++) {
        comments.push({
          ...data[i],
          tags: categorizeTags(data[i]?.tags),
        });
      }

      setComments(comments);
    }
  }, [data]);

  function nestComments(comments: any) {
    const commentMap: any = {};
    const nestedComments: any = [];

    comments.forEach((comment: any) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach((comment: any) => {
      if (comment.parentId === null) {
        nestedComments.push(commentMap[comment.id]);
      } else {
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        }
      }
    });

    return nestedComments;
  }

  useEffect(() => {
    const nested = nestComments(comments);
    setNestedComments(nested);
  }, [comments]);

  useEffect(() => {
    setPage(0);
  }, [apiSearchTerm, filterSearchType, activeResourceId]);

  useEffect(() => {
    if (!!resources) {
      const resourceArray = resources.map((resource: any) => {
        const title =
          resource?.title && resource.title.length > 50
            ? `${resource.title.slice(0, 50)}...`
            : resource?.title || '';
        return {
          id: resource.id,
          name: title,
        };
      });

      setAllResources(resourceArray);
    }
  }, [resources]);

  const selectClick = (value: any) => {
    setActiveResource(value);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(0);
  };

  const getSortButtonClass = (field: string) => {
    if (field !== sortField) return 'filter-button';
    return `filter-button font-bold text-black ${sortDirection === 'asc' ? '--up' : ''}`;
  };

  // Threaded rendering (parent + replies) is only meaningful on date sorting.
  // For field sorting (id/score/yes/no/etc.) render the flat server-sorted list.
  const displayedComments =
    sortField === 'createdAt' ? nestedComments : comments;

  function getAllCommentIds(comments: any[]): number[] {
    let ids: number[] = [];
    comments.forEach((comment: any) => {
      ids.push(comment.id);
      if (comment.replies && comment.replies.length > 0) {
        ids = ids.concat(getAllCommentIds(comment.replies));
      }
    });
    return ids;
  }

  function renderComments(comments: any, pre = '') {
    return (
      <ul className="admin-overview">
        {comments.map((comment: any) => (
          <React.Fragment key={comment.id}>
            <li
              className={`grid grid-cols-4 lg:grid-cols-12 items-center py-3 px-2`}>
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedItems.includes(comment.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedItems((prev) => [...prev, comment.id]);
                    } else {
                      setSelectedItems((prev) =>
                        prev.filter((id) => id !== comment.id)
                      );
                    }
                  }}
                />
              </div>
              <div className="col-span-1 truncate">
                <Paragraph>{comment.id}</Paragraph>
              </div>
              <Paragraph className="hidden lg:flex truncate lg:col-span-1 -mr-16">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(
                      `/projects/${project}/resources/${comment.resourceId}`
                    );
                  }}
                  style={{ textDecoration: 'underline', zIndex: '1' }}>
                  {comment.resourceId}
                </a>
              </Paragraph>
              <Paragraph
                className="hidden lg:flex truncate lg:col-span-2"
                style={{ marginRight: '1rem' }}>
                {pre && <span style={{ paddingRight: '15px' }}>{pre}</span>}{' '}
                {comment.description}
              </Paragraph>
              <Paragraph className="hidden lg:flex truncate lg:col-span-2">
                {comment.createdAt}
              </Paragraph>
              <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                {comment.sentiment}
              </Paragraph>
              <Paragraph className="hidden lg:flex truncate my-auto">
                {comment.yes || 0}
              </Paragraph>
              <Paragraph className="hidden lg:flex truncate my-auto">
                {comment.no || 0}
              </Paragraph>
              <Paragraph className="hidden lg:flex truncate my-auto">
                {comment.score || 0}
              </Paragraph>
              <div className="hidden lg:col-span-1 lg:flex ml-auto">
                <RemoveResourceDialog
                  header="Reactie verwijderen"
                  message="Weet je zeker dat je deze reactie wilt verwijderen?"
                  onDeleteAccepted={() =>
                    removeComment(comment.id)
                      .then(() => {
                        setTotalCount((prev) => prev - 1);
                        toast.success('Reactie succesvol verwijderd');
                      })
                      .catch(() =>
                        toast.error('Reactie kon niet worden verwijderd')
                      )
                  }
                />
              </div>
            </li>

            {comment.replies && comment.replies.length > 0 && (
              <span>{renderComments(comment.replies, '└')}</span>
            )}
          </React.Fragment>
        ))}
      </ul>
    );
  }

  return (
    <>
      <style jsx global>{`
        .osc-paginator {
          justify-content: center;
          margin-top: 30px;
        }
        .osc-paginator .osc-icon-button .icon p {
          display: none;
        }
      `}</style>
      <div>
        <PageLayout
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
            <div className="flex flex-row w-full md:w-auto my-auto gap-4">
              <Select value={activeResource} onValueChange={selectClick}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Filter inzendingen op resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    Filter inzendingen op resource
                  </SelectItem>
                  {allResources?.map((resource: any) => (
                    <SelectItem
                      key={resource.id}
                      value={`${resource.id} - ${resource.name}`}>{`${resource.id} - ${resource.name}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="text-xs p-2 w-fit"
                type="submit"
                onClick={transform}>
                Exporteer reacties
              </Button>
            </div>
          }>
          <div className="container py-6">
            <div className="mb-2">
              <span className="text-sm text-gray-500">
                {selectedItems.length > 0
                  ? `${selectedItems.length} van ${totalCount} ${
                      totalCount === 1 ? 'reactie' : 'reacties'
                    } geselecteerd`
                  : `${totalCount} ${
                      totalCount === 1 ? 'reactie' : 'reacties'
                    }`}
              </span>
            </div>
            <div className="flex justify-between mb-4 gap-4">
              <div className="flex gap-4">
                <Button
                  variant={'destructive'}
                  className="flex items-center gap-2"
                  onClick={(e) => e.preventDefault()}
                  disabled={selectedItems.length === 0}>
                  <ConfirmActionDialog
                    buttonText="Verwijderen"
                    header="Reacties verwijderen"
                    message="Weet je zeker dat je de geselecteerde reacties wilt verwijderen?"
                    confirmButtonText="Verwijderen"
                    cancelButtonText="Annuleren"
                    onConfirmAccepted={() => {
                      removeComment(0, true, selectedItems)
                        .then(() => {
                          setTotalCount((prev) => prev - selectedItems.length);
                          toast.success('Reacties succesvol verwijderd');
                          setSelectedItems([]);
                        })
                        .catch(() =>
                          toast.error('Reacties konden niet worden verwijderd')
                        );
                    }}
                    confirmButtonVariant="destructive"
                  />
                </Button>
              </div>
              <div className="flex gap-4">
                <p className="text-xs font-medium text-muted-foreground self-center">
                  Filter op:
                </p>
                <select
                  className="p-2 rounded"
                  value={filterSearchType}
                  onChange={(e) => setFilterSearchType(e.target.value)}>
                  <option value="">Alles</option>
                  <option value="id">Reactie ID</option>
                  <option value="resourceId">Inzending ID</option>
                  <option value="description">Reactie</option>
                  <option value="createdAt">Geplaatst op</option>
                  <option value="sentiment">Sentiment</option>
                </select>
                <input
                  type="text"
                  className="p-2 rounded"
                  placeholder="Zoeken..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-white rounded-md">
              <div className="grid grid-cols-2 lg:grid-cols-12 items-center py-2 px-2 border-b border-border">
                <Checkbox
                  className="col-span-1"
                  checked={
                    displayedComments?.length > 0 &&
                    getAllCommentIds(displayedComments).every((id: number) =>
                      selectedItems.includes(id)
                    )
                  }
                  onCheckedChange={(checked) => {
                    const currentPageIds = getAllCommentIds(displayedComments);
                    if (checked) {
                      setSelectedItems((prev) =>
                        Array.from(new Set([...prev, ...currentPageIds]))
                      );
                    } else {
                      setSelectedItems((prev) =>
                        prev.filter((id) => !currentPageIds.includes(id))
                      );
                    }
                  }}
                />
                <ListHeading className="hidden lg:flex lg:col-span-1">
                  <button
                    className={getSortButtonClass('id')}
                    onClick={() => handleSort('id')}>
                    Reactie ID
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-1">
                  <button
                    className={getSortButtonClass('resourceId')}
                    onClick={() => handleSort('resourceId')}>
                    Inzending ID
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-2">
                  <button
                    className={getSortButtonClass('description')}
                    onClick={() => handleSort('description')}>
                    Reactie
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-2">
                  <button
                    className={getSortButtonClass('createdAt')}
                    onClick={() => handleSort('createdAt')}>
                    Geplaatst op
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-1">
                  <button
                    className={getSortButtonClass('sentiment')}
                    onClick={() => handleSort('sentiment')}>
                    Sentiment
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-1">
                  <button
                    className={getSortButtonClass('voted-yes')}
                    onClick={() => handleSort('voted-yes')}>
                    Gestemd op ja
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-1">
                  <button
                    className={getSortButtonClass('voted-no')}
                    onClick={() => handleSort('voted-no')}>
                    Gestemd op nee
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-1">
                  <button
                    className={getSortButtonClass('score')}
                    onClick={() => handleSort('score')}>
                    Wilson score interval
                  </button>
                </ListHeading>
              </div>
              {renderComments(displayedComments)}

              {totalPages > 0 && (
                <div className="flex flex-col items-center gap-4 mt-4">
                  <Paginator
                    page={page || 0}
                    totalPages={totalPages || 1}
                    onPageChange={(newPage) => setPage(newPage)}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Rijen per pagina:
                    </span>
                    <select
                      className="p-2 rounded border"
                      value={pageLimit}
                      onChange={(e) => {
                        setPageLimit(Number(e.target.value));
                        setPage(0);
                      }}>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={250}>250</option>
                    </select>
                    <span className="text-sm text-gray-500">
                      ({totalCount} totaal)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageLayout>
      </div>
    </>
  );
}
