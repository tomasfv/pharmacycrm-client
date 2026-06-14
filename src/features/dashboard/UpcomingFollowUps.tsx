import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useAppSelector } from '@/store/hooks';
import { formatDate, statusLabels, statusColors } from '@/utils';
import type { Prescription } from '@/types';

function getLatestPrescription(list: Prescription[]): Prescription | null {
  if (list.length === 0) return null;
  return list.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
}

export function UpcomingFollowUps() {
  const navigate = useNavigate();
  const followUps = useAppSelector((state) => state.followups.followUps)
    .filter((f) => f.status !== 'delivered')
    .slice(0, 5);
  const prescriptions = useAppSelector((state) => state.prescriptions.prescriptions);

  const latestRxMap = useMemo(() => {
    const grouped = new Map<string, Prescription[]>();
    for (const rx of prescriptions) {
      const arr = grouped.get(rx.patientId);
      if (arr) arr.push(rx);
      else grouped.set(rx.patientId, [rx]);
    }
    const latest = new Map<string, Prescription>();
    for (const [patientId, list] of grouped) {
      const l = getLatestPrescription(list);
      if (l) latest.set(patientId, l);
    }
    return latest;
  }, [prescriptions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Follow-Ups</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs uppercase">
              <th className="pb-2 font-medium">Patient</th>
              <th className="pb-2 font-medium">Medication</th>
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {followUps.map((fu) => {
              const rx = latestRxMap.get(fu.patientId);
              const medNames = rx ? rx.medications.map((m) => m.medicationName).join(', ') : fu.medication;
              return (
                <tr
                  key={fu.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate('/followups')}
                >
                  <td className="py-2.5 pr-3 font-medium text-gray-900">{fu.patientName}</td>
                  <td className="py-2.5 pr-3 text-gray-600 max-w-[200px] truncate" title={medNames}>{medNames}</td>
                  <td className="py-2.5 pr-3 text-gray-600">{formatDate(fu.scheduledDate)}</td>
                  <td className="py-2.5">
                    <Badge className={statusColors[fu.status]}>{statusLabels[fu.status]}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
