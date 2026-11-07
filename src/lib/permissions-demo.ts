import {
  DEMO_FIELDS,
  DEMO_VIEWER,
  type DemoField,
  type DemoPerson,
  type DemoRole,
} from "@/content/roleDemo";

/** How far a role's access reaches for one field, in the spirit of Grove's own/team/company scopes. */
type Scope = "own" | "team" | "all";

const FIELD_SCOPES: Record<DemoRole, Record<DemoField, Scope>> = {
  employee: { leave: "own", salary: "own", address: "own" },
  manager: { leave: "team", salary: "own", address: "own" },
  hr: { leave: "all", salary: "all", address: "all" },
};

export type DemoCell = { visible: true; value: string } | { visible: false };

function findViewer(role: DemoRole, people: readonly DemoPerson[]): DemoPerson {
  const viewer = people.find((person) => person.id === DEMO_VIEWER[role]);
  if (!viewer) throw new Error(`No demo viewer for role ${role}`);
  return viewer;
}

function inScope(scope: Scope, viewer: DemoPerson, person: DemoPerson): boolean {
  if (scope === "all") return true;
  if (scope === "team") return person.team === viewer.team;
  return person.id === viewer.id;
}

/** Offboarded records are visible to HR only; everyone sees the active directory. */
export function visiblePeople(role: DemoRole, people: readonly DemoPerson[]): DemoPerson[] {
  return people.filter((person) => person.status === "active" || role === "hr");
}

export function cellFor(
  role: DemoRole,
  person: DemoPerson,
  field: DemoField,
  people: readonly DemoPerson[],
): DemoCell {
  const viewer = findViewer(role, people);
  return inScope(FIELD_SCOPES[role][field], viewer, person)
    ? { visible: true, value: person[field] }
    : { visible: false };
}

export function isViewer(role: DemoRole, person: DemoPerson): boolean {
  return DEMO_VIEWER[role] === person.id;
}

export interface DemoSummary {
  shownPeople: number;
  totalPeople: number;
  restrictedCells: number;
}

export function summarise(role: DemoRole, people: readonly DemoPerson[]): DemoSummary {
  const shown = visiblePeople(role, people);
  const restrictedCells = shown
    .flatMap((person) => DEMO_FIELDS.map((field) => cellFor(role, person, field, people)))
    .filter((cell) => !cell.visible).length;
  return { shownPeople: shown.length, totalPeople: people.length, restrictedCells };
}
