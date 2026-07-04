import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Shared shell for a profile section: title, optional action, and content. */
export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** A labelled definition-list grid used across read-only sections. */
export function FieldGrid({
  fields,
}: {
  fields: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((f) => (
        <div key={f.label} className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
            {f.label}
          </dt>
          <dd className="text-sm">{f.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
