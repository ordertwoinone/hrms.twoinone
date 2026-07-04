export interface DashboardExpiryAlert {
  name: string;
  entity: "visa" | "passport" | "insurance" | "contract" | "emirates_id" | "labour_card";
  daysUntil: number;
}

export interface DashboardLeaveItem {
  employeeName: string;
  leaveTypeName: string;
  endDate: string;
}

export interface DashboardBirthday {
  name: string;
  daysUntil: number;
}

export interface DashboardActivity {
  actorName: string;
  action: string;
  entity: string;
  createdAt: string;
}

export interface DashboardChartPoint {
  label: string;
  value: number;
}

export interface DashboardData {
  // KPI counters
  totalEmployees: number;
  onLeaveToday: number;
  newJoinersThisMonth: number;
  resignedThisMonth: number;

  // Expiry counters (30-day window)
  visaExpiring30d: number;
  passportExpiring30d: number;
  insuranceExpiring30d: number;
  contractsExpiring30d: number;
  emiratesIdExpiring30d: number;
  labourCardExpiring30d: number;

  // Distribution charts
  headcountTrend: DashboardChartPoint[];
  departmentDistribution: DashboardChartPoint[];
  nationalityDistribution: DashboardChartPoint[];
  genderDistribution: DashboardChartPoint[];

  // Lists
  expiryAlerts: DashboardExpiryAlert[];
  currentLeave: DashboardLeaveItem[];
  upcomingBirthdays: DashboardBirthday[];
  recentActivity: DashboardActivity[];

  // Payroll
  lastPayrollNet: number | null;
  lastPayrollMonth: string | null;
}
