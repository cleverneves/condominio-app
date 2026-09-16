---
name: CondoResolve Modern Clean
colors:
  surface: "#f8f9fa"
  surface-dim: "#d9dadb"
  surface-bright: "#f8f9fa"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f4f5"
  surface-container: "#edeeef"
  surface-container-high: "#e7e8e9"
  surface-container-highest: "#e1e3e4"
  on-surface: "#191c1d"
  on-surface-variant: "#404941"
  inverse-surface: "#2e3132"
  inverse-on-surface: "#f0f1f2"
  outline: "#707971"
  outline-variant: "#c0c9bf"
  surface-tint: "#2a6a45"
  primary: "#004324"
  on-primary: "#ffffff"
  primary-container: "#1a5c38"
  on-primary-container: "#90d2a5"
  inverse-primary: "#93d5a7"
  secondary: "#186c42"
  on-secondary: "#ffffff"
  secondary-container: "#a4f4bf"
  on-secondary-container: "#217248"
  tertiary: "#303c37"
  on-tertiary: "#ffffff"
  tertiary-container: "#47534e"
  on-tertiary-container: "#b9c6c0"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#aef2c2"
  primary-fixed-dim: "#93d5a7"
  on-primary-fixed: "#00210f"
  on-primary-fixed-variant: "#0b522f"
  secondary-fixed: "#a4f4bf"
  secondary-fixed-dim: "#88d7a5"
  on-secondary-fixed: "#002110"
  on-secondary-fixed-variant: "#00522f"
  tertiary-fixed: "#d9e5df"
  tertiary-fixed-dim: "#bdc9c3"
  on-tertiary-fixed: "#131e1a"
  on-tertiary-fixed-variant: "#3d4944"
  background: "#f8f9fa"
  on-background: "#191c1d"
  surface-variant: "#e1e3e4"
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: "700"
    lineHeight: 14px
    letterSpacing: 0.04em
  stat-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: "700"
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a calm, transparent, and authoritative operational experience for residential condominium management and incident tracking. It serves two interconnected audiences: property administrators (syndics, building managers, maintenance supervisors) who require high-density visual clarity, speed, and real-time oversight; and condominium residents who demand effortless reporting, accountability, and approachable status tracking.

The visual style blends modern corporate clarity with tactile warmth. Drawing directly from modern SaaS product suites, the design favors airy canvases, deep botanical forest-green grounding accents, subtle warm-gray surface demarcations, and rounded badge components. The aesthetic conveys security, community stewardship, and swift resolution, dispelling the bureaucratic friction typically associated with condominium administration.

## Colors

The palette establishes an organic, dependable atmosphere anchored by deep forest green (`#1A5C38`) as the dominant identity mark, primary action color, and selected state container. Secondary emerald (`#2E7D52`) offers hover transitions and secondary emphasis, while tertiary pale mint (`#E8F5EE`) supplies soft background fills for active navigation, subtle pill containers, and focus rings.

### Functional Status System

Condominium resolution requires immediate categorical distinction without visual chaos:

- **Pendente (Pending):** Text `#92400E` over background `#FEF3C7` with a soft border `#FDE68A`.
- **Em Andamento (In Progress):** Text `#1E40AF` over background `#EFF6FF` with a soft border `#BFDBFE`.
- **Concluído / Resolvido (Resolved):** Text `#166534` over background `#DCFCE7` with a soft border `#BBF7D0`.
- **Urgente / Crítico (Critical/Escalated):** Text `#991B1B` over background `#FEE2E2` with a soft border `#FECACA`.
- **Cancelado (Cancelled):** Text `#4B5563` over background `#F3F4F6` with a soft border `#E5E7EB`.

### Neutral Foundation

Surfaces are built on `#F4F5F7` for page canvases and pure `#FFFFFF` for primary cards and workspace elevations. Borders utilize whisper-thin `#E5E7EB` dividers, avoiding stark contrast and preserving an open, inviting feel.

## Typography

Typography relies uniformly on Plus Jakarta Sans, combining high legibility with friendly geometric construction. The font balances administrative rigor with an approachable, contemporary character.

Metric counts (e.g., active ticket totals, days to resolution) take primary visual weight using `stat-metric` with tight negative letter spacing. Section labels and tabular headers leverage `label-sm` with slight tracking to ensure readability at smaller scales across high-density resident and unit tables.

## Layout & Spacing

The application architecture utilizes an asymmetrical, sidebar-driven fluid grid. The sidebar occupies a persistent 260px column on wide screens, housing primary navigational hierarchies and account switches, while the main content area adjusts dynamically across desktop resolutions with bounded interior containment.

### Responsive Breakpoints

- **Desktop (1280px+):** 12-column fluid grid, 260px fixed sidebar, 24px outer margins, 20px card gutters.
- **Tablet / Small Desktop (768px - 1279px):** Collapsed icon-rail sidebar (72px), 8-column layout, 20px margins, 16px gutters.
- **Mobile (<768px):** Single-column stack, persistent bottom navigation bar for quick incident filing, 16px outer margins, full-bleed actionable cards.

Card interiors feature generous interior breathing room: compact data-readouts utilize `space-md` (16px), while operational dashboard modules employ `space-lg` (24px) padding to maintain a tranquil, unhurried workflow.

## Elevation & Depth

Elevation eschews heavy shadows in favor of a layered, tactile surface hierarchy:

- **Level 0 (Canvas Base):** Default viewport background tinted at `#F4F5F7` creating crisp separation against cards.
- **Level 1 (Card & Modular Surfaces):** Pure white `#FFFFFF` with a barely perceptible perimeter border (`rgba(0, 0, 0, 0.05)`) and a subtle ambient drop shadow: `0px 1px 3px rgba(16, 24, 40, 0.04), 0px 1px 2px rgba(16, 24, 40, 0.02)`.
- **Level 2 (Dropdowns, Menus & Tooltips):** Raised panels utilizing `0px 10px 15px -3px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)` with sharp 1px border frames.
- **Level 3 (Incident Detail Drawers & Modals):** `0px 20px 25px -5px rgba(16, 24, 40, 0.1), 0px 10px 10px -5px rgba(16, 24, 40, 0.04)` over a soft tinted dark backdrop (`rgba(17, 24, 39, 0.35)`).
- **Hero Accent Containers:** High-impact metric panels utilize solid primary deep-green `#1A5C38` with inner white highlights, reversing the standard contrast to emphasize core condominium KPIs.

## Shapes

With a roundedness index of `2`, the system maintains a refined balance between structured utility and welcoming modern software design:

- **Standard Elements (0.5rem / 8px):** Input inputs, table row highlights, internal toolbars, and small media attachments.
- **Cards & Modules (1rem / 16px):** Dashboard summary blocks, incident cards, filter panels, and modal containers (`rounded-lg`).
- **Pill UI Badges & Action Buttons (9999px / Full Pill):** Status indicators (Pendente, Em Andamento, Concluído), filter chips, and primary navigation CTA triggers follow a signature pill shape, ensuring high tap target recognition and approachable aesthetics.

## Components

### Buttons

- **Primary:** Full pill-shaped container (`rounded-full`), deep forest green `#1A5C38` fill, white text, smooth transition to `#2E7D52` on hover. Accompanied by circular white icon chips for directional or add triggers.
- **Secondary / Outline:** White pill container with a subtle 1px border (`#D1D5DB`), text `#374151`, shifting to `#F9FAFB` on hover.
- **Tertiary / Ghost:** Borderless, soft green text `#1A5C38` with `#E8F5EE` background on hover.

### Status Badges & Chips

- Compact pill silhouettes (`padding: 4px 12px`, `font-size: 12px`, `font-weight: 600`).
- Statuses carry distinct semantic colors: Pendente (Amber), Em Andamento (Cobalt Blue), Concluído (Forest Emerald), Cancelado (Neutral Slate).
- Interactive filter chips feature count badges in small enclosed secondary circles.

### Incident Cards & Data Lists

- **Dashboard Metric Card:** White surface featuring a top label, large bold numerical count (`stat-metric`), circular trailing navigation icon button, and bottom pill indicator displaying percentage trend or contextual sub-status.
- **Incident List Item:** Horizontal multi-column cards containing unit identification (e.g., "Apto 402 - Bloco B"), category icon tag (e.g., Hidráulica, Barulho, Elétrica), elapsed time indicator, assigned technician avatar, and right-aligned status badge.

### Input Fields & Search

- Inputs feature light neutral fills (`#FFFFFF`), subtle borders (`#E5E7EB`), and inset leading icons. Focus states shift to a crisp `#1A5C38` outline with a 3px diffused mint aura (`rgba(26, 92, 56, 0.15)`).
- Global header search includes an integrated keyboard shortcut pill indicator (`⌘K` or `⌘F`).

### Special Operational Components

- **Timeline / Audit Trail:** Vertical connected line component tracking incident lifecycle (Aberto → Notificado → Em Vistoria → Concluído) with emerald node checks.
- **Resident Quick Action Banner:** A dark botanical gradient banner with soft green vectors providing rapid access to emergency maintenance lines and mobile app download.
