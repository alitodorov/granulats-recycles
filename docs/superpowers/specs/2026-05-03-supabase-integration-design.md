# Supabase Integration — EcoGranulat Opti

**Date:** 2026-05-03
**Status:** Approved
**Author:** Ali Maolida + Claude

## Context

EcoGranulat Opti has two calculator pages (theoretical + practical profitability) with no persistent storage. The "Save" button on index.html is a stub. Simulations are lost on page reload.

## Goal

Add cloud persistence via Supabase so Ali can save, reload, and compare simulations from both pages.

## Decisions

- **Single user** — no authentication, anon key used client-side
- **Both pages** — theoretical (index.html) and practical (rentabilite-pratique.html) simulations saved
- **Full CRUD + compare** — save, list, reload, delete, side-by-side comparison of 2 simulations

## Supabase Project

- **Ref:** xspozngvveozqcxgfecir
- **URL:** https://xspozngvveozqcxgfecir.supabase.co
- **Anon key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3puZ3Z2ZW96cWN4Z2ZlY2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTUxMTMsImV4cCI6MjA5MjUzMTExM30.YjjYxFtrDSivq3ss33AHjHS7SxnyRA4n0HDzZfmgWNs

## Database Schema

### Table: `simulations_theoriques`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Auto-generated |
| name | text | NOT NULL | User-given name |
| created_at | timestamptz | default now() | Auto timestamp |
| buy_price | numeric | | Redevance reception €/t |
| transport_dist | numeric | | Distance transport km |
| energy_cons | numeric | | Conso GNR L/t |
| sell_price | numeric | | Prix de vente €/t |
| exposure_class | text | | X0, XC1, XC2, XC3 |
| substitution_rate | numeric | | Taux de substitution % |
| margin | numeric | | Marge nette calculée €/t |
| co2 | numeric | | Impact CO2 calculé kg/t |

### Table: `simulations_pratiques`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Auto-generated |
| name | text | NOT NULL | User-given name |
| created_at | timestamptz | default now() | Auto timestamp |
| client_name | text | | Entreprise / Exploitant |
| client_period | text | | Période analysée |
| client_site | text | | Site / Chantier |
| t_input | numeric | | Tonnes déblais reçus |
| redevance | numeric | | €/t encaissé |
| distance | numeric | | km transport amont |
| transport_cost | numeric | | €/t transport |
| hours | numeric | | Heures machine |
| gnr_total | numeric | | Litres GNR consommés |
| gnr_price | numeric | | €/L GNR |
| products | jsonb | | [{name, prod, sold, price} x4] |
| labor | numeric | | Main d'œuvre € |
| machine | numeric | | Location/Amortissement € |
| maintenance | numeric | | Entretien/Usure € |
| other_charges | numeric | | Autres charges € |
| observations | text | | Notes terrain |
| ca_total | numeric | | CA total calculé |
| marge_brute | numeric | | Résultat net calculé |

### Row Level Security

Both tables: RLS enabled with a single policy allowing all operations for the anon role. Acceptable for single-user usage.

```sql
ALTER TABLE simulations_theoriques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON simulations_theoriques FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE simulations_pratiques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON simulations_pratiques FOR ALL USING (true) WITH CHECK (true);
```

## File Architecture

```
src/
├── supabase.js                ← Supabase client init (CDN import + createClient)
├── app.js                     ← Modified: add save/load/delete/compare for theoretical
├── app-pratique.js            ← New: extracted JS for practical page + save/load/delete/compare
├── index.html                 ← Modified: add Supabase CDN, supabase.js, compare panel
└── rentabilite-pratique.html  ← Modified: add Supabase CDN, supabase.js, app-pratique.js, compare panel
```

## Features per Page

### 1. Save (both pages)

- Click "Sauvegarder" button
- Prompt dialog asks for simulation name (default: "Simulation DD/MM/YYYY HH:mm")
- Collect all input field values + computed results
- Insert into Supabase table
- Show success toast notification

### 2. History List (both pages)

- On page load: fetch all simulations ordered by created_at DESC
- Render in the "Historique & Archives" section (already exists in HTML)
- Each entry shows: name, date, key KPI (margin for theoretical, marge_brute for practical)
- Actions per entry: Reload, Compare checkbox, Delete

### 3. Reload (both pages)

- Click reload icon on a history entry
- Fill all form inputs with saved values
- Trigger recalculation

### 4. Compare (both pages)

- Select exactly 2 simulations via checkboxes
- "Comparer" button appears when 2 are selected
- Opens a comparison panel below the history showing side-by-side:
  - Theoretical: name, date, margin, CO2, cost price
  - Practical: name, date, CA total, marge brute, rendement matière, conso GNR L/t, CO2 saved
- Differences highlighted (green = better, red = worse)

### 5. Delete (both pages)

- Click trash icon on a history entry
- Confirm dialog
- Delete from Supabase
- Remove from DOM

## UI Components

### Toast Notification

Temporary bottom-right notification for save/delete confirmation. CSS-only animation, auto-dismiss after 3 seconds.

### Compare Panel

A new card below the history section. Grid layout: 3 columns (label | sim A | sim B). Same visual style as existing cards (glassmorphism on index.html, report style on practical page).

## Integration with Supabase CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## No Backend Required

All operations go directly from browser to Supabase via the JS client. The anon key is designed for client-side use.
