import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type StatsData,
  getCount,
  getStatByKey,
  getTimeSeries,
} from '@/lib/statistics/stats-helpers';
import { cn } from '@/lib/utils';
import { format, parseISO, subMonths } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function AnimatedNumber({
  value,
  duration = 400,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) return;

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <>{display}</>;
}

const statCards = [
  { key: 'resourceTotal', label: 'Hoeveelheid inzendingen' },
  { key: 'userVoteTotal', label: 'Gebruikers die hebben gestemd' },
  { key: 'resourceVotesCountTotal', label: 'Hoeveelheid stemmen' },
  { key: 'resourceVotesCountForTotal', label: 'Hoeveelheid stemmen voor' },
  {
    key: 'resourceVotesCountAgainstTotal',
    label: 'Hoeveelheid stemmen tegen',
  },
  { key: 'commentCountTotal', label: 'Hoeveelheid reacties' },
  { key: 'commentForCountTotal', label: 'Hoeveelheid reacties voor' },
  {
    key: 'commentAgainstCountTotal',
    label: 'Hoeveelheid reacties tegen',
  },
  {
    key: 'choicesguideresultsCountTotal',
    label: 'Hoeveelheid keuzewijzer inzendingen',
  },
];

const charts = [
  {
    key: 'resourcesSubmittedPerDay',
    label: 'Hoeveelheid inzendingen per dag',
  },
  { key: 'votesPerDay', label: 'Hoeveelheid stemmen per dag' },
  {
    key: 'usersVotedPerDay',
    label: 'Hoeveelheid gebruikers die hebben gestemd per dag',
  },
];

export default function Statistics() {
  const router = useRouter();
  const { project } = router.query;

  const [stats, setStats] = useState<StatsData>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const [fromDate, setFromDate] = useState<Date>(subMonths(new Date(), 1));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('cijfers');

  useEffect(() => {
    if (!project) return;

    const controller = new AbortController();

    const params = new URLSearchParams();
    params.set('from', format(fromDate, 'yyyy-MM-dd'));
    params.set('to', format(toDate, 'yyyy-MM-dd'));

    fetch(`/api/openstad/stats/project/${project}/overview?${params}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching stats:', err);
        }
      })
      .finally(() => {
        setInitialLoad(false);
      });

    return () => controller.abort();
  }, [project, fromDate, toDate]);

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

  const filteredStatCards = useMemo(
    () => statCards.filter((card) => getStatByKey(stats, card.key)),
    [stats]
  );

  const filteredCharts = useMemo(
    () => charts.filter((chart) => formattedChartData[chart.key]?.length > 0),
    [formattedChartData]
  );

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
            url: `/projects/${project}/statistics`,
          },
        ]}>
        <div className="container py-6">
          {initialLoad ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Laden...</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md justify-between p-4">
                <div className="flex">
                  <TabsTrigger value="cijfers">Cijfers</TabsTrigger>
                  <TabsTrigger value="grafieken">Grafieken</TabsTrigger>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Van
                    </label>
                    <Popover open={fromOpen} onOpenChange={setFromOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-9 px-3 text-sm font-normal rounded-lg border-input bg-background hover:bg-accent/50 transition-colors',
                            !fromDate && 'text-muted-foreground'
                          )}>
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          {fromDate ? (
                            format(fromDate, 'd MMMM yyyy', { locale: nl })
                          ) : (
                            <span>Kies een datum</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={(date) => {
                            if (date) setFromDate(date);
                            setFromOpen(false);
                          }}
                          disabled={(date) => date > toDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Tot
                    </label>
                    <Popover open={toOpen} onOpenChange={setToOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-9 px-3 text-sm font-normal rounded-lg border-input bg-background hover:bg-accent/50 transition-colors',
                            !toDate && 'text-muted-foreground'
                          )}>
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          {toDate ? (
                            format(toDate, 'd MMMM yyyy', { locale: nl })
                          ) : (
                            <span>Kies een datum</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={(date) => {
                            if (date) setToDate(date);
                            setToOpen(false);
                          }}
                          disabled={(date) => date < fromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsList>

              <TabsContent value="cijfers" className="p-0">
                <div className="p-6 bg-white rounded-md">
                  {filteredStatCards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {filteredStatCards.map((card) => (
                        <Card key={card.key}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              {card.label}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-3xl font-bold">
                              <AnimatedNumber
                                value={getCount(stats, card.key)}
                              />
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
                  {filteredCharts.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {filteredCharts.map((chart) => (
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
