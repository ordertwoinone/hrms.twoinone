import {
  LayoutDashboard,
  CircleUserRound,
  Bell,
  Users,
  Building2,
  Network,
  IdCard,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  FileSignature,
  Stamp,
  Fingerprint,
  BookUser,
  SquareUser,
  ShieldPlus,
  Wallet,
  FileText,
  BarChart3,
  Settings,
  ScrollText,
  UsersRound,
  ClipboardList,
  TrendingUp,
  GraduationCap,
  Clock,
  CreditCard,
  Briefcase,
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
  /** Optional notification count rendered as a badge on the nav item. */
  badge?: number;
  /** Optional sub-navigation rendered as an expandable group. */
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
      {
        title: "Self Service",
        href: ROUTES.selfService,
        icon: CircleUserRound,
        permission: null,
      },
      {
        title: "Notifications",
        href: ROUTES.notifications,
        icon: Bell,
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
        title: "Onboarding",
        href: ROUTES.onboarding,
        icon: ClipboardList,
        permission: PERMISSIONS.ONBOARDING_VIEW,
      },
      {
        title: "Performance",
        href: ROUTES.performance,
        icon: TrendingUp,
        permission: PERMISSIONS.PERFORMANCE_VIEW,
      },
      {
        title: "Training",
        href: ROUTES.training,
        icon: GraduationCap,
        permission: PERMISSIONS.TRAINING_VIEW,
      },
      {
        title: "Recruitment",
        href: ROUTES.recruitment,
        icon: Briefcase,
        permission: PERMISSIONS.RECRUITMENT_VIEW,
      },
      {
        title: "Branches",
        href: ROUTES.branches,
        icon: Network,
        permission: PERMISSIONS.BRANCH_VIEW,
      },
      {
        title: "Departments",
        href: ROUTES.departments,
        icon: Building2,
        permission: PERMISSIONS.DEPARTMENT_VIEW,
      },
      {
        title: "Designations",
        href: ROUTES.designations,
        icon: IdCard,
        permission: PERMISSIONS.DESIGNATION_VIEW,
      },
      {
        title: "Employment Types",
        href: ROUTES.employmentTypes,
        icon: BriefcaseBusiness,
        permission: PERMISSIONS.EMPLOYMENT_TYPE_VIEW,
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
      {
        title: "Overtime",
        href: ROUTES.overtime,
        icon: Clock,
        permission: PERMISSIONS.OVERTIME_VIEW,
      },
    ],
  },
  {
    label: "Compliance",
    items: [
      {
        title: "Visas",
        href: ROUTES.visas,
        icon: Stamp,
        permission: PERMISSIONS.VISA_VIEW,
      },
      {
        title: "Emirates IDs",
        href: ROUTES.emiratesIds,
        icon: Fingerprint,
        permission: PERMISSIONS.EMIRATES_ID_VIEW,
      },
      {
        title: "Passports",
        href: ROUTES.passports,
        icon: BookUser,
        permission: PERMISSIONS.PASSPORT_VIEW,
      },
      {
        title: "Labour Cards",
        href: ROUTES.labourCards,
        icon: SquareUser,
        permission: PERMISSIONS.LABOUR_CARD_VIEW,
      },
      {
        title: "Medical Insurance",
        href: ROUTES.medicalInsurance,
        icon: ShieldPlus,
        permission: PERMISSIONS.MEDICAL_INSURANCE_VIEW,
      },
      {
        title: "Contracts",
        href: ROUTES.contracts,
        icon: FileSignature,
        permission: PERMISSIONS.CONTRACT_VIEW,
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
        children: [
          { title: "Dashboard", href: ROUTES.payroll, permission: PERMISSIONS.PAYROLL_VIEW },
          { title: "Payroll Runs", href: ROUTES.payrollRuns, permission: PERMISSIONS.PAYROLL_VIEW },
          { title: "Salary Structures", href: ROUTES.payrollSalaryStructures, permission: PERMISSIONS.SALARY_VIEW },
          { title: "Loans", href: ROUTES.payrollLoans, permission: PERMISSIONS.LOAN_VIEW },
          { title: "Advances", href: ROUTES.payrollAdvances, permission: PERMISSIONS.ADVANCE_VIEW },
          { title: "Bonuses", href: ROUTES.payrollBonuses, permission: PERMISSIONS.BONUS_VIEW },
        ],
      },
      {
        title: "WPS & Gratuity",
        href: ROUTES.wps,
        icon: CreditCard,
        permission: PERMISSIONS.WPS_VIEW,
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
        title: "Company",
        href: ROUTES.company,
        icon: Building2,
        permission: PERMISSIONS.COMPANY_VIEW,
      },
      {
        title: "Users",
        href: ROUTES.users,
        icon: UsersRound,
        permission: PERMISSIONS.USER_VIEW,
      },
      {
        title: "Audit Log",
        href: ROUTES.audit,
        icon: ScrollText,
        permission: PERMISSIONS.AUDIT_VIEW,
      },
      {
        title: "Settings",
        href: ROUTES.settings,
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];
