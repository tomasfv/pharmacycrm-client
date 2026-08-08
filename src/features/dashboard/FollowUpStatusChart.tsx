import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAppSelector } from '@/store/hooks';
import { statusLabels, statusChartColors } from '@/utils';

export function FollowUpStatusChart() {
  const { t } = useTranslation();
  const followUps = useAppSelector((state) => state.followups.followUps);

  const statusCounts = followUps.reduce(
    (acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    name: statusLabels[status as keyof typeof statusLabels] || status,
    value: count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.followUpStatusDist')}</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((d) => (
                <Cell key={d.status} fill={statusChartColors[d.status as keyof typeof statusChartColors]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
