# Finance Dashboard UI

Frontend assignment implementation for a finance dashboard that focuses on UI clarity, interactive exploration, and clean state management.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS (plus custom CSS variables)
- Zustand for centralized state management
- Recharts for data visualization
- Mock API service layer (frontend-only async simulation)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

## Features

### 1. Dashboard Overview

- Summary cards for Total Balance, Income, and Expenses
- Time-based visualization: 6-month running balance trend
- Categorical visualization: spending breakdown by top categories
- Advanced mixed chart: monthly income/expense bars with net line (cashflow mix)

### 2. Transactions Section

- Table with Date, Category, Type, Amount, and Note
- Search support (note/category)
- Filtering by type, category, month, minimum amount, and maximum amount
- Sorting by date, amount, and category (asc/desc)
- Empty and no-result states
- Active filter counter for quick context

### 3. Simulated Role-Based UI

- Role switcher with two roles: Viewer and Admin
- Viewer role is read-only
- Admin role can add, edit, and delete transactions

### 4. Insights Section

- Highest spending category
- Month-over-month spending comparison
- Savings pulse (savings rate + largest expense signal)
- Forecast confidence and projected next-month net
- Expense anomaly watchlist (outlier detection)

### 5. Budget Planning (Advanced)

- Category-wise monthly budgets with utilization bars
- Over-budget and at-risk status detection
- Budget totals and utilization summary
- Admin-only budget editing with persistence

### 6. State Management

Zustand store manages:

- Transactions collection
- Filters and sorting state
- Budget limits by category
- Selected role
- Selected theme
- Loading and error states

### 7. UI / UX Expectations

- Responsive layouts across mobile, tablet, and desktop
- Graceful no-data handling in cards/charts/insights/table
- Accessible controls with visible focus states

## Optional Enhancements Implemented

- Dark mode toggle
- Local storage persistence (transactions, role, theme)
- Motion and staggered reveal animations
- Export visible transactions as CSV and JSON
- Mock API integration with simulated latency

## Advanced Highlights For Recruiter Review

- Predictive analytics: next-month income/expense/net forecast with confidence scoring
- Data intelligence: anomaly detection for unusual expense spikes using category-level behavior
- Planning workflow: editable budget planner with utilization thresholds and visual status
- Decision support: custom Action Plan engine that generates top 3 prioritized financial actions
- Rich dashboard storytelling: multiple complementary chart types for trend + composition + comparison
- Strong frontend architecture: modular components, typed domain models, reusable analytics layer, and persisted state
- Performance-aware implementation: lazy-loaded dashboard sections with targeted vendor chunk splitting

## Originality And Ownership

- This submission is implemented as original frontend work for evaluation.
- Custom logic implemented in this project includes forecast confidence scoring, expense anomaly detection, budget utilization status mapping, and the action recommendation engine.
- All features are explainable end-to-end: data model, derived analytics, UI interactions, and role-based behavior.
- External libraries are used only as building blocks (React, Zustand, Recharts, date-fns), while business logic and composition are authored in-project.

## Interview Talking Points

1. Why Zustand was selected over Redux for this scoped assignment and how slices are organized.
2. How filter state drives all downstream visuals and insights through shared derivation utilities.
3. How role simulation is enforced in both UI affordances and mutation actions.
4. How forecast confidence, anomaly detection, and recommendation priorities are computed.
5. What improvements would be made next: test coverage, API integration, and historical model tuning.

## Evaluation Criteria Mapping

1. Design and Creativity: Custom visual language, intentional typography, themed surfaces, and multi-section information hierarchy.
2. Responsiveness: Mobile-first layout behavior across cards, charts, tables, and insight modules.
3. Functionality: Full dashboard flow with summary metrics, filtering/search/sort, RBAC simulation, exports, and planning tools.
4. User Experience: Fast-scanning sections, empty states, readable controls, and consistent feedback for role and loading status.
5. Technical Quality: Type-safe domain model, modular components, reusable analytics helpers, and centralized persisted state.
6. State Management Approach: Zustand store manages transactions, filters, sorting, budgets, role, theme, and mutation actions.
7. Documentation: Setup, architecture, feature mapping, originality notes, and interview walkthrough prompts are included.
8. Attention to Detail: Dark mode parity, animation polish, no-data handling, forecast confidence labels, anomaly watchlist, and action checklist copy support.

## Final Submission Checklist

1. Run quality checks:
  - npm run lint
  - npm run build
2. Ensure both required links are ready:
  - Repository link
  - Deployment link
3. Verify README includes:
  - Setup steps
  - Requirement mapping
  - Architecture notes
  - Originality and ownership section
4. Record a short demo (2-3 minutes) following the Suggested Demo Flow.
5. Do one final role behavior check:
  - Viewer is read-only
  - Admin can add/edit/delete transactions and edit budgets

## Suggested Demo Flow (2-3 mins)

1. Start in Viewer role to show read-only behavior and filter exploration.
2. Switch to Admin role and add/edit one transaction.
3. Apply min/max amount filters and month filter to show dynamic chart + insights updates.
4. Open Budget Planner, adjust two category limits, and show utilization status changes.
5. Export visible transactions as CSV/JSON.
6. Toggle dark mode and refresh page to demonstrate persistence.

## Folder Structure

```text
src/
  components/
    common/
    dashboard/
    insights/
    transactions/
  data/
  services/
  store/
  types/
  utils/
```

## Architecture Notes

- `src/store/useDashboardStore.ts` is the central UI state and mutation layer.
- `src/services/mockFinanceApi.ts` simulates async CRUD operations.
- `src/utils/financeAnalytics.ts` contains all derived calculations and insights logic.
- Role checks are enforced in store actions and reflected in UI controls.

## Assumptions

- This is frontend-only and does not use real authentication or backend RBAC.
- Currency is represented in USD for demonstration.
- Seed data is mocked and loaded from local static data on first run.

## Requirement Mapping

- Dashboard Overview: Implemented
- Transactions + Filter/Sort/Search: Implemented
- Role-Based UI Simulation: Implemented
- Insights Section: Implemented
- State Management: Implemented (Zustand)
- Responsive and Empty States: Implemented
- Documentation: Implemented in this README
