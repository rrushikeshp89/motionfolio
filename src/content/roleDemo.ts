/**
 * Illustrative data for the Grove HRMS role-switch demo. Every person here is fictional and the
 * values are made up; the UI labels the table as illustrative. The rules mirror Grove's
 * own/team/company permission scopes in miniature, they are not Grove's real grant table.
 */
export const DEMO_ROLES = ["employee", "manager", "hr"] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

export const DEMO_ROLE_LABELS: Record<DemoRole, string> = {
  employee: "Employee",
  manager: "Manager",
  hr: "HR Admin",
};

export const DEMO_FIELDS = ["leave", "salary", "address"] as const;
export type DemoField = (typeof DEMO_FIELDS)[number];

export const DEMO_FIELD_LABELS: Record<DemoField, string> = {
  leave: "Leave left",
  salary: "Monthly salary",
  address: "Home address",
};

export interface DemoPerson {
  id: string;
  name: string;
  team: string;
  status: "active" | "offboarded";
  leave: string;
  salary: string;
  address: string;
}

export const DEMO_PEOPLE: readonly DemoPerson[] = [
  {
    id: "asha",
    name: "Asha Rao",
    team: "Platform",
    status: "active",
    leave: "12 days",
    salary: "₹1,10,000",
    address: "Indiranagar",
  },
  {
    id: "vikram",
    name: "Vikram Shah",
    team: "Platform",
    status: "active",
    leave: "8 days",
    salary: "₹1,85,000",
    address: "HSR Layout",
  },
  {
    id: "kabir",
    name: "Kabir Mehta",
    team: "Design",
    status: "active",
    leave: "15 days",
    salary: "₹95,000",
    address: "Jayanagar",
  },
  {
    id: "neha",
    name: "Neha Iyer",
    team: "People",
    status: "active",
    leave: "10 days",
    salary: "₹1,40,000",
    address: "Whitefield",
  },
  {
    id: "rohan",
    name: "Rohan Das",
    team: "Platform",
    status: "offboarded",
    leave: "0 days",
    salary: "₹1,02,000",
    address: "Koramangala",
  },
];

/** Who is looking in each role: an employee, their team's manager, and someone in HR. */
export const DEMO_VIEWER: Record<DemoRole, string> = {
  employee: "asha",
  manager: "vikram",
  hr: "neha",
};
