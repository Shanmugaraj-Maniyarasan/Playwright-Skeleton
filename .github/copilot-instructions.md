# Copilot instructions — Playwright BDD + MCP-driven automation

> Repository: `Shanmugaraj-Maniyarasan/Playwright-Skeleton`
> 
> Project root: `NewProjectSkeleton/`

## 1) Primary goal (what to generate)

When asked to create automation for an application page/flow, generate **Playwright + BDD** automation that supports an **MCP server–driven approach**:

1. **Page-wise field inventory extraction**
   - Read the application fields **page wise**.
   - For each field, record and store:
     - Field name / label
     - Mandatory vs non-mandatory
     - Editable vs non-editable
     - Locator strategy used (real DOM locator)
     - Field type (input/select/checkbox/radio/textarea/date/file upload, etc.)
   - Persist this inventory **per page** into a dedicated folder (see folder conventions below).

2. **Page-wise DOM snapshot extraction**
   - Read DOM elements and their current values **page wise**.
   - Store a structured representation per page (selectors + values + metadata).

3. **Accurate form filling (no fields left)**
   - Based on the stored inventory + DOM snapshot, generate automation that:
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
     - Read-only/non-editable fields should be asserted as non-editable

## 2) Framework constraints (MUST follow existing repo patterns)

- This repo uses **Playwright + BDD**.
- Follow the existing patterns in `NewProjectSkeleton/`:
  - Feature files in: `NewProjectSkeleton/features/`
  - Step definitions in: `NewProjectSkeleton/steps/`
  - Page Objects in: `NewProjectSkeleton/pages/`
  - Test data in Excel via utilities in: `NewProjectSkeleton/data-utils/`

### Do NOT

- Do **not** introduce new frameworks or restructure the project.
- Do **not** add unrelated utilities, wrappers, or alternative test runners.
- Do **not** add "demo" or sample code unless asked.

## 3) Locator standards (real elements only)

- Use **real, stable DOM locators**.
- Prefer (in order):
  1. `data-testid` / `data-test` / `data-qa` attributes if present
  2. Accessibility locators: `getByRole`, `getByLabel`, `getByPlaceholder`
  3. Stable IDs / name attributes
  4. Text locators only when text is stable and unique

Avoid brittle selectors:
- Avoid long CSS chains and nth-child.
- Avoid XPath unless the existing framework already uses it and it is unavoidable.

## 4) Code style expectations

- Use TypeScript.
- Match the **existing coding style** already present in the repository.
- Keep Page Objects focused on:
  - Locators
  - Actions
  - Simple assertions
- Keep Step Definitions focused on:
  - Calling page object methods
  - Using test data from Excel utilities
  - High-level flow orchestration

## 5) Test data requirements (Excel-driven)

- Test data must come from Excel (via existing utilities).
- Do not hardcode data in steps unless explicitly requested.
- Support multiple datasets/rows for scenario outlines where appropriate.

## 6) Folder & artifact conventions for MCP extraction outputs

When generating code that extracts and stores page-wise information, use a **dedicated folder** under the project root:

- `NewProjectSkeleton/mcp-artifacts/`
  - `field-inventory/<PageName>.json`
  - `dom-snapshots/<PageName>.json`

If the project already has an established folder for artifacts, follow that instead.

## 7) What to generate for a new page/flow

When a user asks to automate a page/flow, generate the following (unless the user explicitly asks for only one part):

1. **Feature file**
   - Positive scenario(s)
   - Negative scenario(s)
   - Clear Given/When/Then steps

2. **Step definition file**
   - Step implementations mapped to feature steps

3. **Page object**
   - Locators and action methods
   - Methods to:
     - Extract field inventory
     - Extract DOM snapshot
     - Fill all editable fields using provided data
     - Assert non-editable fields where required

4. **Test data guidance**
   - Clearly document which Excel sheet/columns are expected

## 8) Quality bar (professional automation)

- Implement robust waiting (expect-based) and avoid arbitrary timeouts.
- Add assertions for:
  - Page navigation
  - Key UI state changes
  - Validation messages for negative tests
- Keep scenarios readable and business-focused.

## 9) Clarifying questions Copilot SHOULD ask (if missing)

If the user request is ambiguous, ask for:
- Page name(s) and URL/path
- List of fields and expected behaviors (if known)
- Where Excel test data is stored (file name, sheet name)
- Authentication / preconditions
- Environments (QA/UAT) and credentials handling approach

---

If you follow these instructions, you will generate code that matches this repository’s existing Playwright BDD framework and supports MCP-driven, page-wise extraction + complete form filling with professional negative scenario coverage.
