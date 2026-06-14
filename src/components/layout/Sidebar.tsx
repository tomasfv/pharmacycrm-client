import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import {
  Squares2X2Icon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  BeakerIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUnreadCount } from '@/features/notifications/notificationsSlice';
import { logoutAction } from '@/features/auth/authSlice';

interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: Squares2X2Icon, label: 'Dashboard' },
  { to: '/patients', icon: UserGroupIcon, label: 'Patients' },
  { to: '/followups', icon: ClipboardDocumentListIcon, label: 'Follow-Ups' },
  { to: '/contacts', icon: PhoneIcon, label: 'Contacts' },
  { to: '/medications', icon: BeakerIcon, label: 'Medications' },
  { to: '/reports', icon: ChartBarIcon, label: 'Reports' },
  { to: '/notifications', icon: BellIcon, label: 'Notifications' },
  { to: '/users', icon: UsersIcon, label: 'Users' },
  { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const unreadCount = useAppSelector(selectUnreadCount);

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
          collapsed && '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">PC</span>
          </div>
          <span className="font-semibold text-gray-900">PharmaCare CRM</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
              {item.to === '/notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => {
              dispatch(logoutAction());
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
