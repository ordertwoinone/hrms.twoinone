export interface AuditLogItem {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  browser: string | null;
  device: string | null;
  userAgent: string | null;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export interface AuditFilters {
  action?: string;
  entity?: string;
  actorId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface AuditFilterOptions {
  entities: string[];
  actors: { id: string; name: string }[];
}
