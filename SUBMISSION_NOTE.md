# Submission Note: Finance Dashboard UI

## Candidate
- Name: Peddapalli Satya Venkata Siva Durga Prasad
- Role Applied: Frontend Developer Intern

## Links
- Repository: ADD_REPOSITORY_LINK_HERE
- Deployment: ADD_DEPLOYMENT_LINK_HERE

## Project Summary
This is a frontend-only Finance Dashboard built with React, TypeScript, Zustand, Tailwind, and Recharts.
It focuses on clean UI, modular components, and clear state handling using mock data and a simulated role switcher.

## How This Meets The Assignment Requirements

1. Dashboard Overview
- Summary cards for Total Balance, Income, and Expenses.
- Time-based chart: running balance trend.
- Category chart: spending breakdown by category.

2. Transactions Section
- Transaction table includes Date, Amount, Category, Type, and Note.
- Includes search, filters, and sorting.
- Viewer/Admin mode reflected in UI actions.

3. Basic Role-Based UI (Frontend Simulation)
- Viewer: read-only behavior.
- Admin: add, edit, and delete transactions.
- Role switcher is available in the header for demonstration.

4. Insights Section
- Highest spending category.
- Month-over-month spending comparison.
- Additional observations (savings pulse, anomaly watch, forecast signal).

5. State Management
- Zustand store manages transactions, filters, sorting, role, theme, and budgets.
- Local storage persistence used for key UI and data state.

6. UI/UX Expectations
- Responsive layout for mobile, tablet, and desktop.
- Handles empty and no-result states across panels.
- Consistent visual hierarchy and interaction feedback.

## Optional Enhancements Included
- Dark mode toggle.
- Mock API service with async simulation.
- CSV/JSON export for visible rows.
- Budget planner with utilization status.
- Simple action recommendation panel.

## Originality Statement
This submission is my original implementation for this evaluation.
Libraries are used for framework and chart rendering only; component composition, state design, filtering logic, insights derivation, and role-based interaction behavior are implemented within this project.

## Quick Reviewer Demo Flow (2-3 Minutes)
1. Open dashboard in Viewer mode and show read-only behavior.
2. Switch to Admin mode.
3. Add or edit one transaction and show live UI updates.
4. Apply search/filter/sort and show chart + insights changes.
5. Open Budget Planner and adjust a category budget.
6. Export current rows as CSV/JSON.

## Assumptions
- Frontend-only submission (no backend auth/RBAC).
- Mock data is acceptable as per assignment brief.
- Currency shown in USD for consistency in demo.
