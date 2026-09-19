import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { cn } from "@/utils";
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
  ShoppingBagIcon,
  ChevronDownIcon,
  FolderIcon,
  CubeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUnreadCount } from "@/features/notifications/notificationsSlice";
import { logoutAction } from "@/features/auth/authSlice";

interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
}

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useAppSelector(selectUnreadCount);
  const pharmacyName = useAppSelector((state) => state.settings.general.pharmacyName);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [patientsOpen, setPatientsOpen] = useState(false);

  const labelClass = collapsed ? "hidden 2xl:inline" : "inline lg:hidden 2xl:inline";
  const badgeClass = collapsed ? "hidden 2xl:inline-flex" : "inline-flex lg:hidden 2xl:inline-flex";
  const alignClass = collapsed ? "justify-center 2xl:justify-start" : "justify-start lg:justify-center 2xl:justify-start";

  const patientsSubItems = [
    { to: "/patients", label: t("nav.chronic"), icon: UserGroupIcon },
    { to: "/followups", label: t("nav.followUps"), icon: ClipboardDocumentListIcon },
    { to: "/medications", label: t("nav.medications"), icon: BeakerIcon },
  ];

  const navItems = [
    { to: "/contacts", icon: PhoneIcon, label: t("nav.contacts") },
    { to: "/reports", icon: ChartBarIcon, label: t("nav.reports") },
    { to: "/notifications", icon: BellIcon, label: t("nav.notifications") },
    { to: "/users", icon: UsersIcon, label: t("nav.users") },
    { to: "/settings", icon: Cog6ToothIcon, label: t("nav.settings") },
  ];

  const catalogSubItems = [
    { to: "/catalog/categories", label: t("nav.catalogCategories"), icon: FolderIcon },
    { to: "/catalog/products", label: t("nav.catalogProducts"), icon: CubeIcon },
    { to: "/catalog/orders", label: t("nav.catalogOrders"), icon: DocumentTextIcon },
  ];

  const isPatientsActive = patientsSubItems.some((item) => location.pathname === item.to || location.pathname.startsWith(item.to + "/"));
  const isCatalogActive = catalogSubItems.some((item) => location.pathname === item.to);

  useEffect(() => {
    if (isPatientsActive) setPatientsOpen(true);
  }, [location.pathname]);

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 lg:w-16 2xl:w-48",
          collapsed
            ? "w-16 -translate-x-full lg:translate-x-0"
            : "w-48 translate-x-0",
        )}
      >
        <div className={cn("h-16 flex items-center gap-2 px-4 border-b border-gray-200 overflow-hidden", alignClass)}>
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">{pharmacyName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}</span>
          </div>
          <span className={cn(labelClass, "font-semibold text-gray-900 line-clamp-2")}>{pharmacyName}</span>
        </div>

        <nav className="flex-1 py-4 px-2 2xl:px-3 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            title={t("nav.dashboard")}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-0 2xl:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                alignClass,
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )
            }
          >
            <Squares2X2Icon className="h-5 w-5 shrink-0" />
            <span className={labelClass}>{t("nav.dashboard")}</span>
          </NavLink>

          {/* Patients section */}
          <div>
            <button
              onClick={() => setPatientsOpen(!patientsOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-0 2xl:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                alignClass,
                isPatientsActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <UserGroupIcon className="h-5 w-5 shrink-0" />
              <span className={labelClass}>{t("nav.patientsParent")}</span>
              <ChevronDownIcon className={cn(labelClass, "h-4 w-4 ml-auto transition-transform", patientsOpen && "rotate-180")} />
            </button>
            {patientsOpen && (
              <div className="ml-4 2xl:ml-6 space-y-0.5 mt-0.5">
                {patientsSubItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-0 2xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        alignClass,
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className={labelClass}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Catalog section */}
          <div>
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-0 2xl:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                alignClass,
                isCatalogActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <ShoppingBagIcon className="h-5 w-5 shrink-0" />
              <span className={labelClass}>{t("nav.catalog")}</span>
              <ChevronDownIcon className={cn(labelClass, "h-4 w-4 ml-auto transition-transform", catalogOpen && "rotate-180")} />
            </button>
            {catalogOpen && (
              <div className="ml-4 2xl:ml-6 space-y-0.5 mt-0.5">
                {catalogSubItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-0 2xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        alignClass,
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className={labelClass}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Other nav items */}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-0 2xl:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  alignClass,
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={labelClass}>{item.label}</span>
              {item.to === "/notifications" && unreadCount > 0 && (
                <span className={cn(badgeClass, "ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] items-center justify-center px-1")}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 2xl:p-3 border-t border-gray-200">
          <button
            title="Logout"
            onClick={() => {
              dispatch(logoutAction());
              navigate("/login");
            }}
            className={cn(
              "w-full flex items-center gap-3 px-0 2xl:px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
              alignClass,
            )}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
            <span className={labelClass}>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
