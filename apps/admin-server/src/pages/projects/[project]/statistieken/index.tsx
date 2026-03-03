import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type StatsData,
  getCount,
  getStatByKey,
  getTimeSeries,
} from '@/lib/statistieken/stats-helpers';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function Statistieken() {
  const router = useRouter();
  const { project } = router.query;

  const [stats, setStats] = useState<StatsData>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project) return;

    setLoading(true);
    fetch(`/api/openstad/stats/project/${project}/overview`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error('Error fetching stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [project]);

  const statCards = [
    { key: 'resourceTotal', label: 'Hoeveelheid ideeën' },
    { key: 'userVoteTotal', label: 'Gebruikers die hebben gestemd' },
    { key: 'resourceVotesCountTotal', label: 'Hoeveelheid stemmen' },
    { key: 'resourceVotesCountForTotal', label: 'Hoeveelheid stemmen voor' },
    {
      key: 'resourceVotesCountAgainstTotal',
      label: 'Hoeveelheid stemmen tegen',
    },
    { key: 'commentCountTotal', label: 'Hoeveelheid argumenten' },
    { key: 'commentForCountTotal', label: 'Hoeveelheid argumenten voor' },
    {
      key: 'commentAgainstCountTotal',
      label: 'Hoeveelheid argumenten tegen',
    },
    {
      key: 'choicesguideresultsCountTotal',
      label: 'Hoeveelheid keuzewijzer inzendingen',
    },
  ];

  const charts = [
    {
      key: 'resourcesSubmittedPerDay',
      label: 'Hoeveelheid ideeën per dag',
    },
    { key: 'votesPerDay', label: 'Hoeveelheid stemmen per dag' },
    {
      key: 'usersVotedPerDay',
      label: 'Hoeveelheid gebruikers die hebben gestemd per dag',
    },
  ];

  const formattedChartData = useMemo(() => {
    const result: Record<string, { date: string; counted: number }[]> = {};
    for (const chart of charts) {
      const timeSeries = getTimeSeries(stats, chart.key);
      result[chart.key] = timeSeries.map((point) => ({
        ...point,
        date: (() => {
          try {
            return format(parseISO(point.date), 'd MMM, yyyy', {
              locale: nl,
            });
          } catch {
            return point.date;
          }
        })(),
      }));
    }
    return result;
  }, [stats]);

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Statistieken',
            url: `/projects/${project}/statistieken`,
          },
        ]}>
        <div className="container py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Laden...</p>
            </div>
          ) : (
            <Tabs defaultValue="cijfers">
              <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
                <TabsTrigger value="cijfers">Cijfers</TabsTrigger>
                <TabsTrigger value="grafieken">Grafieken</TabsTrigger>
              </TabsList>

              <TabsContent value="cijfers" className="p-0">
                <div className="p-6 bg-white rounded-md">
                  {statCards.filter((card) => getStatByKey(stats, card.key))
                    .length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {statCards
                        .filter((card) => getStatByKey(stats, card.key))
                        .map((card) => (
                          <Card key={card.key}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.label}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-3xl font-bold">
                                {getCount(stats, card.key)}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">
                      Er zijn nog geen statistieken beschikbaar voor dit project
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="grafieken" className="p-0">
                <div className="p-6 bg-white rounded-md">
                  {charts.filter(
                    (chart) => formattedChartData[chart.key]?.length > 0
                  ).length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {charts
                        .filter(
                          (chart) => formattedChartData[chart.key]?.length > 0
                        )
                        .map((chart) => (
                          <div
                            key={chart.key}
                            className="p-6 bg-white rounded-md border">
                            <h3 className="text-lg font-semibold mb-4">
                              {chart.label}
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={formattedChartData[chart.key]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="date"
                                  interval="preserveStartEnd"
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Area
                                  type="monotone"
                                  dataKey="counted"
                                  stroke="#8B8FD8"
                                  fill="#8B8FD8"
                                  fillOpacity={0.3}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">
                      Er zijn nog geen statistieken beschikbaar voor dit project
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </PageLayout>
    </div>
  );
}
