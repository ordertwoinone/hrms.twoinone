/**
 * Static, app-wide metadata. Imported by the root layout for SEO defaults and
 * by the sidebar/header for branding.
 */
export const siteConfig = {
  name: "Nexus HR",
  shortName: "Nexus",
  description:
    "Premium enterprise HR Management System for UAE companies. Manage employees, attendance, leave, payroll, and compliance in one platform.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en-AE",
  company: {
    legalName: "Nexus HR Technologies FZ-LLC",
    supportEmail: "support@nexushr.ae",
  },
} as const;

export type SiteConfig = typeof siteConfig;
