import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarClock,
  CalendarDays,
  Wallet,
  FileText,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { PERMISSIONS, type Permission } from "@/constants/permissions";

/**
 * A single sidebar navigation entry.
 *
 * `permission` gates visibility: the item only renders if the current user
 * holds that permission (null = always visible). `children` enables collapsible
 * sub-navigation for a module.
 */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission | null;
  children?: Omit<NavItem, "icon" | "children">[];
}

/** Logical grouping of nav items rendered as a labelled section. */
export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Primary navigation, organized into groups. This is the single source of truth
 * for the sidebar. Each new module registers its entry here.
 */
export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.dashboard,
        icon: LayoutDashboard,
        permission: null,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        title: "Employees",
        href: ROUTES.employees,
        icon: Users,
        permission: PERMISSIONS.EMPLOYEE_VIEW,
      },
      {
        title: "Departments",
        href: ROUTES.departments,
        icon: Building2,
        permission: PERMISSIONS.DEPARTMENT_VIEW,
      },
    ],
  },
  {
    label: "Time & Attendance",
    items: [
      {
        title: "Attendance",
        href: ROUTES.attendance,
        icon: CalendarClock,
        permission: PERMISSIONS.ATTENDANCE_VIEW,
      },
      {
        title: "Leave",
        href: ROUTES.leave,
        icon: CalendarDays,
        permission: PERMISSIONS.LEAVE_VIEW,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Payroll",
        href: ROUTES.payroll,
        icon: Wallet,
        permission: PERMISSIONS.PAYROLL_VIEW,
      },
    ],
  },
  {
    label: "Records",
    items: [
      {
        title: "Documents",
        href: ROUTES.documents,
        icon: FileText,
        permission: PERMISSIONS.DOCUMENT_VIEW,
      },
      {
        title: "Reports",
        href: ROUTES.reports,
        icon: BarChart3,
        permission: PERMISSIONS.REPORT_VIEW,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: ROUTES.settings,
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];
