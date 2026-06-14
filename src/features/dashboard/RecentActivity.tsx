import { Card, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useAppSelector } from '@/store/hooks';
import { formatDate } from '@/utils';
import { UserGroupIcon, TruckIcon, BeakerIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import type { ContactCategory } from '@/types';

const categoryConfig: Record<ContactCategory, { icon: React.ElementType; color: string }> = {
  supplier: { icon: BuildingOfficeIcon, color: 'bg-blue-50 text-blue-600' },
  delivery: { icon: TruckIcon, color: 'bg-orange-50 text-orange-600' },
  doctor: { icon: UserGroupIcon, color: 'bg-green-50 text-green-600' },
  lab: { icon: BeakerIcon, color: 'bg-purple-50 text-purple-600' },
  other: { icon: BuildingOfficeIcon, color: 'bg-gray-50 text-gray-600' },
};

export function RecentActivity() {
  const contacts = useAppSelector((state) => state.contacts.contacts).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Contacts</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        {contacts.map((contact) => {
          const cfg = categoryConfig[contact.category];
          const Icon = cfg.icon;
          return (
            <div key={contact.id} className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-500 truncate">{contact.phone}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{formatDate(contact.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
