# 🤖 GEMINI.md — Instructions & Contexte du Projet

## 🏗️ Projet : EcoGranulat Opti (Granulats Recyclés)

**Client :** Ali Maolida (Le Cuistot du Béton — [betonmalin.fr](https://betonmalin.fr))  
**Objectif :** Application web de pilotage de rentabilité et d'empreinte carbone pour la production de Granulats Recyclés (GR). Usage double : outil terrain quotidien pour Ali + outil de démo client.

**Production :** [https://ecogranulat-opti.vercel.app](https://ecogranulat-opti.vercel.app)  
**Repo :** `alitodorov/granulats-recycles`

---

## 👤 Profil d'Ali Maolida

Expert consultant et formateur béton & BTP, spécialisé dans :
- Formulation béton et pathologies des structures
- Granulats recyclés (NF EN 206, FD P18-011, DTU 21)
- Décarbonation et réduction d'empreinte CO₂ (FDES, Base Carbone ADEME, CERIB)
- Pédagogie active (classe inversée, gamification)
- Business consultant (offre, LinkedIn, formations hybrides)

**Valeurs clés :** Clarté, pragmatisme, impact positif, transmission, autonomie.  
**Email :** alimaolida@betonmalin.fr · **Timezone :** Europe/Paris

---

## ⚠️ Vocabulaire critique — NE JAMAIS CONFONDRE

| Terme | Signification | Contexte dans l'app |
|---|---|---|
| **GNR** | Gasoil Non Routier | Carburant des machines (concasseur, cribleur) |
| **GR** | Granulat Recyclé | Le produit qu'Ali fabrique et vend |

Ces deux acronymes coexistent dans le code. Toute confusion est une erreur bloquante.

---

## 🛠️ Stack Technique

| Couche | Technologie | Remarques |
|---|---|---|
| Frontend | HTML5 + Vanilla CSS + JavaScript | Pas de framework — performance maximale |
| Design | Glassmorphism + Dark Mode | Variables CSS, mobile-first, Inter (Google Fonts) |
| Photo de fond | `src/background.jpg` | Photo personnelle Ali — site GR avec arc-en-ciel |
| Base de données | Supabase (PostgreSQL) | 3 tables : simulations_theoriques, simulations_pratiques, empreintes_gr |
| Déploiement | Vercel | Auto-deploy depuis GitHub main |
| Serveur local | Nginx via Docker | `docker-compose up -d` → localhost:8080 |
| Versioning | Git / GitHub | `alitodorov/granulats-recycles` |

---

## 📂 Structure des fichiers

```text
.
├── vercel.json                      # Config déploiement Vercel
├── docker-compose.yml               # Nginx local
├── GEMINI.md                        # Ce fichier
├── README.md                        # Documentation projet complète
└── src/
    ├── index.html                   # Page principale : onglets + cartes + modal GNR
    ├── style.css                    # Design system complet
    ├── app.js                       # Logique calcul + Supabase + navigation
    ├── supabase.js                  # Client Supabase
    ├── app-pratique.js              # Logique page Rentabilité Pratique
    ├── rentabilite-pratique.html    # Page fiche chantier
    ├── background.jpg               # Photo de fond (NE PAS SUPPRIMER)
    ├── apple-touch-icon.png         # Icône mobile
    └── empreintes_gr_migration.sql  # Migration SQL table empreintes_gr
```

---

## 🧩 Architecture de l'application

### Navigation (3 onglets + mode démo)

```
Header
  └── .tab-nav
        ├── [🏭 Fabricant]     → tab-section[fabricant]  (actif par défaut)
        ├── [♻️ Production GR] → tab-section[production]
        ├── [🧪 Client]        → tab-section[client]
        └── [👁️ Mode Client]   → body.demo-mode (CSS toggle)
                                  Masque tout sauf .marmite-card + .mix-design-card
```

### Cartes par onglet

| Onglet | Cartes |
|---|---|
| `fabricant` | input-card, result-card, maintenance-card, trophies-card, history-card |
| `production` | empreinte-gr-card, marmite-card |
| `client` | mix-design-card |

### Flux de données inter-cartes

```
Empreinte GR (Module 3)
  └── [👨🏾‍🍳 Utiliser dans la Marmite]
        └── MIX_CO2.gr = co2PerTonne / 1000   ← injecté dynamiquement
              └── updateMarmite()              ← recalcule tout
```

---

## 🧩 Modules et fonctions clés

| Module | Fichier | Fonction(s) principale(s) |
|---|---|---|
| Calculateur Fabricant | `app.js` | `updateCalculations()` |
| Détail des charges | `app.js` | `updateBreakdown()` |
| Gamification | `app.js` | `updateGamification()` |
| Calculateur GNR modal | `app.js` | `calculateGnrModal()` |
| Empreinte GR | `app.js` | `updateEmpreinteGR()` |
| Marmite du Cuistot | `app.js` | `updateMarmite()` |
| Persistence Supabase simulations | `app.js` | `saveSimulation()`, `loadHistory()` |
| Persistence Supabase empreintes | `app.js` | `saveEmpreinte()`, `loadEmpreintesHistory()` |
| Navigation onglets + mode démo | `app.js` | IIFE en fin de fichier |
| Rentabilité pratique | `app-pratique.js` | `calculate()`, `savePratique()`, `loadHistoryP()` |

---

## 🗄️ Supabase

**URL :** `https://spozngvveozqcxgfecir.supabase.co`  
**Projet :** FDES — AWS eu-west-1  
**Fichier client :** `src/supabase.js`

### Tables

| Table | Colonnes clés |
|---|---|
| `simulations_theoriques` | name, buy_price, transport_dist, energy_cons, sell_price, exposure_class, substitution_rate, margin, co2 |
| `simulations_pratiques` | name, client_name, t_input, gnr_total, products (jsonb), ca_total, marge_brute |
| `empreintes_gr` | name, t_input, fuel_liters, dist_km, kwh, t_output, co2_machines, co2_transport, co2_total, co2_per_tonne, vs_ademe |

Migration `empreintes_gr` : exécuter `src/empreintes_gr_migration.sql` dans Supabase SQL Editor.

---

## 📐 Constantes CO₂ — Base Carbone ADEME / CERIB

```javascript
// Facteurs process (app.js → EMISSIONS)
GN_LITRE:            3.16    // kg CO2eq/L gasoil non routier (carburant machines)
TRANSPORT_KM_TONNE:  0.11    // kg CO2eq/km.tonne (camion 26t)
ELEC_KWH:            0.06    // kg CO2eq/kWh (mix France)

// Facteurs constituants béton (app.js → MIX_CO2, en kg CO2eq/kg)
ciment:    0.620   // CEM II/A Portland composé
sable:     0.0045  // Sable naturel 0/4
gravillon: 0.0038  // Gravillon naturel 4/20
gr:        0.0015  // GR par défaut ADEME (remplacé si Module 3 utilisé)
eau:       0.0003  // Eau efficace

// Référence ADEME GR (app.js → ADEME_GR_REF)
ADEME_GR_REF = 1.5  // kg CO2/t de Granulat Recyclé

// Limites substitution GR par classe (app.js → MIX_LIMITS)
X0: 100%, XC1: 30%, XC2: 30%, XC3: 20%, XF1: 20%, XA1: 0%
```

---

## 🧠 Système d'Agents

### Agents Stratégiques
- **orchestrateur** : Coordonne les interventions (démarrer ici si tâche complexe)
- **bm-orchestrateur** : Orchestrateur spécifique Béton Malin
- **brainstorming** : Exploration créative OBLIGATOIRE avant toute implémentation
- **bm-prd** : Spécifications techniques (toujours EN PREMIER pour nouvelle feature)
- **conseil-beton-malin** : Conseil 4 voix (Stratège · Technicien · Sceptique · Storyteller) synthétisé par Zoran S=(β·ΔCe)/λ

### Agents Métier
- **bm-architecte** : Structure technique, conventions, performance
- **bm-designer** : UI/UX, design system, maquettes
- **bm-frontend** : HTML, CSS vanilla, JS vanilla
- **bm-contenu** : Copywriting, voix de marque Ali
- **bm-seo** : Référencement, métadonnées, Schema.org
- **bm-qa** : Tests, validation, corrections avant livraison

---

## 📐 Conventions de Code

### CSS
- Variables dans `:root` (jamais de valeurs hardcodées)
- Classes sémantiques (`.card`, `.stat-item`, `.form-group`, `.tab-section`)
- Mobile-first (375px → 768px → 1440px)
- Commentaires par section (`/* ── Nom du module ──── */`)

### JavaScript
- Arrow functions (`const fn = () => {}`)
- Pas de `var` — uniquement `const` et `let`
- `updateCalculations()` : recalcule tout à chaque input (page principale)
- EMISSIONS + MIX_CO2 + MIX_LIMITS déclarés en haut du fichier
- Pas de dépendances externes (sauf Supabase CDN)

### HTML
- Sémantique : `<header>`, `<main>`, `<section>`, `<footer>`
- IDs uniques et descriptifs pour chaque élément interactif
- Inline styles évités sauf exceptions justifiées

---

## 🔑 Règles d'Or

1. **Vocabulaire** : GNR = gasoil, GR = granulat recyclé. Jamais confondre.
2. **Esthétique** : Glassmorphism + dark mode. Jamais de design générique.
3. **Autonomie** : Ne jamais demander à Ali de décisions techniques.
4. **Mobile-First** : Toujours tester 375px → 1440px.
5. **Données ADEME** : Toujours sourcer les données CO₂ (Base Carbone).
6. **Git** : Commit atomique après chaque feature, message clair.
7. **Photo de fond** : `src/background.jpg` — photo personnelle Ali, ne jamais supprimer.
8. **Flux de données** : Le pont Empreinte GR → Marmite (`MIX_CO2.gr`) est critique. Ne pas casser.

---

## ✅ État actuel — Livré

- [x] Calculateur Fabricant temps réel
- [x] Simulateur Client Mix-Design (NF EN 206)
- [x] Calculateur Rendement GNR (modal terrain)
- [x] Gamification complète (XP + niveaux + trophées)
- [x] Performance & Maintenance (usure mâchoires)
- [x] Module Empreinte GR (CO₂ réel de production par session)
- [x] La Marmite du Cuistot (comparateur béton naturel vs GR, limites NF EN 206)
- [x] Pont Empreinte GR → Marmite (facteur CO₂ dynamique)
- [x] Persistence Supabase (3 tables)
- [x] Page Rentabilité Pratique séparée
- [x] Navigation 3 onglets (Fabricant / Production GR / Client)
- [x] Mode démo Client (bascule CSS — vue épurée pour démo terrain)
- [x] Déploiement Vercel (auto-deploy depuis GitHub)
- [x] Rapport PDF

## 🔜 Prochaines étapes

- [ ] Module NF EN 206 complet (E/C, résistance, Dmax)
- [ ] Export CSV des simulations
- [ ] Module FDES complet
- [ ] Authentification Supabase (multi-utilisateurs)
- [ ] Intégration Notion/Airtable

---

**Mainteneur :** Ali Maolida — alimaolida@betonmalin.fr  
**Dernière mise à jour :** 5 mai 2026
