import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Network,
  IdCard,
  BriefcaseBusiness,
  CalendarDays,
  CalendarRange,
  Wallet,
  UsersRound,
  ShieldCheck,
  Mail,
  Bell,
  SlidersHorizontal,
  HardDrive,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
};

interface SettingCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

interface SettingGroup {
  label: string;
  cards: SettingCard[];
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    label: "Organization",
    cards: [
      {
        title: "Company Profile",
        description: "Logo, name, timezone, currency, and contact details.",
        href: ROUTES.company,
        icon: Building2,
      },
      {
        title: "Branches",
        description: "Manage physical office locations and work sites.",
        href: ROUTES.branches,
        icon: Network,
      },
      {
        title: "Departments",
        description: "Organizational units and reporting hierarchy.",
        href: ROUTES.departments,
        icon: Building2,
      },
      {
        title: "Designations",
        description: "Job titles used across your organization.",
        href: ROUTES.designations,
        icon: IdCard,
      },
      {
        title: "Employment Types",
        description: "Full-time, part-time, contract, and other categories.",
        href: ROUTES.employmentTypes,
        icon: BriefcaseBusiness,
      },
    ],
  },
  {
    label: "HR Configuration",
    cards: [
      {
        title: "Leave Types",
        description:
          "Define leave categories, days allocation, and approval rules.",
        href: "/settings/leave-types",
        icon: CalendarDays,
      },
      {
        title: "Public Holidays",
        description: "Add or remove UAE public holidays and company closures.",
        href: ROUTES.company,
        icon: CalendarRange,
      },
    ],
  },
  {
    label: "Finance",
    cards: [
      {
        title: "Payroll Configuration",
        description:
          "Overtime multipliers, allowance rules, and deduction settings.",
        href: "/settings/payroll-config",
        icon: Wallet,
      },
    ],
  },
  {
    label: "Access Control",
    cards: [
      {
        title: "Users",
        description: "Invite, activate, or deactivate user accounts.",
        href: ROUTES.users,
        icon: UsersRound,
      },
      {
        title: "Roles & Permissions",
        description: "Review permission bundles assigned to each role.",
        href: "/settings/roles",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Communications",
    cards: [
      {
        title: "Email Templates",
        description: "Customize the email notifications sent to employees.",
        href: "/settings/email-templates",
        icon: Mail,
      },
      {
        title: "Notification Templates",
        description: "Configure in-app and push notification content.",
        href: "/settings/notification-templates",
        icon: Bell,
      },
    ],
  },
  {
    label: "System",
    cards: [
      {
        title: "System Preferences",
        description: "Date formats, language, and global app behaviour.",
        href: "/settings/system",
        icon: SlidersHorizontal,
      },
      {
        title: "Backup & Export",
        description: "Download data exports and manage backup schedules.",
        href: "/settings/backup",
        icon: HardDrive,
      },
    ],
  },
];

function SettingsCard({ card }: { card: SettingCard }) {
  const Icon = card.icon;
  return (
    <Link href={card.href} className="group block">
      <Card className="flex items-start gap-4 p-4 transition-shadow hover:shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm leading-tight">{card.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            {card.description}
          </p>
        </div>
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </Card>
    </Link>
  );
}

export default async function SettingsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure your organization, HR policies, access control, and system preferences."
      />

      {SETTING_GROUPS.map((group) => (
        <section key={group.label} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {group.label}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.cards.map((card) => (
              <SettingsCard key={card.href} card={card} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
