# Supabase Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase cloud persistence to both EcoGranulat Opti calculator pages (save, load, delete, compare simulations).

**Architecture:** Supabase JS client loaded via CDN. Shared `supabase.js` module initializes the client. Each page gets its own persistence logic file (`app.js` extended, `app-pratique.js` new). No backend — browser talks to Supabase directly via anon key.

**Tech Stack:** Supabase JS v2 (CDN), vanilla JS, existing HTML/CSS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/supabase.js` | Create | Initialize Supabase client, export it |
| `src/app.js` | Modify | Add save/load/delete/compare for theoretical sims |
| `src/app-pratique.js` | Create | All JS for practical page: calculate + save/load/delete/compare |
| `src/index.html` | Modify | Add CDN script, supabase.js script, compare panel HTML, toast HTML |
| `src/rentabilite-pratique.html` | Modify | Add CDN script, supabase.js script, app-pratique.js, history section, compare panel, toast |
| `src/style.css` | Modify | Add toast, history, and compare panel styles for index.html |

---

## Chunk 1: Database Setup & Supabase Client

### Task 1: Create Supabase tables via SQL

**Files:**
- Reference: `docs/superpowers/specs/2026-05-03-supabase-integration-design.md`

- [ ] **Step 1: Create `simulations_theoriques` table**

Go to Supabase Dashboard → SQL Editor and run:

```sql
CREATE TABLE simulations_theoriques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  buy_price numeric,
  transport_dist numeric,
  energy_cons numeric,
  sell_price numeric,
  exposure_class text,
  substitution_rate numeric,
  margin numeric,
  co2 numeric
);

ALTER TABLE simulations_theoriques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON simulations_theoriques FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Create `simulations_pratiques` table**

```sql
CREATE TABLE simulations_pratiques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  client_name text,
  client_period text,
  client_site text,
  t_input numeric,
  redevance numeric,
  distance numeric,
  transport_cost numeric,
  hours numeric,
  gnr_total numeric,
  gnr_price numeric,
  products jsonb,
  labor numeric,
  machine numeric,
  maintenance numeric,
  other_charges numeric,
  observations text,
  ca_total numeric,
  marge_brute numeric
);

ALTER TABLE simulations_pratiques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON simulations_pratiques FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 3: Verify tables exist**

Run in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
Expected: both `simulations_theoriques` and `simulations_pratiques` appear.

---

### Task 2: Create `supabase.js` client module

**Files:**
- Create: `src/supabase.js`

- [ ] **Step 1: Create the file**

```js
const SUPABASE_URL = 'https://xspozngvveozqcxgfecir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3puZ3Z2ZW96cWN4Z2ZlY2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTUxMTMsImV4cCI6MjA5MjUzMTExM30.YjjYxFtrDSivq3ss33AHjHS7SxnyRA4n0HDzZfmgWNs';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] **Step 2: Commit**

```bash
git add src/supabase.js
git commit -m "feat: add Supabase client init module"
```

---

## Chunk 2: Theoretical Page — Save, Load, Delete

### Task 3: Add scripts and toast HTML to `index.html`

**Files:**
- Modify: `src/index.html`

- [ ] **Step 1: Add Supabase CDN + supabase.js before app.js (line 201)**

Replace:
```html
    <script src="app.js"></script>
```

With:
```html
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="supabase.js"></script>
    <script src="app.js"></script>
```

- [ ] **Step 2: Add toast container before closing `</body>`**

Insert before the new `<script>` tags:
```html
    <div id="toast" class="toast"></div>
```

- [ ] **Step 3: Update history card subtitle (line 149)**

Replace:
```html
                    <p class="card-subtitle">Retrouvez vos précédentes simulations enregistrées localement.</p>
```

With:
```html
                    <p class="card-subtitle">Retrouvez vos simulations enregistrées dans le cloud.</p>
                    <div id="compare-bar" class="compare-bar" style="display:none;">
                        <button id="btn-compare" class="btn-primary" style="padding:10px 20px;font-size:0.85rem;">⚖️ Comparer les 2 sélections</button>
                    </div>
```

- [ ] **Step 4: Add compare panel after history-list div (after line 153)**

Insert after the `</div>` of `#history-list`:
```html
                    <div id="compare-panel" class="compare-panel" style="display:none;"></div>
```

- [ ] **Step 5: Commit**

```bash
git add src/index.html
git commit -m "feat: add Supabase CDN, toast, compare UI to index.html"
```

---

### Task 4: Add toast + history + compare styles to `style.css`

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: Append styles at end of file**

```css
/* ── TOAST ─────────────────────────────────────────── */
.toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: var(--success);
    color: #fff;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    z-index: 2000;
    pointer-events: none;
}
.toast.show {
    opacity: 1;
    transform: translateY(0);
}
.toast.error {
    background: var(--danger);
}

/* ── COMPARE BAR ───────────────────────────────────── */
.compare-bar {
    margin-bottom: 15px;
    text-align: center;
}

/* ── COMPARE PANEL ─────────────────────────────────── */
.compare-panel {
    margin-top: 20px;
    padding: 25px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 18px;
    border: 1px solid var(--glass-border);
}
.compare-panel table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}
.compare-panel th {
    text-align: left;
    padding: 8px 12px;
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid var(--glass-border);
}
.compare-panel td {
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}
.compare-panel td:not(:first-child) {
    text-align: right;
    font-weight: 600;
}
.compare-better { color: var(--success); }
.compare-worse { color: var(--danger); }

@media print {
    .toast, .compare-bar, .compare-panel { display: none !important; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/style.css
git commit -m "feat: add toast, compare bar and panel styles"
```

---

### Task 5: Implement save/load/delete/compare in `app.js`

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: Add helper functions at end of `app.js` (after line 187)**

```js
// ── SUPABASE PERSISTENCE ─────────────────────────────
const TABLE = 'simulations_theoriques';

function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = isError ? 'toast error show' : 'toast show';
    setTimeout(() => t.className = 'toast', 3000);
}

function collectData() {
    const buyPrice = parseFloat(document.getElementById('buy-price').value) || 0;
    const transportDist = parseFloat(document.getElementById('transport-dist').value) || 0;
    const energyCons = parseFloat(document.getElementById('energy-cons').value) || 0;
    const sellPrice = parseFloat(document.getElementById('sell-price').value) || 0;
    const exposureClass = document.getElementById('exposure-class').value;
    const substitutionRate = parseFloat(document.getElementById('substitution-rate').value) || 0;

    const transportCost = 0;
    const energyCost = energyCons * 1.2;
    const costPrice = (-buyPrice) + transportCost + energyCost + 2;
    const margin = sellPrice - costPrice;
    const co2Transport = transportDist * EMISSIONS.TRANSPORT_KM_TONNE;
    const co2Energy = energyCons * EMISSIONS.GN_LITRE;
    const co2 = co2Transport + co2Energy;

    return {
        buy_price: buyPrice,
        transport_dist: transportDist,
        energy_cons: energyCons,
        sell_price: sellPrice,
        exposure_class: exposureClass,
        substitution_rate: substitutionRate,
        margin: parseFloat(margin.toFixed(2)),
        co2: parseFloat(co2.toFixed(2))
    };
}

function loadDataIntoForm(row) {
    document.getElementById('buy-price').value = row.buy_price ?? 10;
    document.getElementById('transport-dist').value = row.transport_dist ?? 20;
    document.getElementById('energy-cons').value = row.energy_cons ?? 0.8;
    document.getElementById('sell-price').value = row.sell_price ?? 18;
    document.getElementById('exposure-class').value = row.exposure_class ?? 'X0';
    document.getElementById('substitution-rate').value = row.substitution_rate ?? 15;
    document.getElementById('rate-display').innerText = row.substitution_rate ?? 15;
    updateCalculations();
}

async function saveSimulation() {
    const defaultName = 'Simulation ' + new Date().toLocaleString('fr-FR');
    const name = prompt('Nom de la simulation :', defaultName);
    if (!name) return;

    const data = { name, ...collectData() };
    const { error } = await supabase.from(TABLE).insert(data);
    if (error) { showToast('Erreur : ' + error.message, true); return; }
    showToast('✓ Simulation sauvegardée');
    loadHistory();
}

async function deleteSimulation(id) {
    if (!confirm('Supprimer cette simulation ?')) return;
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) { showToast('Erreur : ' + error.message, true); return; }
    showToast('Simulation supprimée');
    loadHistory();
}

let selectedForCompare = [];

function toggleCompare(id) {
    const idx = selectedForCompare.indexOf(id);
    if (idx > -1) {
        selectedForCompare.splice(idx, 1);
    } else {
        if (selectedForCompare.length >= 2) selectedForCompare.shift();
        selectedForCompare.push(id);
    }
    document.querySelectorAll('.history-item').forEach(el => {
        el.classList.toggle('selected', selectedForCompare.includes(el.dataset.id));
    });
    document.getElementById('compare-bar').style.display = selectedForCompare.length === 2 ? 'block' : 'none';
}

async function showCompare() {
    if (selectedForCompare.length !== 2) return;
    const { data } = await supabase.from(TABLE).select('*').in('id', selectedForCompare);
    if (!data || data.length !== 2) return;

    const [a, b] = data;
    const rows = [
        ['Nom', a.name, b.name],
        ['Date', new Date(a.created_at).toLocaleDateString('fr-FR'), new Date(b.created_at).toLocaleDateString('fr-FR')],
        ['Marge nette', a.margin, b.margin, '€/t', 'higher'],
        ['Impact CO2', a.co2, b.co2, 'kg/t', 'lower'],
        ['Redevance', a.buy_price, b.buy_price, '€/t', 'higher'],
        ['Prix vente', a.sell_price, b.sell_price, '€/t', 'higher'],
        ['Conso GNR', a.energy_cons, b.energy_cons, 'L/t', 'lower'],
    ];

    let html = '<table><tr><th>Indicateur</th><th>' + a.name + '</th><th>' + b.name + '</th></tr>';
    rows.forEach(([label, va, vb, unit, dir]) => {
        let ca = '', cb = '';
        if (dir && typeof va === 'number') {
            const better = dir === 'higher' ? va > vb : va < vb;
            const worse = dir === 'higher' ? va < vb : va > vb;
            ca = better ? 'compare-better' : (worse ? 'compare-worse' : '');
            cb = !better && worse ? '' : (worse ? 'compare-better' : (better ? '' : ''));
            cb = dir === 'higher' ? (vb > va ? 'compare-better' : (vb < va ? 'compare-worse' : '')) : (vb < va ? 'compare-better' : (vb > va ? 'compare-worse' : ''));
            va = va.toFixed(2) + ' ' + unit;
            vb = vb.toFixed(2) + ' ' + unit;
        }
        html += '<tr><td>' + label + '</td><td class="' + ca + '">' + va + '</td><td class="' + cb + '">' + vb + '</td></tr>';
    });
    html += '</table>';
    const panel = document.getElementById('compare-panel');
    panel.innerHTML = html;
    panel.style.display = 'block';
}

async function loadHistory() {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    const list = document.getElementById('history-list');

    if (error || !data || data.length === 0) {
        list.innerHTML = '<p class="empty-state">Aucune simulation enregistrée pour le moment.</p>';
        return;
    }

    list.innerHTML = data.map(row => {
        const date = new Date(row.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const marginClass = row.margin >= 0 ? 'color:var(--success)' : 'color:var(--danger)';
        return `
        <div class="history-item" data-id="${row.id}" onclick="toggleCompare('${row.id}')">
            <div class="history-info">
                <span class="history-name">${row.name}</span>
                <span class="history-date">${date}</span>
            </div>
            <span style="font-weight:700;${marginClass}">${row.margin?.toFixed(2) ?? '—'} €/t</span>
            <div class="history-actions">
                <button class="btn-icon" title="Recharger" onclick="event.stopPropagation();loadSim('${row.id}')">↻</button>
                <button class="btn-icon delete" title="Supprimer" onclick="event.stopPropagation();deleteSimulation('${row.id}')">🗑</button>
            </div>
        </div>`;
    }).join('');
}

async function loadSim(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error || !data) { showToast('Erreur chargement', true); return; }
    loadDataIntoForm(data);
    showToast('✓ Simulation chargée : ' + data.name);
}

// Wire up save button
document.getElementById('save-simulation').addEventListener('click', saveSimulation);

// Wire up compare button
document.getElementById('btn-compare').addEventListener('click', showCompare);

// Load history on page load
loadHistory();
```

- [ ] **Step 2: Commit**

```bash
git add src/app.js
git commit -m "feat: add Supabase save/load/delete/compare to theoretical page"
```

---

## Chunk 3: Practical Page — Save, Load, Delete, Compare

### Task 6: Create `app-pratique.js`

**Files:**
- Create: `src/app-pratique.js`

- [ ] **Step 1: Create the file with full persistence logic**

```js
const TABLE_P = 'simulations_pratiques';

function showToastP(msg, isError = false) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = isError ? 'toast error show' : 'toast show';
    setTimeout(() => t.className = 'toast', 3000);
}

function collectPratiqueData() {
    const g = (id) => parseFloat(document.getElementById(id).value) || 0;
    const t = (id) => document.getElementById(id).value || '';

    const products = [
        { name: 'GNR 0/31,5', prod: g('p1-prod'), sold: g('p1-sold'), price: g('p1-price') },
        { name: 'GNR 0/63', prod: g('p2-prod'), sold: g('p2-sold'), price: g('p2-price') },
        { name: 'Graves 0/80', prod: g('p3-prod'), sold: g('p3-sold'), price: g('p3-price') },
        { name: 'Refus', prod: g('p4-prod'), sold: g('p4-sold'), price: g('p4-price') },
    ];

    const tIn = g('t-input');
    const redevance = g('redevance');
    const ventes = products.reduce((s, p) => s + p.sold * p.price, 0);
    const gnrCost = g('gnr-total') * g('gnr-price');
    const transportT = tIn * g('transport-cost');
    const totalCharges = gnrCost + transportT + g('labor') + g('machine') + g('maintenance') + g('other-charges');
    const totalCA = tIn * redevance + ventes;

    return {
        client_name: t('client-name'),
        client_period: t('client-period'),
        client_site: t('client-site'),
        t_input: tIn,
        redevance: redevance,
        distance: g('distance'),
        transport_cost: g('transport-cost'),
        hours: g('hours'),
        gnr_total: g('gnr-total'),
        gnr_price: g('gnr-price'),
        products: products,
        labor: g('labor'),
        machine: g('machine'),
        maintenance: g('maintenance'),
        other_charges: g('other-charges'),
        observations: t('observations'),
        ca_total: parseFloat(totalCA.toFixed(2)),
        marge_brute: parseFloat((totalCA - totalCharges).toFixed(2))
    };
}

function loadPratiqueIntoForm(row) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    set('client-name', row.client_name);
    set('client-period', row.client_period);
    set('client-site', row.client_site);
    set('t-input', row.t_input);
    set('redevance', row.redevance);
    set('distance', row.distance);
    set('transport-cost', row.transport_cost);
    set('hours', row.hours);
    set('gnr-total', row.gnr_total);
    set('gnr-price', row.gnr_price);
    if (row.products && row.products.length === 4) {
        row.products.forEach((p, i) => {
            const n = i + 1;
            set('p' + n + '-prod', p.prod);
            set('p' + n + '-sold', p.sold);
            set('p' + n + '-price', p.price);
        });
    }
    set('labor', row.labor);
    set('machine', row.machine);
    set('maintenance', row.maintenance);
    set('other-charges', row.other_charges);
    set('observations', row.observations);
    calculate();
}

async function savePratique() {
    const defaultName = 'Pratique ' + new Date().toLocaleString('fr-FR');
    const name = prompt('Nom de la simulation :', defaultName);
    if (!name) return;
    const data = { name, ...collectPratiqueData() };
    const { error } = await supabase.from(TABLE_P).insert(data);
    if (error) { showToastP('Erreur : ' + error.message, true); return; }
    showToastP('✓ Simulation sauvegardée');
    loadHistoryP();
}

async function deletePratique(id) {
    if (!confirm('Supprimer cette simulation ?')) return;
    const { error } = await supabase.from(TABLE_P).delete().eq('id', id);
    if (error) { showToastP('Erreur : ' + error.message, true); return; }
    showToastP('Simulation supprimée');
    loadHistoryP();
}

let selectedP = [];

function toggleCompareP(id) {
    const idx = selectedP.indexOf(id);
    if (idx > -1) { selectedP.splice(idx, 1); } else {
        if (selectedP.length >= 2) selectedP.shift();
        selectedP.push(id);
    }
    document.querySelectorAll('.history-item').forEach(el => {
        el.classList.toggle('selected', selectedP.includes(el.dataset.id));
    });
    const bar = document.getElementById('compare-bar-p');
    if (bar) bar.style.display = selectedP.length === 2 ? 'block' : 'none';
}

async function showCompareP() {
    if (selectedP.length !== 2) return;
    const { data } = await supabase.from(TABLE_P).select('*').in('id', selectedP);
    if (!data || data.length !== 2) return;
    const [a, b] = data;
    const euro = (v) => (v ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
    const rows = [
        ['Nom', a.name, b.name],
        ['Client', a.client_name || '—', b.client_name || '—'],
        ['CA Total', a.ca_total, b.ca_total, '€', 'higher'],
        ['Marge Brute', a.marge_brute, b.marge_brute, '€', 'higher'],
        ['Tonnes reçues', a.t_input, b.t_input, 't', 'higher'],
        ['Conso GNR', a.gnr_total, b.gnr_total, 'L', 'lower'],
    ];
    let html = '<table><tr><th>Indicateur</th><th>' + a.name + '</th><th>' + b.name + '</th></tr>';
    rows.forEach(([label, va, vb, unit, dir]) => {
        let ca = '', cb = '';
        if (dir && typeof va === 'number') {
            ca = (dir === 'higher' ? va > vb : va < vb) ? 'compare-better' : (va === vb ? '' : 'compare-worse');
            cb = (dir === 'higher' ? vb > va : vb < va) ? 'compare-better' : (va === vb ? '' : 'compare-worse');
            va = va.toFixed(0) + ' ' + unit;
            vb = vb.toFixed(0) + ' ' + unit;
        }
        html += '<tr><td>' + label + '</td><td class="' + ca + '">' + va + '</td><td class="' + cb + '">' + vb + '</td></tr>';
    });
    html += '</table>';
    const panel = document.getElementById('compare-panel-p');
    if (panel) { panel.innerHTML = html; panel.style.display = 'block'; }
}

async function loadPratiqueSim(id) {
    const { data, error } = await supabase.from(TABLE_P).select('*').eq('id', id).single();
    if (error || !data) { showToastP('Erreur chargement', true); return; }
    loadPratiqueIntoForm(data);
    showToastP('✓ Simulation chargée : ' + data.name);
}

async function loadHistoryP() {
    const { data, error } = await supabase.from(TABLE_P).select('*').order('created_at', { ascending: false });
    const list = document.getElementById('history-list-p');
    if (!list) return;

    if (error || !data || data.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--muted);font-style:italic;padding:20px;">Aucune simulation enregistrée.</p>';
        return;
    }

    list.innerHTML = data.map(row => {
        const date = new Date(row.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const margeColor = (row.marge_brute ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)';
        return `
        <div class="history-item" data-id="${row.id}" onclick="toggleCompareP('${row.id}')" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:background 0.2s;">
            <div style="display:flex;flex-direction:column;">
                <strong style="font-size:0.9rem;">${row.name}</strong>
                <span style="font-size:0.72rem;color:var(--muted);">${date}${row.client_name ? ' · ' + row.client_name : ''}</span>
            </div>
            <span style="font-weight:700;color:${margeColor};font-size:0.95rem;">${(row.marge_brute ?? 0).toLocaleString('fr-FR', {maximumFractionDigits:0})} €</span>
            <div style="display:flex;gap:6px;">
                <button onclick="event.stopPropagation();loadPratiqueSim('${row.id}')" style="background:var(--navy);color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.78rem;">↻</button>
                <button onclick="event.stopPropagation();deletePratique('${row.id}')" style="background:var(--danger);color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.78rem;">🗑</button>
            </div>
        </div>`;
    }).join('');
}

// Init on load
loadHistoryP();
```

- [ ] **Step 2: Commit**

```bash
git add src/app-pratique.js
git commit -m "feat: create app-pratique.js with Supabase persistence"
```

---

### Task 7: Add history section, scripts, and save button to `rentabilite-pratique.html`

**Files:**
- Modify: `src/rentabilite-pratique.html`

- [ ] **Step 1: Add save button in the controls bar**

After the "Exporter en PDF" button (line 605), add:
```html
    <button class="btn-print" onclick="savePratique()" style="background:var(--success);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      Sauvegarder
    </button>
```

- [ ] **Step 2: Add history section before the report footer band (before line 936)**

Insert before `<div class="report-footer-band">`:
```html
      <!-- ── 7. HISTORIQUE ─────────────────────────────────── -->
      <div class="section">
        <div class="section-title">
          <div class="section-icon">7</div>
          Historique & Archives
        </div>
        <div id="compare-bar-p" class="compare-bar" style="display:none;">
          <button onclick="showCompareP()" style="background:var(--navy);color:#fff;border:none;padding:10px 20px;border-radius:6px;font-weight:600;cursor:pointer;">⚖️ Comparer les 2 sélections</button>
        </div>
        <div id="history-list-p" style="display:grid;gap:10px;">
          <p style="text-align:center;color:var(--muted);font-style:italic;padding:20px;">Aucune simulation enregistrée.</p>
        </div>
        <div id="compare-panel-p" style="display:none;margin-top:20px;padding:20px;background:#f5f3ee;border-radius:6px;border:1px solid var(--border);"></div>
      </div>
```

- [ ] **Step 3: Add toast + scripts before closing `</body>` (before line 1099)**

Insert before `</body>`:
```html
<div id="toast" style="position:fixed;bottom:30px;right:30px;background:#1a6e46;color:#fff;padding:14px 24px;border-radius:12px;font-size:0.9rem;font-weight:600;opacity:0;transform:translateY(20px);transition:all 0.3s;z-index:2000;pointer-events:none;"></div>
<style>.toast.show{opacity:1!important;transform:translateY(0)!important;}.toast.error{background:#b92828!important;}</style>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase.js"></script>
<script src="app-pratique.js"></script>
```

- [ ] **Step 4: Add `.history-item.selected` style in the practical page's print section**

In the `<style>` block, before `@media print`, add:
```css
    .history-item.selected { border-color: var(--gold) !important; background: #fffdf7 !important; }
    .compare-better { color: var(--success); font-weight: 700; }
    .compare-worse { color: var(--danger); font-weight: 700; }
```

- [ ] **Step 5: Add print rule to hide history + toast**

In the `@media print` block, add:
```css
      .section:last-of-type, #toast, .compare-bar, #compare-panel-p { display: none !important; }
```

- [ ] **Step 6: Commit**

```bash
git add src/rentabilite-pratique.html
git commit -m "feat: add Supabase persistence UI to practical page"
```

---

## Chunk 4: Final Verification

### Task 8: Test the full flow

- [ ] **Step 1: Restart Docker**

```bash
cd "/Users/alimaolida/Projets/Granulats recycles" && docker-compose restart
```

- [ ] **Step 2: Test theoretical page save/load**

Open http://localhost:8080/
1. Change some values (buy-price=12, sell-price=22)
2. Click "Sauvegarder" → enter name → check toast appears
3. Check history shows the new entry
4. Reset values to defaults
5. Click ↻ on the saved entry → verify form fills back

- [ ] **Step 3: Test practical page save/load**

Open http://localhost:8080/rentabilite-pratique.html
1. Fill client info + change some values
2. Click "Sauvegarder" → enter name → check toast
3. Check history section shows entry
4. Reset → click ↻ → verify reload works

- [ ] **Step 4: Test compare on both pages**

1. Save 2 different simulations on each page
2. Click both entries to select them
3. Click "Comparer" → verify table shows with green/red highlights

- [ ] **Step 5: Test delete**

Click 🗑 on an entry → confirm → verify it disappears

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Supabase integration — save, load, delete, compare on both pages"
```
