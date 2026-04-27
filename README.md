# 🏗️ EcoGranulat Opti — Documentation Projet

Bienvenue dans le projet **EcoGranulat Opti**, un outil stratégique conçu pour **Ali Maolida (Béton Malin)**. 
Cette application permet aux professionnels du BTP de calculer en temps réel la rentabilité économique et l'impact carbone des granulats recyclés.

---

## 🚀 Démarrage Rapide

Le projet est conteneurisé avec Docker pour garantir un environnement de développement stable et identique pour tous.

### Prérequis
- Docker & Docker Compose installés sur votre machine.

### Lancer le projet
```bash
docker-compose up -d
```
L'application sera accessible sur : **[http://localhost:8080](http://localhost:8080)**

---

## 🛠️ Stack Technique

- **Frontend** : HTML5, Vanilla CSS (Design Premium, Glassmorphism), JavaScript Vanilla.
- **Serveur** : Nginx (via Docker).
- **Architecture** : Pas de framework lourd (React/Vue) pour maximiser la vitesse de chargement et la simplicité de maintenance.

---

## 📂 Structure des fichiers

```text
.
├── docker-compose.yml   # Configuration de l'infrastructure locale
├── src/                 # Code source de l'application
│   ├── index.html       # Structure sémantique et interface
│   ├── style.css        # Design system, tokens et animations
│   └── app.js           # Logique de calcul et gamification
├── GEMINI.md            # Instructions contextuelles pour l'IA (Antigravity)
└── README.md            # Cette documentation
```

---

## 💡 Concepts Clés pour les Développeurs

### 1. Logique de Calcul (`app.js`)
Tout est centralisé dans `updateCalculations()`. Le script gère :
- La rentabilité fabricant (Marge = Vente - Coûts).
- L'empreinte CO2 (Transport + Énergie).
- Le gain client (Économie réalisée par rapport au granulat naturel).

### 2. Design System (`style.css`)
Le design utilise le **Glassmorphism** (effets de transparence et flou). 
Les variables CSS (`:root`) permettent de modifier rapidement la charte graphique. 
Le layout est **Mobile-First** (optimisé pour les chantiers).

### 3. Système de Gamification
L'app intègre un système d'XP et de niveaux pour encourager l'usage :
- **XP** : Calculé sur la base de la marge et du CO2 économisé.
- **Niveaux** : De "Apprenti" à "Légende du Béton Malin".
- **Trophées** : Débloqués dynamiquement selon les performances.

---

## 🎯 État Actuel & Roadmap

- [x] Calculateur de base (Fabricant).
- [x] Simulateur Client (Mix-Design simplifié).
- [x] Interface Premium & Responsive.
- [x] Système de Gamification de base.
- [ ] **Prochaine étape** : Intégration d'une base de données (Supabase) pour sauvegarder les calculs.
- [ ] **Prochaine étape** : Module de calcul NF EN 206 complet pour les classes d'exposition.

---

## 🤝 Workflow de Développement (Antigravity)

Si vous utilisez l'assistant **Antigravity**, référez-vous au fichier `GEMINI.md`. Il contient les protocoles spécifiques pour orchestrer les agents spécialisés (Designer, Architecte, PRD).

---
**Mainteneur** : Ali Maolida (@betonmalin)
**Dernière mise à jour** : Avril 2026
