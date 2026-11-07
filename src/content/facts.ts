import { factsSchema, type FactsInput } from "./schema";

/**
 * Single source of truth for everything the site says. Parsed at module load, so an invalid
 * entry fails `next build`. Unknown facts use TODO_CONFIRM; never fill a gap with a guess.
 */
const GITHUB = "https://github.com/rrushikeshp89";
const GROVE_REPO = `${GITHUB}/grove-hrms`;
const LEADHUB_REPO = `${GITHUB}/leadhub-crm`;
const STOCKROOM_REPO = `${GITHUB}/stockroom-erp`;
const blob = (repo: string, path: string) => `${repo}/blob/main/${path}`;
const tree = (repo: string, path: string) => `${repo}/tree/main/${path}`;

export const rawFacts = {
  site: {
    url: "https://rrushikeshp89.github.io",
    source: `${GITHUB}/rrushikeshp89.github.io`,
  },
  identity: {
    name: "Rushikesh Panchal",
    role: "Software Developer",
    location: "Bengaluru, India",
    email: "rrushikeshp8@gmail.com",
    linkedin: "https://www.linkedin.com/in/rushikesh-panchal/",
    github: GITHUB,
    headline: "Software developer building reliable full-stack TypeScript systems.",
    headlineEmphasis: "full-stack TypeScript",
    subline:
      "Next.js, Node.js and PostgreSQL, with server-side access control, transactional data integrity and end-to-end tests.",
    availability: "Based in Bengaluru, open to Software Developer roles.",
    objective:
      "Software Developer and recent B.Tech CSE (Data Science) graduate building full-stack TypeScript applications with Next.js, React, Node.js, and PostgreSQL, featuring server-side access control, transactional data integrity, and end-to-end testing. Seeking a Software Developer role to design, test, and ship reliable, production-ready code.",
    resume: "/resume.pdf",
  },
  approach: {
    principles: [
      {
        title: "Show the why.",
        detail:
          "Scores and decisions come with their reasons: SHAP reasons for every readmission score, weighted factors in résumé matching.",
      },
      {
        title: "Enforce it on the server.",
        detail:
          "Permissions are checked where the data is written, so hiding a button is never the only safeguard.",
      },
      {
        title: "Prove it, then say what’s missing.",
        detail:
          "Claims ship with tests (unit, end-to-end, axe), and every project states what it does not do yet.",
      },
    ],
    writePath: {
      caption: "Every write in Grove HRMS takes this path.",
      steps: [
        "Interface",
        "Server action",
        "Permission check",
        "Zod validation",
        "Transaction",
        "Audit log",
        "PostgreSQL",
      ],
    },
  },
  projects: [
    {
      slug: "grove-hrms",
      name: "Grove HRMS",
      pitch:
        "A full-stack HR management system with server-side role-based access and a single audited, transactional write path.",
      stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS", "Playwright"],
      bullets: [
        "Full-stack HRMS on Next.js 16 and Supabase Postgres with a 45-table Prisma schema (people, attendance, leave, payroll, recruitment) and a seeded 100-employee demo company.",
        "Server-side RBAC across 4 roles and 28 own/team/company-scoped permissions; every write goes through one Zod-validated, transactional, audit-logged action layer.",
        "Employee directory, permission-aware profiles, and an interactive org chart on a custom WCAG AA design system, covered by 130+ Vitest and Playwright/axe tests.",
      ],
      links: [
        { kind: "source", href: GROVE_REPO },
        { kind: "live", href: "https://hrms.fluentopsai.com" },
      ],
      metrics: [
        {
          id: "grove-tables",
          display: "45",
          countTo: 45,
          label: "tables",
          receipt: {
            explanation:
              "The Prisma schema defines 45 models covering people, attendance, leave, payroll and recruitment.",
            proof: {
              kind: "repo",
              href: blob(GROVE_REPO, "prisma/schema.prisma"),
              label: "prisma/schema.prisma in Grove HRMS",
            },
          },
        },
        {
          id: "grove-permissions",
          display: "28",
          countTo: 28,
          label: "scoped permissions",
          receipt: {
            explanation:
              "28 permissions, each scoped to own, team or company records, checked on the server across 4 roles.",
            proof: {
              kind: "repo",
              href: blob(GROVE_REPO, "src/lib/rbac.ts"),
              label: "src/lib/rbac.ts in Grove HRMS",
            },
          },
        },
        {
          id: "grove-tests",
          display: "130+",
          countTo: 130,
          label: "tests",
          receipt: {
            explanation:
              "More than 130 Vitest unit tests and Playwright end-to-end tests, including axe accessibility scans.",
            proof: {
              kind: "tests",
              href: tree(GROVE_REPO, "tests/e2e"),
              label: "Playwright suites in Grove HRMS (tests/e2e)",
            },
          },
        },
        {
          id: "grove-demo-employees",
          display: "100",
          countTo: 100,
          label: "seeded demo employees",
          receipt: {
            explanation: "The live demo runs on a seeded company of 100 employees.",
            proof: {
              kind: "live",
              href: "https://hrms.fluentopsai.com",
              label: "Grove HRMS live demo",
            },
          },
        },
      ],
      limitations: [
        "Payroll is simulated and says so on every screen; it is not for running real payroll.",
        "Email is not sent: password-reset messages are queued in a table, and a real deployment needs a mail provider.",
        "The demo is shared: everyone uses the same four accounts and company, and it resets every night at 02:00 IST.",
        "Signed-in pages are slower on weak phones, because they wait for the session and live data.",
      ],
      caseStudy: {
        problem:
          "Grove is a complete HR platform for a company of about 100 people, from clocking in to running payroll, with separate experiences for employees, managers, HR and admins. The hard part is trust: each person may see and change only what their role and scope allow, and every change has to leave a record.",
        diagram: {
          title: "How a change moves through Grove HRMS",
          description:
            "The browser submits a form to a Next.js server action. createAction authenticates the session, validates with Zod and checks role, scope and record. The change, its audit entries and its notifications are written in one Postgres transaction that commits or rolls back together.",
          layers: [
            { label: "Browser", items: ["React 19 forms (React Hook Form)"] },
            {
              label: "Next.js 16 on Vercel",
              items: [
                "proxy.ts: cookie redirects only",
                "Server components: pages and queries",
                "Server actions: createAction",
                "Route handlers: CSV, PDF, files, cron",
              ],
            },
            {
              label: "createAction, every time",
              items: [
                "Authenticate the session",
                "Validate with Zod",
                "Check role, scope and record",
              ],
            },
            {
              label: "One Postgres transaction",
              items: ["The change", "Audit entries", "Notifications"],
            },
            {
              label: "Supabase",
              items: [
                "Postgres via Prisma 7, row level security with no policies",
                "Private storage bucket",
              ],
            },
          ],
        },
        decisions: [
          {
            title: "The database has one door.",
            detail:
              "Every table has row level security on with no policies, so Supabase’s public API cannot reach it. Only the server connects, and it checks permissions in code.",
          },
          {
            title: "Every check is on the server.",
            detail:
              "The proxy only redirects people without a session cookie. Pages, actions and route handlers each call requireUser or requirePermission, and queries filter by what the person may see.",
          },
          {
            title: "One way to change data.",
            detail:
              "createAction runs the same steps every time, and a change, its audit entries and its notifications commit together or not at all.",
          },
          {
            title: "Business rules are plain functions.",
            detail:
              "Leave balances, payroll, review visibility, CSV checks and reminders are pure, unit-tested functions shared by the UI previews and the server.",
          },
        ],
        proof: [
          {
            claim: "Roles, scopes and permissions",
            label: "src/lib/rbac.ts",
            href: blob(GROVE_REPO, "src/lib/rbac.ts"),
          },
          {
            claim: "The single path for every mutation",
            label: "src/server/action.ts",
            href: blob(GROVE_REPO, "src/server/action.ts"),
          },
          {
            claim: "The 45-table data model",
            label: "prisma/schema.prisma",
            href: blob(GROVE_REPO, "prisma/schema.prisma"),
          },
          {
            claim: "Every-screen accessibility sweep",
            label: "tests/e2e/sweep.spec.ts",
            href: blob(GROVE_REPO, "tests/e2e/sweep.spec.ts"),
          },
          {
            claim: "Typecheck, lint, unit and Playwright on every push",
            label: ".github/workflows/ci.yml",
            href: blob(GROVE_REPO, ".github/workflows/ci.yml"),
          },
        ],
      },
    },
    {
      slug: "leadhub-crm",
      name: "LeadHub CRM",
      pitch:
        "A B2B sales CRM whose pipeline and lead-scoring rules live in one TypeScript domain layer shared by client and server.",
      stack: ["TypeScript", "React", "Node.js", "Express", "SQLite (Turso / libSQL)", "Docker"],
      bullets: [
        "Full-stack B2B sales CRM with a shared TypeScript domain layer (Zod schemas, business rules) reused by client and server: one source of truth for pipeline and lead-scoring logic.",
        "Secure Express 5 REST API over SQLite via Turso (libSQL) with versioned migrations, foreign-key integrity, session auth, RBAC, and rate limiting.",
        "Shipped as a Docker image on Render with a Turso database: health checks, point-in-time restore, and GitHub Actions CI running type checks, end-to-end API tests and a container smoke test.",
      ],
      links: [
        { kind: "source", href: LEADHUB_REPO },
        { kind: "live", href: "https://crm.fluentopsai.com/inquiry" },
      ],
      metrics: [],
      limitations: [
        "It does not send email, calendar invites or push notifications yet; reminders stay in the app.",
        "Proposal documents are not generated, and their views are not tracked.",
        "There is no CSV import or export, and one installation serves one organisation.",
        "The live CRM holds a real team’s data, so sign-in is by invitation; the public inquiry form is open to try.",
      ],
      caseStudy: {
        problem:
          "LeadHub is a sales CRM for teams that sell custom software, AI solutions and technology consulting: capture leads, qualify them, run the pipeline, send proposals and close deals in one place. Pipeline value, win rate and lead scores have to give the same answer on the dashboard and on the server.",
        diagram: {
          title: "How LeadHub is put together",
          description:
            "The React app and the Express 5 server both import one shared TypeScript layer of domain model, calculations and Zod schemas. The server adds sessions, roles, security headers and business rules, and stores data in SQLite through libSQL with versioned migrations and foreign keys.",
          layers: [
            {
              label: "Browser",
              items: ["React app, screens loaded on demand", "Public inquiry form"],
            },
            {
              label: "shared/, used by client and server",
              items: [
                "model.ts: stages and statuses",
                "calc.ts: weighted pipeline, win rate, scoring",
                "schemas.ts: Zod schema for every write",
              ],
            },
            {
              label: "Express 5 server",
              items: [
                "Sessions, scrypt hashing and roles",
                "CSP, headers and rate limits",
                "Business rules, activity log, duplicate checks",
              ],
            },
            {
              label: "SQLite via Turso (libSQL)",
              items: ["Versioned, append-only migrations", "Foreign keys guard deletes"],
            },
          ],
        },
        decisions: [
          {
            title: "One source of truth for the rules.",
            detail:
              "Every calculation lives in shared/calc.ts and every write’s validation in shared/schemas.ts, so the dashboard and the server always agree: the server enforces the schemas, the client shows the same field errors.",
          },
          {
            title: "The database refuses bad deletes.",
            detail:
              "A company cannot be deleted while it has leads, opportunities or invoices, and a lead’s primary contact cannot be deleted. The server also rejects a lead whose contact belongs to a different company.",
          },
          {
            title: "Migrations only move forward.",
            detail:
              "Schema changes are appended to a list in server/db.ts, and each runs once, inside a transaction.",
          },
          {
            title: "Status follows the work.",
            detail:
              "Logging the first call moves a lead to Contacted and booking discovery moves it to Discovery Scheduled; leads only move forward, and every change is written to the record’s timeline.",
          },
        ],
        proof: [
          {
            claim: "Weighted pipeline, win rate and qualification score",
            label: "shared/calc.ts",
            href: blob(LEADHUB_REPO, "shared/calc.ts"),
          },
          {
            claim: "Zod schemas shared by client and server",
            label: "shared/schemas.ts",
            href: blob(LEADHUB_REPO, "shared/schemas.ts"),
          },
          {
            claim: "Versioned migrations and transactions",
            label: "server/db.ts",
            href: blob(LEADHUB_REPO, "server/db.ts"),
          },
          {
            claim: "End-to-end API tests: lifecycle, permissions, concurrent writes",
            label: "tests/api.test.ts",
            href: blob(LEADHUB_REPO, "tests/api.test.ts"),
          },
          {
            claim: "CI: type checks, tests, build and a Docker smoke test",
            label: ".github/workflows/ci.yml",
            href: blob(LEADHUB_REPO, ".github/workflows/ci.yml"),
          },
        ],
      },
    },
    {
      slug: "stockroom-erp",
      name: "Stockroom: Inventory & Purchase Order ERP",
      pitch:
        "An inventory and purchase-order ERP where receiving is atomic and stock history is append-only, enforced by the database.",
      stack: ["TypeScript", "React", "Node.js", "Express", "SQLite"],
      bullets: [
        "Inventory ERP with a four-stage purchase-order workflow and four-layer RBAC across 3 roles and 20 permissions.",
        "Atomic order receiving and append-only stock history enforced by database triggers.",
        "Headless-Chrome UX audit tool: layout shift cut from 0.495 to 0.004; 956 undersized tap targets fixed.",
      ],
      links: [
        { kind: "source", href: STOCKROOM_REPO },
        { kind: "live", href: "https://erp.fluentopsai.com" },
      ],
      metrics: [
        {
          id: "stockroom-permissions",
          display: "20",
          countTo: 20,
          label: "permissions across 3 roles",
          receipt: {
            explanation:
              "Four-layer RBAC: 20 permissions assigned across 3 roles (admin, manager, staff).",
            proof: {
              kind: "repo",
              href: blob(STOCKROOM_REPO, "server/src/rbac.js"),
              label: "server/src/rbac.js in Stockroom",
            },
          },
        },
        {
          id: "stockroom-cls",
          display: "0.495 → 0.004",
          label: "cumulative layout shift",
          receipt: {
            explanation:
              "A headless-Chrome audit measured layout shift on every page and interaction: the worst case was 0.495 before the fixes and 0.004 after.",
            proof: {
              kind: "repo",
              href: blob(STOCKROOM_REPO, "docs/ux/REPORT.md"),
              label: "UX audit report in Stockroom (docs/ux/REPORT.md)",
            },
          },
        },
        {
          id: "stockroom-tap-targets",
          display: "956",
          countTo: 956,
          label: "undersized tap targets fixed",
          receipt: {
            explanation:
              "At 390 px and narrower, the same audit found 956 controls smaller than 44 px; after the fixes there were none.",
            proof: {
              kind: "repo",
              href: blob(STOCKROOM_REPO, "docs/ux/REPORT.md"),
              label: "UX audit report in Stockroom (docs/ux/REPORT.md)",
            },
          },
        },
      ],
      limitations: [
        "The demo runs on a free plan: after it has been idle the first visit takes about 30 seconds, and its data resets whenever the service restarts.",
        "It is one Node process with SQLite running in-process, with no separate database server.",
      ],
      caseStudy: {
        problem:
          "A small shop or café sits between two mistakes: order too much and cash sits on shelves, order too little and sales are lost. Stockroom tracks stock, suppliers and orders and suggests what to reorder. The stock count must never drift, even when two people receive the same delivery at once.",
        diagram: {
          title: "How Stockroom handles a request",
          description:
            "The React app sends JSON with a bearer token to the Express 5 API, which validates it with Zod and checks the RBAC policy before calling a service. Services write to SQLite inside BEGIN IMMEDIATE and COMMIT, and database triggers maintain stock history and the purchase-order state machine.",
          layers: [
            { label: "Browser", items: ["React 18 and TypeScript"] },
            { label: "Express 5 API", items: ["Bearer JWT", "Zod validation"] },
            {
              label: "RBAC policy (rbac.js)",
              items: ["Route permissions", "Row scope", "Per-record policy", "Field masking"],
            },
            { label: "Services", items: ["Inventory", "Purchase orders", "Dashboard"] },
            {
              label: "SQLite (node:sqlite)",
              items: ["BEGIN IMMEDIATE … COMMIT", "Triggers: stock history, order state machine"],
            },
          ],
        },
        decisions: [
          {
            title: "Receiving is atomic.",
            detail:
              "Receiving sets the status only where it is still ordered; zero rows matched means it was already received, so the request returns 409 and rolls back. A double click or two receivers cannot add stock twice.",
          },
          {
            title: "Stock only changes through history.",
            detail:
              "A trigger rejects direct edits to a product’s stock, history rows cannot be edited or deleted, and a CHECK constraint aborts anything that would take stock below zero.",
          },
          {
            title: "The order lifecycle lives in the database.",
            detail:
              "Draft, awaiting approval, ordered, received and cancelled transitions are enforced by a trigger, not just by the app, and received or cancelled orders are frozen.",
          },
          {
            title: "Four layers of access control on the server.",
            detail:
              "Route permissions, row-level scope, per-record policy with separation of duties (a manager cannot approve their own order) and field masking that strips costs from staff responses. The browser only hides buttons and is never trusted.",
          },
        ],
        proof: [
          {
            claim: "Roles, permissions and the four layers",
            label: "server/src/rbac.js",
            href: blob(STOCKROOM_REPO, "server/src/rbac.js"),
          },
          {
            claim: "Triggers and constraints that guard stock",
            label: "server/src/schema.sql",
            href: blob(STOCKROOM_REPO, "server/src/schema.sql"),
          },
          {
            claim: "Data-integrity tests",
            label: "server/test/integrity.test.js",
            href: blob(STOCKROOM_REPO, "server/test/integrity.test.js"),
          },
          {
            claim: "Headless-Chrome UX audit: 175 runs, CLS and tap targets",
            label: "docs/ux/REPORT.md",
            href: blob(STOCKROOM_REPO, "docs/ux/REPORT.md"),
          },
        ],
      },
    },
  ],
  secondaryProjects: [
    {
      name: "Tessaract",
      summary: "Explainable résumé-to-job matching with deterministic weighted scoring.",
      links: [{ kind: "source", href: `${GITHUB}/Tessaract` }],
    },
    {
      name: "StrategyRoom.ai",
      summary: "Two-agent investment research with a reasoning chain and citations.",
      links: [{ kind: "source", href: `${GITHUB}/StrategyRoom.ai` }],
    },
    {
      name: "Readmission Shield",
      summary: "30-day readmission risk for diabetic patients, with SHAP reasons for every score.",
      links: [
        { kind: "source", href: `${GITHUB}/Hospital-Readmission-Shield-Diabetes` },
        {
          kind: "live",
          href: "https://hospital-readmission-shield-diabetes-mxh3cfy4tg5movmukaphtm.streamlit.app/",
        },
      ],
    },
  ],
  experience: [
    {
      role: "Data Science Intern",
      organization: "Zetpeak",
      start: "2025-10",
      end: "2026-01",
      location: "Bengaluru",
      workMode: "On-site",
      highlights: [
        "Automated data-quality validation scripts in Python and SQL for ingestion pipelines, backed by automated tests, reducing ingestion-level errors by 15% and improving the reliability of downstream ML applications.",
        "Built statistical models (multivariate regression, K-means with Scikit-Learn) to surface hidden patterns in corporate datasets.",
        "Documented findings and translated them into business insights.",
      ],
      metrics: [
        {
          id: "zetpeak-errors",
          display: "15%",
          countTo: 15,
          label: "fewer ingestion-level errors",
          receipt: {
            explanation:
              "Automated, tested data-quality checks on the ingestion pipelines reduced ingestion-level errors by 15%.",
            proof: { kind: "resume", label: "Résumé, Zetpeak internship" },
          },
        },
      ],
    },
    {
      role: "Business Analytics Intern",
      organization: "Maincrafts Technology",
      start: "2026-01",
      end: "2026-04",
      location: "Remote",
      workMode: "Remote",
      highlights: [
        "Built interactive Power BI dashboards (DAX, Power Query) for business KPIs.",
        "Analysed data in Excel with pivot tables and XLOOKUP.",
        "Modelled table relationships and slicers so stakeholders can self-serve.",
      ],
      metrics: [],
    },
  ],
  education: [
    {
      degree: "B.Tech",
      field: "Computer Science Engineering (Data Science)",
      institution: "Garden City University",
      location: "Bengaluru",
      graduation: "2026-07",
      cgpa: { value: 8.53, scale: 10 },
    },
  ],
  certifications: [
    "Google Gen AI Academy",
    "McKinsey Forward Program",
    "Google Data Analytics Professional Certificate",
  ],
  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML/CSS"] },
    {
      group: "Frontend",
      items: [
        "React",
        "Next.js (App Router)",
        "Tailwind CSS",
        "Radix UI",
        "React Hook Form",
        "React Router",
        "Vite",
      ],
    },
    {
      group: "Backend",
      items: [
        "Node.js",
        "Express.js",
        "Next.js Server Actions",
        "REST API design",
        "Zod",
        "Better Auth",
        "JWT",
        "bcrypt",
      ],
    },
    {
      group: "Databases",
      items: [
        "PostgreSQL (Supabase)",
        "SQLite",
        "Prisma ORM",
        "Migrations",
        "Transactions and triggers",
      ],
    },
    {
      group: "Security",
      items: [
        "Role-Based Access Control",
        "Session authentication",
        "Audit logging",
        "Rate limiting",
      ],
    },
    {
      group: "DevOps & tools",
      items: [
        "Docker",
        "GitHub Actions (CI)",
        "Railway",
        "Git",
        "GitHub",
        "Scikit-Learn",
        "Power BI",
        "Excel",
      ],
    },
  ],
} satisfies FactsInput;

export const facts = factsSchema.parse(rawFacts);
