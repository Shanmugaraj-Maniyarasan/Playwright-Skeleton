# Copilot instructions — Playwright-BDD (MSME) + MCP-driven automation

> Repository: `Shanmugaraj-Maniyarasan/Playwright-Skeleton`
>
> Project root: `NewProjectSkeleton/`

This repository follows **Page Object Model (POM) + Playwright-BDD steps + Excel-driven test data**.

Use this document as the single source of truth for how Copilot should generate new automation code in this repo.

---

## 1) Primary goal (what to generate)

When asked to automate an application page/flow, generate **Playwright + BDD** automation that supports an **MCP server–driven approach**:

1. **Page-wise field inventory extraction**
   - Read the application fields **page wise**.
   - For each field, record and store:
     - Field name / label
     - Mandatory vs non-mandatory
     - Editable vs non-editable
     - Locator strategy used (real DOM locator)
     - Field type (input/select/checkbox/radio/textarea/date/file upload, etc.)
   - Persist this inventory **per page**.

2. **Page-wise DOM snapshot extraction**
   - Read DOM elements and their current values **page wise**.
   - Store a structured representation per page (selectors + values + metadata).

3. **Accurate form filling (no fields left)**
   - Based on stored inventory + DOM snapshot, generate automation that:
     - Fills **all applicable editable fields** accurately.
     - Does **not** leave required fields empty.
     - Handles conditional fields (fields that appear based on earlier selections).
     - Handles validation messages and waits correctly.

4. **Professional negative coverage (human-like thinking)**
   - In addition to positive paths, generate negative scenarios such as:
     - Missing mandatory fields (one at a time and/or key combinations)
     - Invalid formats (email/phone/date/zip/etc.)
     - Boundary values (min/max length, min/max numeric)
     - Invalid selections (where possible)
     - Non-editable/read-only fields: assert they cannot be edited

---

## 2) High-level architecture (separation of responsibilities)

**Layers**

- **Pages (UI automation primitives + flows)**: `pages/**/**.page.ts`
  - Encapsulate locators and UI actions for a screen/section.
  - Expose “business actions” (e.g., `createProposal`, `fillBusinessUpdates`).
  - Keep raw selectors out of step definitions.

- **Steps (BDD glue, minimal logic)**: `steps/**/**.steps.ts`
  - Implement `Given/When/Then` using `playwright-bdd`.
  - Instantiate the page class.
  - Load test data (Excel) and call one page method.

- **Types (stronger contracts for complex data)**: `types/**/*.types.ts`
  - Define interfaces for data objects passed into page methods.

- **Data + Runtime context**
  - Excel test data files live under `test-data-excel/`.
  - Runtime state (captured values reused later) is stored under `test-data/runtime/`.

- **Scripts (test data maintenance)**: `scripts/**/*.js`
  - Node scripts update Excel fixtures using `xlsx`.

- **Outputs (generated artifacts)**
  - `playwright-report/`, `test-results/`, `reports/`, `temp-report/` are generated artifacts.

---

## 3) Directory conventions

Feature areas are grouped consistently and mirrored between `pages/` and `steps/`:

- `pages/login_homepage/` ↔ `steps/login_homepage/`
- `pages/application_flow/` ↔ `steps/application_flow/`
- `pages/proposal-data-entry/` ↔ `steps/proposal-data-entry/`

**Rule of thumb:** if you create `pages/<area>/x.page.ts`, create its step file as `steps/<area>/x.steps.ts`.

**Framework constraints (MUST follow existing patterns)**

- Follow the existing patterns in `NewProjectSkeleton/`:
  - Feature files: `NewProjectSkeleton/features/`
  - Step definitions: `NewProjectSkeleton/steps/`
  - Page Objects: `NewProjectSkeleton/pages/`
  - Data utils: `NewProjectSkeleton/data-utils/`
  - Types: `NewProjectSkeleton/types/`

### Do NOT

- Do **not** introduce new frameworks or restructure the project.
- Do **not** add unrelated utilities/wrappers or alternative test runners.
- Do **not** add sample/demo code unless asked.

---

## 4) Step-definition conventions (playwright-bdd)

All step definitions follow this shape:

- Imports:
  - `createBdd` from `playwright-bdd`
  - a Page Object from `pages/...`
  - `ExcelDataReader` from `data-utils/excel-data-reader` (used throughout step files)

- Create step functions:
  - `const { Given, When, Then } = createBdd();` (use only what you need)

- Keep steps thin:
  - Instantiate page object with `{ page }` fixture.
  - Load Excel file.
  - Read row by key.
  - Call a single page method.

**Expected step pattern** (use this structure):

```ts
import { createBdd } from 'playwright-bdd';
import { SomePage } from '../../pages/some-area/some.page';
import { ExcelDataReader } from '../../data-utils/excel-data-reader';

const { When } = createBdd();

const excelPath = 'test-data-excel/some-area.data.excel.xlsx';

When('User completes some action', async ({ page }) => {
  const somePage = new SomePage(page);

  ExcelDataReader.loadExcelFile(excelPath);
  const data = ExcelDataReader.getDataByKey('SomeSheet', 'dataKey', 'SomeRowKey');
  if (!data) throw new Error('SomeSheet data not found');

  await somePage.performAction(data);
});
```

---

## 5) Page Object conventions (`pages/**.page.ts`)

### 5.1 Class structure

- Export a class named after the screen/section, ending with `Page`.
- Store `page: Page`.
- Define all locators as `Locator` fields.
- Initialize locators in the constructor (single place for selectors).

**Typical structure**:

```ts
import { Locator, Page, expect } from '@playwright/test';

export class SomePage {
  page: Page;

  someLink: Locator;
  saveButton: Locator;
  toastMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.someLink = this.page.locator('a').filter({ hasText: 'Some Link' });
    this.saveButton = this.page.locator('[title="Save"]').first();
    this.toastMessage = this.page.locator('[role="alert"], .toast-message, .alert, .toast').first();
  }

  public async doSomething(data: any): Promise<void> {
    // ...
  }
}
```

### 5.2 Locator style (real elements)

Observed patterns across the repo:

- Prefer stable locators when available:
  - `page.locator('#someId')`
  - `page.getByRole('button', { name: 'Save' }).first()`
  - `page.locator('a').filter({ hasText: 'Business Updates' })`

- Use `.first()` / `.nth()` intentionally when multiple matches are expected.

- When the app is inconsistent, use selector fallbacks:

```ts
this.signUp = page
  .locator('button.login-btn[type="submit"], button:has-text("LOGIN"), #loginButton')
  .first();
```

Avoid brittle selectors:
- Avoid long CSS chains and `nth-child`.
- Avoid XPath unless the existing framework already uses it and it is unavoidable.

### 5.3 Action style (waits, fills, clicks)

Common action conventions:

- Wait before interacting:
  - `await locator.waitFor({ state: 'visible', timeout: 15000 });`
- Scroll when needed:
  - `await locator.scrollIntoViewIfNeeded();`
- Convert unknown data to string:
  - `await input.fill(String(value));`
- Use short `waitForTimeout(...)` only when necessary for UI transitions.
- Use `expect(...)` to validate visible/text content, especially after saves.

### 5.4 Validation and error handling (toast)

- A common pattern is:
  - wait for toast
  - read toast text
  - throw on error-like messages
  - expect success-like messages

```ts
await this.toastMessage.waitFor({ state: 'visible', timeout: 15000 });
const toastText = ((await this.toastMessage.textContent()) ?? '').trim();

if (/please enter|required|mandatory|error|failed|unable|invalid/i.test(toastText)) {
  throw new Error(`Save failed: ${toastText}`);
}

await expect(this.toastMessage).toContainText(/saved|updated|success|successfully|record/i);
```

- Optional operations may use `.catch(() => {})` for non-critical UI actions (e.g., optional `Tab`).

### 5.5 Helpers inside Pages

For repeated UI patterns, create private helpers in the page object:

- `safeSelect(...)`: select by value then by label
- `fillAndVerifyInput(...)`: fill, blur, and force input events if the UI rejects normal typing
- date picker helpers: `pickYearMonthDate`, `pickDateByPrevClicks`, etc.

Guideline: keep helpers **private** unless reused across multiple pages (then consider a shared utility in `utils/`).

---

## 6) Test data conventions (Excel)

- Each Excel file is referenced by a repo-relative path, e.g.:
  - `test-data-excel/login.data.excel.xlsx`
  - `test-data-excel/proposal.data.excel.xlsx`
  - `test-data-excel/proposal-data-entry.data.excel.xlsx`

- Rows are retrieved by a **key column** and **key value**, commonly:
  - sheet: `'LoginData'`, `'ProposalCreation'`, `'BusinessUpdates'`, etc.
  - key column: `'dataKey'`
  - key value: stable identifier like `'config'`, `'maker'`, `'ProposalCreation'`

- For complex objects, define interfaces under `types/` and type page methods accordingly.

---

## 7) Runtime state conventions

The repo stores reusable values under:

- `test-data/runtime/application-context.json`

Usage pattern:

- Page extracts an identifier from a toast.
- Persist it to runtime store (helper expected at `data-utils/runtime-application-store`).
- Later steps/pages read it back when needed.

---

## 8) Logging conventions

- Page methods may log progress with `console.log(...)`.
- Use short, action-oriented messages (e.g., “Navigating…”, “Clicking Save…”, “Validating toaster…”).
- If emojis are used in an existing file, keep consistency within that file.

---

## 9) MCP extraction artifacts (where/how to store)

When generating code that extracts and stores page-wise information, use a dedicated folder under the project root:

- `NewProjectSkeleton/mcp-artifacts/`
  - `field-inventory/<PageName>.json`
  - `dom-snapshots/<PageName>.json`

If the project already has an established folder for artifacts, follow that instead.

---

## 10) Adding a new flow (checklist)

When you add a new screen/feature:

1. Create a Page Object under `pages/<area>/...page.ts`
   - Define `page: Page` + `Locator` fields
   - Initialize locators in the constructor
   - Add one public method per “business action”

2. Create a Step file under `steps/<area>/...steps.ts`
   - Use `createBdd()`
   - Load Excel and read data by key
   - Call the Page Object method

3. (Optional) Add `types/xxx.types.ts` for the data contract

4. Add/extend an Excel sheet and ensure the `dataKey` used in steps exists

5. If the flow creates reusable IDs, persist them in runtime context

---

## 11) Clarifying questions Copilot SHOULD ask (if missing)

If the request is ambiguous, ask for:

- Page name(s) and URL/path
- List of fields and expected behaviors (if known)
- Excel test data file name + sheet name + `dataKey` to use
- Authentication / preconditions
- Environments (QA/UAT) and credentials handling approach

---

## 12) Notes / known gaps

Some step/page imports may reference helpers not present in all workspace snapshots (e.g., `data-utils/excel-data-reader`, `data-utils/runtime-application-store`).

- If such utilities are missing in your local clone, ensure they are included (or re-created) because step/page code assumes them.
