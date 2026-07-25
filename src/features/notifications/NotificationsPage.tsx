import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead } from './notificationsSlice';
import { Card, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { formatDateTime } from '@/utils';
import { BellIcon, ExclamationCircleIcon, CalendarDaysIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils';
import type { NotificationType } from '@/types';

export function NotificationsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  const typeConfig: Record<NotificationType, { icon: React.ElementType; label: string; color: string }> = {
    contact_today: { icon: BellIcon, label: t('notification.contactToday'), color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    overdue_followup: { icon: ExclamationCircleIcon, label: t('notification.overdue'), color: 'bg-red-50 text-red-600 border-red-200' },
    upcoming_pickup: { icon: ShoppingBagIcon, label: t('notification.upcomingPickup'), color: 'bg-blue-50 text-blue-600 border-blue-200' },
  };

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('notification.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('notification.unread', { count: unread })}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" onClick={async () => { try { await dispatch(markAllAsRead()).unwrap(); } catch {} }}>
            {t('notification.markAllRead')}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">{t('notification.noNotifications')}</p>
          </Card>
        ) : (
          notifications.map((notification) => {
            const config = typeConfig[notification.type];
            const Icon = config.icon;
            return (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer',
                  notification.read ? 'bg-white border-gray-200' : 'bg-primary-50/30 border-primary-200',
                )}
                onClick={async () => { try { await dispatch(markAsRead(notification.id)).unwrap(); } catch {} }}
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border',
                    config.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      notification.type === 'contact_today' ? 'warning' :
                      notification.type === 'overdue_followup' ? 'danger' : 'info'
                    }>
                      {config.label}
                    </Badge>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(notification.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
