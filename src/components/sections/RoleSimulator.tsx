"use client";

import { useId, useState, type CSSProperties } from "react";
import {
  DEMO_FIELD_LABELS,
  DEMO_FIELDS,
  DEMO_PEOPLE,
  DEMO_ROLE_LABELS,
  DEMO_ROLES,
  type DemoRole,
} from "@/content/roleDemo";
import { cellFor, isViewer, summarise, visiblePeople } from "@/lib/permissions-demo";

/**
 * Grove HRMS in miniature. Pick a role and the sample directory shows only what that role may see:
 * restricted cells flip to a stamp, and the offboarded record slides in for HR. CSS keyframes on
 * remount (keyed by value), so the animation costs no JavaScript.
 * A native radio group, a real table and a status line, so it works the same without motion.
 */
export function RoleSimulator({ liveDemoHref }: { liveDemoHref: string }) {
  const [role, setRole] = useState<DemoRole>("employee");
  const groupName = useId();
  const people = visiblePeople(role, DEMO_PEOPLE);
  const summary = summarise(role, DEMO_PEOPLE);
  const roleLabel = DEMO_ROLE_LABELS[role];
  const roleIndex = DEMO_ROLES.indexOf(role);

  return (
    <div className="rounded-[var(--radius-card)] border-2 border-ink/80 bg-surface-alt p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="label flex items-center gap-2 text-ink">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          Directory RBAC simulator
        </p>
        <span className="label rounded-full border border-success/30 bg-card px-2 py-0.5 text-success">
          Enforced on the server
        </span>
      </div>

      <fieldset className="mt-4">
        <legend className="sr-only">View the directory as</legend>
        <div className="relative grid grid-cols-3 gap-1.5">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[calc((100%-0.75rem)/3)] rounded-lg bg-ink transition-transform duration-300 ease-[var(--ease-spring)]"
            style={
              { transform: `translateX(calc(${roleIndex} * (100% + 0.375rem)))` } as CSSProperties
            }
          />
          {DEMO_ROLES.map((option) => {
            const checked = role === option;
            return (
              <label key={option} className="relative">
                <input
                  type="radio"
                  name={groupName}
                  value={option}
                  checked={checked}
                  onChange={() => setRole(option)}
                  className="peer sr-only"
                />
                <span
                  className={`label relative flex min-h-11 cursor-pointer items-center justify-center rounded-lg border-2 px-1 text-center transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-strong ${checked ? "border-ink text-on-ink" : "border-ink/25 bg-card/80 text-ink hover:border-ink"}`}
                >
                  {DEMO_ROLE_LABELS[option]}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div
        role="region"
        aria-label={`Sample directory as seen by ${roleLabel}`}
        tabIndex={0}
        className="mt-4 overflow-x-auto rounded-lg border border-ink/15 bg-card"
      >
        <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Sample directory as seen by {roleLabel}. Illustrative data.
          </caption>
          <thead>
            <tr className="border-b border-ink/15">
              <th scope="col" className="label px-3 py-2.5 text-ink-muted">
                Person
              </th>
              {DEMO_FIELDS.map((field) => (
                <th key={field} scope="col" className="label px-3 py-2.5 text-ink-muted">
                  {DEMO_FIELD_LABELS[field]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="animate-row-in border-b border-ink/10 last:border-0">
                <th scope="row" className="px-3 py-2.5 font-semibold whitespace-nowrap">
                  {person.name}
                  {isViewer(role, person) ? (
                    <span className="ml-1.5 font-normal text-ink-muted">(you)</span>
                  ) : null}
                  {person.status === "offboarded" ? (
                    <span className="ml-1.5 font-normal text-ink-muted">(offboarded)</span>
                  ) : null}
                </th>
                {DEMO_FIELDS.map((field) => {
                  const cell = cellFor(role, person, field, DEMO_PEOPLE);
                  return (
                    <td key={field} className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        key={cell.visible ? `v-${cell.value}` : "restricted"}
                        className="inline-block animate-flip-in"
                      >
                        {cell.visible ? (
                          <span className="font-mono text-xs">{cell.value}</span>
                        ) : (
                          <span className="label inline-flex items-center gap-1 rounded bg-accent-soft px-1.5 py-0.5 text-accent-strong">
                            <LockIcon />
                            Restricted
                          </span>
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p role="status" className="label mt-3 text-center font-normal text-ink-muted">
        As {roleLabel}: {summary.shownPeople} of {summary.totalPeople} people shown,{" "}
        {summary.restrictedCells === 0
          ? "nothing restricted"
          : `${summary.restrictedCells} fields restricted on the server`}
        .
      </p>
      <p className="mt-2 text-center text-xs text-ink-muted">
        Illustrative data with made-up people.{" "}
        <a
          href={liveDemoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-strong underline underline-offset-2"
        >
          Try the real permissions in the live demo
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </p>
    </div>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" className="size-3" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
