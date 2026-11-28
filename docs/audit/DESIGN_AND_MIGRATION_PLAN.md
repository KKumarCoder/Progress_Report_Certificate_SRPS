# ANVAYROBO Design System, Responsive Layout & Rollback Plan

## 1. Design Tokens (Light & Dark Mode)
- **Typography:** `Inter` / `DM Sans` UI sans-serif, crisp weights (`500`, `600`, `700`), tabular numerals for marks & KPIs.
- **Light Mode:**
  - `--bg`: `#F5F8FC` | `--surface`: `#FFFFFF` | `--surface-elevated`: `#FFFFFF`
  - `--primary`: `#0866E8` | `--secondary`: `#38A5F5`
  - `--text`: `#14243B` | `--text-muted`: `#718198` | `--border`: `#E1E9F2`
  - `--success`: `#16A36A` | `--warning`: `#F59E0B` | `--danger`: `#E94B4B`
- **Dark Mode:**
  - `--bg`: `#0B1220` | `--bg-secondary`: `#111B2D` | `--surface`: `#172337` | `--surface-elevated`: `#1D2B42`
  - `--primary`: `#3B82F6` | `--secondary`: `#60A5FA`
  - `--text`: `#F1F5FB` | `--text-muted`: `#A5B4C7` | `--border`: `#2B3B52`
  - `--success`: `#34D399` | `--warning`: `#FBBF24` | `--danger`: `#F87171`

## 2. Responsive Breakpoints
- **Desktop (`>= 1200px`):** Fixed/collapsible left sidebar (`ANVAYROBO` brand + School pill + colorful icon nav + bottom note), top breadcrumb + session chip + notifications + profile/theme menu, main workspace with hero banners, KPI rows, and Quick Actions rail where applicable.
- **Tablet (`768px – 1199px`):** Collapsible/compact sidebar, 2-column KPI grids, horizontal-overflow-free tables, adaptive split/tabbed Report Studio.
- **Mobile (`< 768px`):** Native-app mobile header (hamburger + `ANVAYROBO` logo + notifications + profile), compact school pill, card-based Student Directory (instead of wide desktop tables), sticky bottom action bars, and **fixed Mobile Bottom Navigation** (`Home`, `Students`, `Marks`, `Reports`, `More` drawer for secondary modules + theme switcher).

## 3. Theme Persistence & No-Flash Strategy
- Support `light`, `dark`, and `system` preferences stored in `localStorage` (`srps-theme-mode`).
- Inline `<script>` in `client/index.html` `<head>` applies `dark-theme` / `data-theme="dark"` before first paint so zero theme flash occurs on load/refresh.
- Theme switcher available in Topbar Profile Menu & Mobile More drawer.

## 4. Restore & Rollback Guide
- **Git Rollback:** `git checkout main` (original production code at `d723ba3`) or `git reset --hard 333ec32` (checkpointed working tree).
- **Source Tarball Backup:** `/Users/krishna/.gemini/antigravity/brain/40d5bb03-97ea-473a-a995-f3321119e788/scratch/source-backup-pre-redesign.tar.gz`
- **Database Backup:** `/Users/krishna/.gemini/antigravity/brain/40d5bb03-97ea-473a-a995-f3321119e788/scratch/db-backup-pre-redesign/` (all 16 collections).
