# Implementation Plan: Standalone Template App 'rexpro-ai'

This plan details how we will extract and structure the core layout, left sidebar, header, navigation, and configuration of the existing application to create a new self-contained React project under `rexpro-ai`.

## User Review Required

> [!IMPORTANT]
> The new template will be created in `d:\dev-ops\erp1\rexpro-ai`. It will be fully self-contained (with its own `package.json`, `vite.config.ts`, `node_modules` capability) so it can be moved or copied anywhere outside this root workspace.
>
> **Key Decisions made:**
> 1. **Authentication store:** The parent app uses a complex Clerk / Custom authentication workflow. For the template, we will simplify this to a local cookie-based mock store or standard bypass so the sidebar and user-profile menus load instantly without requiring Clerk configuration/setup.
> 2. **Right Sidebar (rexpro-ai):** The parent app includes an AI assistant sidebar on the right side. Since the user requested the left sidebar, productivity menu & page, header, and menu templates, we will omit the complex AI right sidebar from the main template layout to keep the template pure, decoupled, and fast.
> 3. **Page placeholders:** We will create standard "Coming Soon" or empty placeholder components for the pages (including Commercial Accounts, Settings, and Productivity) to satisfy the "page kosongkan atau comingsoon" request.

---

## Proposed Changes

We will create a brand new structure under `d:\dev-ops\erp1\rexpro-ai/`. No modifications will be made to the files in the existing parent project `d:\dev-ops\erp1`.

### 1. Build and Config Files

#### [NEW] [package.json](file:///d:/dev-ops/erp1/rexpro-ai/package.json)
Contains only the dependencies required for the sidebar, header, and layouts (Vite, TS, Tailwind CSS v4, React 19, Radix UI components, Lucide icons, TanStack Router).

#### [NEW] [vite.config.ts](file:///d:/dev-ops/erp1/rexpro-ai/vite.config.ts)
Vite setup with react-swc, tailwind, and the TanStack Router plugins.

#### [NEW] [tsconfig.json](file:///d:/dev-ops/erp1/rexpro-ai/tsconfig.json), [tsconfig.app.json](file:///d:/dev-ops/erp1/rexpro-ai/tsconfig.app.json), [tsconfig.node.json](file:///d:/dev-ops/erp1/rexpro-ai/tsconfig.node.json)
Standard typescript compiler settings mimicking the parent application.

#### [NEW] [components.json](file:///d:/dev-ops/erp1/rexpro-ai/components.json)
Shadcn configurations for directory aliases and styles.

#### [NEW] [index.html](file:///d:/dev-ops/erp1/rexpro-ai/index.html)
Standard entry HTML incorporating fonts.

---

### 2. Contexts and Hooks

#### [NEW] [utils.ts](file:///d:/dev-ops/erp1/rexpro-ai/src/lib/utils.ts) & [cookies.ts](file:///d:/dev-ops/erp1/rexpro-ai/src/lib/cookies.ts)
Core helpers for tailwind-merge and document cookie management.

#### [NEW] [use-mobile.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/hooks/use-mobile.tsx) & [use-dialog-state.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/hooks/use-dialog-state.tsx)
Hooks for sidebar responsiveness and modal triggers.

#### [NEW] [theme-provider.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/context/theme-provider.tsx)
Manages light/dark mode.

#### [NEW] [font-provider.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/context/font-provider.tsx) & [fonts.ts](file:///d:/dev-ops/erp1/rexpro-ai/src/config/fonts.ts)
Manages font families dynamically.

#### [NEW] [direction-provider.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/context/direction-provider.tsx)
Handles RTL/LTR direction settings.

#### [NEW] [layout-provider.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/context/layout-provider.tsx)
Handles collapsible layout states of the sidebar.

#### [NEW] [search-provider.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/context/search-provider.tsx)
Manages search modal state.

---

### 3. Layouts & UI Components

#### [NEW] UI Primitives (inside `rexpro-ai/src/components/ui/`)
- `sidebar.tsx`
- `dropdown-menu.tsx`
- `avatar.tsx`
- `collapsible.tsx`
- `badge.tsx`
- `button.tsx`
- `separator.tsx`
- `tooltip.tsx`
- `dialog.tsx`
- `alert-dialog.tsx`
- `scroll-area.tsx`
- `command.tsx`

#### [NEW] Layout Components (inside `rexpro-ai/src/components/layout/`)
- `authenticated-layout.tsx` (main wrapper combining layout + sidebar)
- `app-sidebar.tsx` (main sidebar component feeding items from data)
- `header.tsx` & `header-right.tsx` (top bar controls and shortcut placeholders)
- `nav-group.tsx` (sidebar menu groups with recursive collapsible support)
- `nav-user.tsx` (user avatar and settings popover)
- `team-switcher.tsx` (active organization / workspace selector)
- `sidebar-data.ts` (configured menu items)
- `types.ts` (type definitions)
- `main.tsx` (content area wrapper)

#### [NEW] Search and Shortcuts
- `search.tsx` (trigger button)
- `command-menu.tsx` (modal for command palette)
- `skip-to-main.tsx` (accessibility)
- `navigation-progress.tsx` (top-loading indicator)

---

### 4. Routes and Feature Pages

#### [NEW] [__root.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/routes/__root.tsx)
Renders page headers, outlet, loading bar, and theme wrappers.

#### [NEW] [_authenticated/route.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/routes/_authenticated/route.tsx)
Renders within the `AuthenticatedLayout`.

#### [NEW] [_authenticated/index.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/routes/_authenticated/index.tsx)
Default dashboard path - loads a placeholder dashboard.

#### [NEW] [_authenticated/productivity.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/routes/_authenticated/productivity.tsx)
Productivity route - loads a simplified productivity placeholder page or custom UI layout.

#### [NEW] [_authenticated/commercial/client-accounts.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/routes/_authenticated/commercial/client-accounts.tsx)
Commercial page - shows subtemplate placeholder.

#### [NEW] [_authenticated/commercial/service-quotations.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/routes/_authenticated/commercial/service-quotations.tsx)
Commercial sub page - placeholder.

#### [NEW] [_authenticated/settings.tsx](file:///d:/dev-ops/erp1/rexpro-ai/src/routes/_authenticated/settings.tsx)
Settings placeholder page.

---

### 5. Styles and Assets

#### [NEW] [index.css](file:///d:/dev-ops/erp1/rexpro-ai/src/styles/index.css) & [theme.css](file:///d:/dev-ops/erp1/rexpro-ai/src/styles/theme.css)
Tailwind v4 structure and oklch theme definitions.

#### [NEW] Asset Files
Copy logo files `o1_logo.png` to the template's public folder to display in the switcher.

---

## Verification Plan

### Automated Verification
Once the files are created, we will:
1. Run `npm install` inside the `rexpro-ai` folder.
2. Run `npm run build` (which runs `tsc -b && vite build`) to verify that the TypeScript compilation passes and the bundle builds successfully without any errors.

### Manual Verification
1. We will launch the Vite development server in the background for `rexpro-ai` using `npm run dev`.
2. Inspect the rendered sidebar, header, and route transitions using the browser subagent to confirm responsiveness and active layout changes.
