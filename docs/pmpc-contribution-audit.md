# PMPC contribution copy audit

Reviewed October 15, 2026. Coverage begins September 16, 2026, the user-confirmed handover/employment boundary. This is a contribution-area inventory for portfolio copy, not a new certification of production behavior. Source repositories were read only. Prior deployment records establish the labels below; no operational transactions were performed for this audit.

## PIS

Source root: `C:/xampp/htdocs/peoples-information-system`.

| Contribution area | Evidence reviewed | Copy/status decision |
| --- | --- | --- |
| Petty Cash categories, opening entries, bank deposits/reconciliation, daily report and signatories | CHANGELOG.md, 2.11.0–2.11.2 (September 16) | Include handover-period additions, not ownership of the whole system. |
| Allocation routing and historical balance checks | CHANGELOG.md, 2.11.4 and 2.13.1 | Describe the corrected root-fund/date-aware behavior; omit superseded 2.11.3 allocation guidance. |
| Pending edits, posted corrections, reversals, account-title requests and financial audit | CHANGELOG.md, 2.11.1, 2.11.5, 2.12.0, 2.13.0 | Include grouped review/correction work; do not imply unrestricted edits of approved records. |
| Member-accounting matching, fund moves, archive/restore, batch review and GL scope | CHANGELOG.md, 2.13.0–2.14.0; REQUESTS.md PIS-009, PIS-036–037 | Include implemented workflows; current tracker records selected-batch and GL-scope fixes Live. |
| Request table, submission-date filtering, pagination, dialogs, document reuse and saved-change evidence | REQUESTS.md PIS-001–003, PIS-011, PIS-015–016, PIS-024; CHANGELOG.md 2.17.0 | Replace stale local-only queue claim with deployed improvements. Optional new-transaction documents and mandatory saved-change evidence are distinct. |
| Month controls, office/role permissions, importing, member security | REQUESTS.md PIS-007, PIS-012, PIS-019, PIS-038, PIS-049–050; CHANGELOG.md 2.17.0–2.17.1 | Include reviewed import staging and manual scan entry, not OCR or completed real-source imports. Do not repeat superseded assigned-office-only policy from 2.16.0. |
| Public/auth/member/staff interfaces, photographs and notifications | REQUESTS.md PIS-025–034, PIS-040, PIS-046–047, PIS-051; docs/forest-theme-restoration-2026-10-14.md | Tracker and release note record Live. Notification controls/status UI verified; audible speaker output and all-role/device delivery not established. |
| Navigation, member detail and source-link repairs | REQUESTS.md PIS-038–039, PIS-041, PIS-043–045 | Include maintenance contribution without exposing records or implying historical ledger reconciliation. |

Deferred reconciliation, unstarted report repair, OCR, and unsupported complete compliance claims are excluded. REQUESTS.md includes older local-only narrative alongside newer Live evidence; the newer dated evidence takes precedence.

## WorkForce / DTR

Source root: `C:/xampp/htdocs/pmpc-mngnt-system`.

| Contribution area | Evidence reviewed | Copy/status decision |
| --- | --- | --- |
| Employee/admin attendance UI, punches, corrections, navigation, task/profile/notification refinements, validation, accessibility and performance | CHANGELOG.md handover-period entries above baseline 0.1.0; relevant dashboard, DTR and request source | Describe improvements to inherited functionality, not original creation of payroll/DTR. Do not claim complete WCAG compliance from changelog wording. |
| Individual/bulk PDF repair and effective-dated shift correction | docs/payroll-pdf-live-repair-2026-10-14.md; CHANGELOG.md live shift entry | Confirmed deployed fixes. PDF release explicitly did not deploy the newer office-payroll workflow. |
| Personal schedules, workdays, full-week attendance, absence/rest-day/holiday rules and always-present option | October 15 git subjects and CHANGELOG.md; Employee model, Holiday model, attendance/dashboard/print controllers | Deployed; confirmed live on peoplescoopdtr.online by Kurt on October 16, 2026. Missing-punch absence detection must respect personal workdays, not imply every weekday is a workday. |
| Configured final DTR correction with history/reasons and pending-request protection | CHANGELOG.md October 15 final-check entry and DTR controller/routes; Kurt's confirmation | Deployed; confirmed live on peoplescoopdtr.online by Kurt on October 16, 2026. No private reviewer IDs in portfolio. |
| Office payroll table, late minutes, reviewed deductions, batch confirmation, rounding/snapshots, 13th-month recalculation | CHANGELOG.md latest entries; OfficePayrollCalculator, PayrollController, ThirteenthMonthCalculator; Kurt's confirmation | Describe current table workflow, not superseded three-step review. Deployed; confirmed live on peoplescoopdtr.online by Kurt on October 16, 2026. |
| Monthly Excel and capacity/layout/voucher fixes | CHANGELOG.md; ManagementPayrollExport; docs/payroll-office-rules.md | Current code/changelog overrides stale three-person Main Office capacity in older document. Names-only signatories; no claim of signature pictures in Excel. Deployed; confirmed live on peoplescoopdtr.online by Kurt on October 16, 2026. |
| HR identity review, office assignment/transfer, signatures, finalized-only employee payslips | CHANGELOG.md; AccountSetupService, SubmitAccountSetupRequest; docs/account-setup-and-payslip-release.md | Latest code/changelog requires signature, overriding older optional-signature prose. Deployed; confirmed live on peoplescoopdtr.online by Kurt on October 16, 2026. |

Git dates/subjects corroborate October 15 changes but are not sole authorship or deployment evidence. Baseline inherited features and individual employee details are excluded. Neither an Unreleased heading nor local tests prove a production release or payroll compliance.

## General Merchandise

Source root: `C:/Users/Kurtong/OneDrive - STI College San Jose/Documents/ChatGPT/People’s Coop Gen. Mdse/mobile-work`.

| Contribution area | Evidence reviewed | Copy/status decision |
| --- | --- | --- |
| Navigation, spacing, dashboard/product/report responsive layouts and POS cart preservation | DEPLOYED.md, mobile-changed-files.json, source under resources/js | October 1 deployed mobile improvements, verified at 320/390/768/1024px. POS-specific behavior was checked locally, not with live transactions. |
| Cost × count valuation, explicit zero entries, authorization, stale-stock and finalization safeguards | INVENTORY_MONTHLY_REPORT.md; inventory count source and tests | Implemented and locally verified October 9; not merely proposed and not deployed. |
| Branch/month closing selection, sales/purchases/expenses/profit, completeness and reconciliation, printable report | INVENTORY_MONTHLY_REPORT.md; monthly report source and tests | Implemented locally. Missing evidence stays incomplete; inventory equation is not presented as replacement profit logic. No claim of archived or Excel report exports. |

No deployment evidence supersedes the local-only inventory/report release boundary. Synthetic screenshots remain labelled as local prototypes; no production financial data is added.

## Portfolio integration

Only PMPC descriptive fields change in src/data/projectData.js. Existing cards, classic views, dialogs and simulated terminal consume these shared fields. No component, API, route, dependency, screenshot, outbound link, metadata or hosting configuration change is needed. Existing six-project ordering and inherited badges remain intact.

## Validation

- Production build, theme check and git diff whitespace check passed. Build retains the existing large dynamically loaded scene-chunk warning.
- All 17 test files / 89 tests passed with one worker after concurrent browser runs caused unrelated 5-second unit timeouts. The existing mobile credibility assertion now checks deployed/local wording instead of requiring the superseded unreleased label.
- All 12 PMPC dialog combinations passed at 1440/375px in dark/light: contribution period, inherited attribution, loaded images, reachable final highlights, no modal horizontal overflow, Escape and trigger-focus restoration. Captures: test-results/pmpc-contributions/.
- Additional checks passed for PMPC screenshot lightboxes and nested Escape behavior in both themes, direct PDF response, resume app preview/download, and scene-chunk failure recovery. Classic mode reads the updated shared summaries at desktop and phone widths.
- Full verify-portfolio-ui.mjs was run but stopped at the unrelated After Hours photo-deck double-click expectation (line 290). Full verify-retro-apps.mjs was run twice and stopped at the boot Sound: Off expectation (line 15); the observed shell instead exposes Mute sound after boot. These suites are not reported as passed and their underlying behavior was not changed by this content task.
- Preview: http://127.0.0.1:4174/projects. No commit, push or deployment was performed.
