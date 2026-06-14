import { Card, CardHeader, CardTitle } from '@/components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAppSelector } from '@/store/hooks';
import { statusLabels } from '@/utils';

const COLORS = ['#EAB308', '#3B82F6', '#A855F7', '#F97316', '#22C55E'];

export function FollowUpStatusChart() {
  const followUps = useAppSelector((state) => state.followups.followUps);

  const statusCounts = followUps.reduce(
    (acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: statusLabels[status as keyof typeof statusLabels] || status,
    value: count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-Up Status Distribution</CardTitle>
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
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
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
