import { DEMO_PEOPLE, type DemoPerson } from "@/content/roleDemo";
import { cellFor, isViewer, summarise, visiblePeople } from "@/lib/permissions-demo";

function person(id: string): DemoPerson {
  const found = DEMO_PEOPLE.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`fixture missing ${id}`);
  return found;
}

const visible = (cell: ReturnType<typeof cellFor>) => cell.visible;

describe("role-switch demo rules", () => {
  it("hides offboarded people from everyone except HR", () => {
    expect(visiblePeople("employee", DEMO_PEOPLE).map((p) => p.id)).not.toContain("rohan");
    expect(visiblePeople("manager", DEMO_PEOPLE).map((p) => p.id)).not.toContain("rohan");
    expect(visiblePeople("hr", DEMO_PEOPLE).map((p) => p.id)).toContain("rohan");
  });

  it("lets an employee see only their own private fields", () => {
    for (const field of ["leave", "salary", "address"] as const) {
      expect(visible(cellFor("employee", person("asha"), field, DEMO_PEOPLE))).toBe(true);
      expect(visible(cellFor("employee", person("vikram"), field, DEMO_PEOPLE))).toBe(false);
    }
  });

  it("lets a manager see their team's leave but not their team's salary", () => {
    expect(visible(cellFor("manager", person("asha"), "leave", DEMO_PEOPLE))).toBe(true);
    expect(visible(cellFor("manager", person("kabir"), "leave", DEMO_PEOPLE))).toBe(false);
    expect(visible(cellFor("manager", person("asha"), "salary", DEMO_PEOPLE))).toBe(false);
    expect(visible(cellFor("manager", person("vikram"), "salary", DEMO_PEOPLE))).toBe(true);
  });

  it("lets HR see every field of every person", () => {
    for (const someone of DEMO_PEOPLE) {
      for (const field of ["leave", "salary", "address"] as const) {
        expect(visible(cellFor("hr", someone, field, DEMO_PEOPLE))).toBe(true);
      }
    }
  });

  it("never returns a value for a restricted cell", () => {
    const cell = cellFor("employee", person("neha"), "salary", DEMO_PEOPLE);
    expect(cell).toEqual({ visible: false });
  });

  it("marks who is looking", () => {
    expect(isViewer("employee", person("asha"))).toBe(true);
    expect(isViewer("manager", person("asha"))).toBe(false);
  });

  it("summarises what each role can see", () => {
    expect(summarise("employee", DEMO_PEOPLE)).toEqual({
      shownPeople: 4,
      totalPeople: 5,
      restrictedCells: 9,
    });
    expect(summarise("manager", DEMO_PEOPLE)).toEqual({
      shownPeople: 4,
      totalPeople: 5,
      restrictedCells: 8,
    });
    expect(summarise("hr", DEMO_PEOPLE)).toEqual({
      shownPeople: 5,
      totalPeople: 5,
      restrictedCells: 0,
    });
  });
});
