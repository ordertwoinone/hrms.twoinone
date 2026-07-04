import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { EssPortal } from "@/features/self-service/components/ess-portal";
import { getSelfServiceData } from "@/features/self-service/queries/self-service.queries";
import { getOrgName } from "@/features/payroll/queries/payroll.queries";

export const metadata: Metadata = {
  title: "Self Service",
};

export default async function SelfServicePage() {
  const user = await requireAuth();

  const [data, orgName] = await Promise.all([
    getSelfServiceData({ id: user.id, email: user.email }),
    getOrgName(),
  ]);

  const firstName = user.fullName.split(" ")[0] || user.fullName;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Self Service"
        description="Your profile, leave, attendance, payslips, documents, and requests."
      />
      <EssPortal data={data} orgName={orgName} userName={firstName} />
    </div>
  );
}
