# PhilHealth Patient Dialysis Database Registration Portal (PDD) - Agent Context & Guidelines

Welcome to the **PhilHealth Patient Dialysis Database (PDD) Registration Portal** repository. This workspace contains a high-fidelity patient-facing portal and administrative/debug interface designed to streamline registration, tracking, and pixel-perfect PDF export of the official PhilHealth Dialysis Database forms.

---

## 📂 Project Structure & Location
All frontend React application files, styling, and configuration are located under the **`dialysis/`** subdirectory. 

```
HI191_PhilHealthDialysis/ (Workspace Root)
├── agents.md (This file)
├── .cursorrules (Cursor-specific IDE instructions)
├── .clinerules (Cline/Roo-Cline/Roo-Code instructions)
├── .windsurfrules (Windsurf-specific instructions)
└── dialysis/ (React + Vite App Root)
    ├── package.json (Vite 8, Tailwind v4, React 18, pdf-lib, motion)
    ├── vite.config.ts (Tailwind Vite plugin setup)
    ├── index.html (Single-page app anchor)
    ├── tsconfig.json (TypeScript config)
    ├── public/
    └── src/
        ├── App.tsx (Main application container, public views, and routing)
        ├── main.tsx (React entrypoint)
        ├── types.ts (Centralized TypeScript interfaces & domain enums)
        ├── index.css (Tailwind & custom scrollbars)
        ├── assets/ (Logos and PhilHealth PDF registration form template)
        ├── lib/
        │   └── utils.ts (Tailwind CSS class merging helper)
        ├── utils/
        │   └── exportPddPdf.ts (Custom pdf-lib overlay generator & calibrations)
        └── components/
            ├── Dashboard.tsx (Patient statistics, statuses, and quick navigation)
            ├── RegistrationForm.tsx (Multipage-style registration input system)
            ├── RecordsList.tsx (Table of applications, actions, and delete options)
            ├── EditRegistrationModal.tsx (Inline editing system matched with schema)
            └── PdfLayoutDebugger.tsx (Interactive visual sandbox to tweak PDF coordinates)
```

---

## 🛠️ Technology Stack & Styling Core

### 1. Framework & Bundler
*   **Vite 8** as the build tool and dev server.
*   **React 18** (functional components with Hooks).
*   **TypeScript** (strict typing is enforced).

### 2. Styling (Tailwind CSS v4)
*   The project uses **Tailwind CSS v4** via the `@tailwindcss/vite` plugin.
*   **Theme Aesthetic**: Strict medical/corporate premium theme.
    *   **Primary colors**: Deep and professional Emerald hues (`bg-emerald-950`, `text-emerald-900`, `emerald-700`).
    *   **Highlights**: Bright gold/yellow accents (`bg-yellow-400`, `text-emerald-950`).
    *   **Neutrals**: Sleek slate and gray colors (`bg-slate-50`, `text-slate-900`).
*   **Animations**: Built using **`motion/react`** (Framer Motion). Always use subtle, premium-feeling transitions and micro-interactions (e.g., page switching, modal opening, sidebar toggling).
*   **Icons**: Centralized usage of **`lucide-react`**.

### 3. PDF Generation System
*   **Library**: `pdf-lib` is used to programmatically render fields onto the official PhilHealth registration PDF template file.
*   **PDF Core Utility (`src/utils/exportPddPdf.ts`)**:
    *   Accepts `PDDRegistration` data and overlays text/ticks/digit-boxed values exactly on top of the original form image.
    *   Coordinates are mapped relative to a virtual `612 x 792` grid and automatically scaled to the page size.
    *   Contains custom offsets (`offsetX`, `offsetY`), coordinate scalars (`scaleX`, `scaleY`), and font scalar (`fontScale`).
*   **Interactive PDF Debugger (`src/components/PdfLayoutDebugger.tsx`)**:
    *   Allows live visual testing, tweaking, and updating of PDF coordinates.
    *   Allows turning on a detailed red/blue/green grid overlay directly inside the generated PDF for easy coordinate adjustments.

---

## 💾 State Management & Data Flow
*   **Local Storage**: Application records are persisted entirely client-side using `localStorage` (key: `pdd_registrations`).
*   **Routing**: Clean, light client-side state routing in `App.tsx` supporting:
    *   **Public Views**: `landing` (hero, features), `login`, `signup`.
    *   **Portal Views**: `home` (dashboard), `apply` (form), `my-records` (submissions table), `profile` (settings).
*   **Data Model compliance**: All dialysis records must strictly comply with the `PDDRegistration` structure defined in `src/types.ts`.

---

## 🎯 Developer Guidelines & Rules for AI Agents

> [!IMPORTANT]
> **Strict Adherence to Schemas**
> Do not modify fields in `src/types.ts` without also updating `RegistrationForm.tsx`, `EditRegistrationModal.tsx`, and the field-mapping rules in `src/utils/exportPddPdf.ts`. Out-of-sync fields will break the PDF generator.

### 💻 Code Integrity
1.  **Strict Typing**: Always declare interfaces and types. Avoid `any` type usage at all costs.
2.  **Tailwind Merge Utility**: Always import the `cn` utility from `src/lib/utils` when applying conditional Tailwind classes to prevent utility style clashes.
3.  **PDF Layout Coordinates**: The coordinate system in `src/utils/exportPddPdf.ts` is calibrated to the official PhilHealth form. If modifying coordinates, verify them first in the `PdfLayoutDebugger.tsx` workspace.
4.  **No Placeholders**: Never insert simple mock placeholders in components. Build complete features with rich visual details.

### 🎨 Visual & UI Excellence
1.  **Consistent Theme**: Always use the emerald + gold theme. Keep borders thin and clean (`border-slate-200/slate-100`).
2.  **Rounded Corners**: Make components look modern and premium by using pill tags and rounded layouts (`rounded-2xl` / `rounded-3xl` / `rounded-[2rem]`).
3.  **Interactive Elements**: All hover states should feel alive. Add scaling (`active:scale-95`), slight background changes (`transition-all`), and shadows (`hover:shadow-lg`).
4.  **Animations**: Wrap tabs or dynamic content in `AnimatePresence` + `<motion.div>` for smooth visual entries.

---

## 🚀 Running the Project Locally
Ensure you execute commands inside the `dialysis/` directory:

1.  **Install dependencies**:
    ```bash
    cd dialysis
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Build production version**:
    ```bash
    npm run build
    ```
