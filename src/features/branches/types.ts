import type { Database } from "@/types/database.types";

export type Branch = Database["public"]["Tables"]["branches"]["Row"];

export type BranchStatus = "active" | "inactive";

/** A row in the branches list (manager resolved to a name). */
export interface BranchListItem {
  id: string;
  name: string;
  code: string;
  addressLine: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  managerId: string | null;
  managerName: string | null;
  status: BranchStatus;
  createdAt: string;
}

/** Option for the manager select. */
export interface ManagerOption {
  id: string;
  name: string;
}
