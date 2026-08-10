import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useExport from '@/hooks/use-export';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { Button } from '../../../components/ui/button';
import { PageLayout } from '../../../components/ui/page-layout';

type ExportOption = {
  key: string;
  label: string;
  filterFn: (data: any) => any;
};

const EXPORT_OPTIONS: ExportOption[] = [
  {
    key: 'resources',
    label: 'Plannen',
    filterFn: (data) => {
      delete data.resources;
      return data;
    },
  },
  {
    key: 'comments',
    label: 'Comments per plan',
    filterFn: (data) => {
      if (data.resources) {
        data.resources = data.resources.map((r: any) => {
          const { commentsFor, commentsAgainst, commentsNoSentiment, ...rest } =
            r;
          return rest;
        });
      }
      return data;
    },
  },
  {
    key: 'polls',
    label: 'Polls per plan',
    filterFn: (data) => {
      if (data.resources) {
        data.resources = data.resources.map((r: any) => {
          const { poll, ...rest } = r;
          return rest;
        });
      }
      return data;
    },
  },
  {
    key: 'votes',
    label: 'Stemmen per plan',
    filterFn: (data) => {
      if (data.resources) {
        data.resources = data.resources.map((r: any) => {
          const { votes, ...rest } = r;
          return rest;
        });
      }
      return data;
    },
  },
  {
    key: 'tags',
    label: 'Tags',
    filterFn: (data) => {
      delete data.tags;
      return data;
    },
  },
  {
    key: 'statuses',
    label: 'Statussen',
    filterFn: (data) => {
      delete data.statuses;
      return data;
    },
  },
  {
    key: 'widgets',
    label: 'Widgets',
    filterFn: (data) => {
      delete data.widgets;
      return data;
    },
  },
];

export default function ProjectExport() {
  const router = useRouter();
  const { project } = router.query;

  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>(
    () =>
      EXPORT_OPTIONS.reduce(
        (acc, opt) => ({ ...acc, [opt.key]: true }),
        {} as Record<string, boolean>
      )
  );

  const exportDataAsFile = (data: BlobPart, fileName: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const { data, isLoading } = useExport(project as string);

  function transform() {
    let filtered = JSON.parse(JSON.stringify(data));

    for (const option of EXPORT_OPTIONS) {
      if (!checkedOptions[option.key]) {
        filtered = option.filterFn(filtered);
      }
    }

    const jsonData = JSON.stringify(filtered);
    exportDataAsFile(jsonData, `${data.name}.json`, 'application/json');
  }

  function toggleOption(key: string) {
    setCheckedOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Exporteren',
            url: `/projects/${project}/export`,
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <Heading size="xl">Exporteren</Heading>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 w-fit">
              <div className="col-span-full">
                <p className="mb-4">
                  Selecteer welke gegevens je wilt exporteren.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Checkbox checked disabled id="export-projectgegevens" />
                    <label htmlFor="export-projectgegevens">
                      Projectgegevens
                    </label>
                  </li>
                  {EXPORT_OPTIONS.map((option) => (
                    <li key={option.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`export-${option.key}`}
                        checked={checkedOptions[option.key]}
                        onCheckedChange={() => toggleOption(option.key)}
                      />
                      <label
                        htmlFor={`export-${option.key}`}
                        className="cursor-pointer">
                        {option.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-fit col-span-full mt-4"
                type="submit"
                disabled={isLoading || !data}
                onClick={transform}>
                Opslaan
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
