# 🏗️ EcoGranulat Opti — Documentation Projet

**Application web** de pilotage de rentabilité et d'empreinte carbone pour la production de Granulats Recyclés (GR).  
Outil stratégique d'Ali Maolida (Béton Malin) — usage terrain + démo client.

**Production :** [https://ecogranulat-opti.vercel.app](https://ecogranulat-opti.vercel.app)  
**Repo :** [https://github.com/alitodorov/granulats-recycles](https://github.com/alitodorov/granulats-recycles)

---

## 🚀 Démarrage Rapide

Site statique — ouvrir `src/index.html` dans un navigateur ou déployer via Vercel.

```bash
# Développement local
docker-compose up -d   # Nginx sur http://localhost:8080

# Déploiement production
vercel --prod          # Vercel CLI (déjà configuré)
```

---

## 🛠️ Stack Technique

| Technologie | Usage |
|---|---|
| HTML5 + CSS Vanilla + JS Vanilla | Frontend complet — pas de framework |
| Supabase (PostgreSQL) | Persistence cloud des simulations |
| Vercel | Déploiement automatique depuis GitHub |
| Git / GitHub | `alitodorov/granulats-recycles` |

---

## 📂 Structure des fichiers

```text
.
├── vercel.json                      # Config déploiement Vercel
├── docker-compose.yml               # Serveur local Nginx
├── GEMINI.md                        # Instructions IA Antigravity
├── README.md                        # Cette documentation
└── src/
    ├── index.html                   # Page principale (dashboard + onglets + modal)
    ├── style.css                    # Design system complet (glassmorphism, dark mode)
    ├── app.js                       # Logique calcul + gamification + navigation
    ├── supabase.js                  # Client Supabase (URL + anon key)
    ├── app-pratique.js              # Logique page Rentabilité Pratique
    ├── rentabilite-pratique.html    # Page fiche pratique par chantier
    ├── background.jpg               # Photo de fond personnelle Ali (arc-en-ciel GR)
    ├── apple-touch-icon.png         # Icône mobile
    └── empreintes_gr_migration.sql  # Migration SQL table empreintes_gr
```

---

## 🧩 Modules de l'application

### Navigation

L'app est organisée en **3 onglets** + **1 mode démo** :

| Onglet | Icône | Contenu |
|---|---|---|
| Fabricant | 🏭 | Rentabilité, Performance, Maintenance, Gamification, Historique |
| Production GR | ♻️ | Empreinte CO₂ de production + La Marmite du Cuistot |
| Client | 🧪 | Simulateur Mix-Design NF EN 206 |
| **Mode Client** | 👁️ | Bascule vue démo : Marmite + Mix-Design uniquement |

---

### Module 1 — Calculateur Fabricant (`🏭 Fabricant`)

Calcul en temps réel :
- **Coût de revient** (redevance réception − gasoil − frais fixes)
- **Marge nette** (€/t) avec alerte rouge si négative
- **Empreinte CO₂ production** (transport amont + gasoil concasseur)
- **Détail des charges** visible sous les résultats
- **Tip dynamique du Cuistot** selon la marge et la conso gasoil

### Module 2 — Performance & Maintenance (`🏭 Fabricant`)

- Tonnage cumulé mâchoires
- Barre d'usure mâchoires avec alerte à 85 % (modifiable)
- Rendement gasoil (L/t) avec alerte > 0.9 L/t
- **Calculateur Rendement GNR** (modal) : L consommés / T produites → L/t + t/h

### Module 3 — Mon Empreinte GR (`♻️ Production GR`)

Calcule le **CO₂ réel par tonne** de GR produit par Ali :
- Intrants : tonnage reçu, gasoil concasseur (L), distance transport, kWh
- Sorties : CO₂ machines / transport / total / **kg CO₂/t GR**
- Badge ADEME : compare au référentiel 1,5 kg CO₂/t (vert si Ali fait mieux)
- Sauvegarde en Supabase → historique des sessions de concassage
- **Bouton "Utiliser dans la Marmite"** : injecte le vrai facteur d'émission d'Ali

### Module 4 — La Marmite du Cuistot (`♻️ Production GR`)

Comparateur béton naturel vs béton avec GR :
- Sélection classe d'exposition (NF EN 206 : X0, XC1, XC2, XC3, XF1, XA1)
- Curseur GR **bloqué à la limite normative** selon la classe
- Calcul CO₂/m³ béton naturel vs béton avec GR + économie en %
- Jauge animée verte/orange/rouge selon l'économie
- Le facteur GR est soit ADEME (1,5 kg/t) soit le **chiffre réel d'Ali** (Module 3)

### Module 5 — Simulateur Client Mix-Design (`🧪 Client`)

- Classe d'exposition + taux de substitution
- **Gain économique client** (€/m³)
- **Économie CO₂** (kg/m³) vs granulat naturel

### Module 6 — Gamification (`🏭 Fabricant`)

- Barre XP + 5 niveaux (Apprenti Recycleur → Légende du Béton Malin)
- 3 trophées : 🌱 Eco-Warrior · 💰 Master Margin · ⛽ As du Volant

### Module 7 — Historique & Archives (`🏭 Fabricant`)

- Sauvegarde des simulations théoriques dans Supabase (`simulations_theoriques`)
- Comparaison de 2 simulations côte à côte

### Module 8 — Rentabilité Pratique (`rentabilite-pratique.html`)

Page séparée — fiche par chantier réel :
- Saisie par produit (GNR 0/31,5 · 0/63 · Graves 0/80 · Refus)
- CA total, marge brute, charges détaillées
- Sauvegarde Supabase (`simulations_pratiques`)

---

## 🗄️ Supabase — Tables

| Table | Contenu |
|---|---|
| `simulations_theoriques` | Simulations page principale |
| `simulations_pratiques` | Fiches rentabilité pratique |
| `empreintes_gr` | Sessions de concassage CO₂ (migration : `empreintes_gr_migration.sql`) |

**URL projet** : `https://spozngvveozqcxgfecir.supabase.co`  
**Projet Supabase** : FDES (AWS eu-west-1)

---

## 📐 Constantes CO₂ (Base Carbone ADEME / CERIB)

```javascript
// Facteurs émission process
EMISSIONS.GN_LITRE          = 3.16   // kg CO2eq/L gasoil non routier (machines)
EMISSIONS.TRANSPORT_KM_TONNE = 0.11  // kg CO2eq/km.tonne (camion 26t)
EMISSIONS.ELEC_KWH           = 0.06  // kg CO2eq/kWh (mix France)

// Facteurs émission constituants béton (kg CO2eq/kg)
MIX_CO2.ciment    = 0.620   // CEM II/A
MIX_CO2.sable     = 0.0045  // Sable naturel 0/4
MIX_CO2.gravillon = 0.0038  // Gravillon naturel 4/20
MIX_CO2.gr        = 0.0015  // Granulat Recyclé (dynamique si Module 3 utilisé)
MIX_CO2.eau       = 0.0003  // Eau efficace

// Référence ADEME granulat recyclé
ADEME_GR_REF = 1.5  // kg CO2/t GR
```

---

## 🎨 Design

- **Glassmorphism** : `backdrop-filter: blur`, bordures semi-transparentes
- **Dark Mode** : palette `#0f172a`, tokens CSS dans `:root`
- **Photo de fond** : `src/background.jpg` — arc-en-ciel sur site GR (photo Ali)
- **Mobile-First** : 375px → 768px → 1440px
- **Police** : Inter (Google Fonts)

---

## ✅ Fonctionnalités livrées

- [x] Calculateur Fabricant temps réel
- [x] Simulateur Client Mix-Design (NF EN 206)
- [x] Calculateur Rendement GNR (modal terrain)
- [x] Gamification complète (XP + niveaux + trophées)
- [x] Performance & Maintenance (usure mâchoires)
- [x] Module Empreinte GR (CO₂ réel de production)
- [x] La Marmite du Cuistot (comparateur béton naturel vs GR)
- [x] Pont Empreinte GR → Marmite (injection facteur réel)
- [x] Persistence Supabase (simulations_theoriques + simulations_pratiques + empreintes_gr)
- [x] Page Rentabilité Pratique séparée
- [x] Navigation 3 onglets (Fabricant / Production GR / Client)
- [x] Mode démo Client (bascule CSS)
- [x] Déploiement Vercel (auto-deploy depuis GitHub)
- [x] Rapport PDF (`window.print()`)
- [x] Photo de fond personnelle Ali

## 🔜 Prochaines étapes suggérées

- [ ] Module NF EN 206 complet (E/C, résistance, Dmax)
- [ ] Export CSV des simulations
- [ ] Module FDES complet (calcul empreinte environnementale)
- [ ] Intégration Notion/Airtable pour sync des données
- [ ] Authentification Supabase (multi-utilisateurs)

---

**Mainteneur** : Ali Maolida — alimaolida@betonmalin.fr — [betonmalin.fr](https://betonmalin.fr)  
**Dernière mise à jour** : 5 mai 2026
