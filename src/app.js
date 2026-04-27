// Constantes d'émissions CO2 (Source : Base Carbone ADEME / Moyennes BTP)
const EMISSIONS = {
    GN_LITRE: 3.16, // kg CO2eq / litre de GNR
    TRANSPORT_KM_TONNE: 0.11, // kg CO2eq / km.tonne (Camion 26t)
    ELEC_KWH: 0.06 // kg CO2eq / kWh (Mix France)
};

const LEVEL_NAMES = [
    "Apprenti Recycleur 🏗️",
    "Maître du Criblage ⚙️",
    "Champion Bas Carbone 🍃",
    "Expert Économie Circulaire ♻️",
    "Légende du Béton Malin 🌟"
];

const updateCalculations = () => {
    // Récupération des valeurs Fabricant
    const buyPrice = parseFloat(document.getElementById('buy-price').value) || 0;
    const distanceRaw = parseFloat(document.getElementById('transport-dist').value) || 0;
    const distance = Math.max(0, distanceRaw); // FIX : Toujours positif
    
    const energyCons = parseFloat(document.getElementById('energy-cons').value) || 0;
    const sellPrice = parseFloat(document.getElementById('sell-price').value) || 0;

    // Récupération des valeurs Client (Phase 2)
    const subRate = parseFloat(document.getElementById('substitution-rate').value) || 0;
    const exposure = document.getElementById('exposure-class').value;
    document.getElementById('rate-display').innerText = subRate;

    // 1. Calcul de la rentabilité Fabricant
    const transportCost = 0; // Payé par le client
    const energyCost = energyCons * 1.2;
    const costPrice = (-buyPrice) + transportCost + energyCost + 2;
    const margin = sellPrice - costPrice;

    // 2. Calcul du CO2 Fabricant
    const co2Transport = distance * EMISSIONS.TRANSPORT_KM_TONNE;
    const co2Energy = energyCons * EMISSIONS.GN_LITRE;
    const totalCO2 = co2Transport + co2Energy;

    // 3. Calcul Gain Client (Phase 2)
    const naturalPrice = 25;
    const ecoGainClient = (naturalPrice - sellPrice) * (subRate / 100) * 1.8;
    
    const co2NaturalTransport = 100 * EMISSIONS.TRANSPORT_KM_TONNE;
    const co2Saved = (co2NaturalTransport - co2Transport) * (subRate / 100) * 1.8;

    // Mise à jour de l'affichage
    document.getElementById('cost-value').innerText = `${costPrice.toFixed(2)} €/t`;
    document.getElementById('margin-value').innerText = `${margin.toFixed(2)} €/t`;
    document.getElementById('co2-value').innerText = `${totalCO2.toFixed(2)} kg/t`;

    // Affichage Client
    document.getElementById('client-gain').innerText = ecoGainClient > 0 ? `${ecoGainClient.toFixed(2)} €/m³` : "0.00 €/m³";
    document.getElementById('client-co2-gain').innerText = `${co2Saved.toFixed(2)} kg/m³`;

    // 4. Logique Maintenance (Phase 3)
    const yieldEl = document.getElementById('gnr-yield').parentElement;
    if (energyCons > 0.9) {
        yieldEl.classList.add('warning');
        document.getElementById('gnr-yield').innerText = `${energyCons.toFixed(2)} L/t (ALERTE)`;
    } else {
        yieldEl.classList.remove('warning');
        document.getElementById('gnr-yield').innerText = `${energyCons.toFixed(2)} L/t`;
    }

    // 5. Gamification (Option E)
    updateGamification(margin, co2Saved, energyCons);

    // Alertes visuelles dynamiques
    const marginEl = document.getElementById('margin-value').parentElement;
    const badgeEl = marginEl.querySelector('.badge');

    if (margin < 0) {
        marginEl.style.background = 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)';
        badgeEl.innerText = "Alerte Rentabilité";
        badgeEl.style.background = "rgba(0,0,0,0.3)";
    } else if (margin > 8) {
        marginEl.style.background = 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)';
        badgeEl.innerText = "Performance Exceptionnelle";
        badgeEl.style.background = "rgba(255,255,255,0.2)";
    } else {
        marginEl.style.background = 'rgba(255,255,255,0.05)';
        badgeEl.innerText = "Objectif en cours";
        badgeEl.style.background = "var(--glass-border)";
    }

    updateBreakdown(buyPrice, transportCost, energyCost);
    updateChefTip(margin, totalCO2, energyCons);
};

const updateChefTip = (margin, co2, energy) => {
    const tipText = document.getElementById('tip-text');
    if (!tipText) return;

    let tips = [
        "N'oubliez pas : un bon granulat recyclé, c'est d'abord un bon tri à la source ! ♻️",
        "Le secret de la rentabilité ? Optimiser les trajets de retour à vide. 🚛",
        "Réduire votre conso de GNR de 0.1L/t peut sauver des milliers d'euros par an. ⛽",
        "La norme NF EN 206 autorise des taux de substitution élevés selon l'exposition. Vérifiez vos classes ! 🧪",
        "L'économie circulaire, c'est transformer un coût de mise en décharge en ressource précieuse. 💎"
    ];

    if (energy > 1.0) {
        tips.unshift("Alerte GNR : Votre consommation est élevée. Vérifiez l'état de vos filtres et injecteurs ! ⚠️");
    }
    if (margin < 2) {
        tips.unshift("Marge faible : Avez-vous pensé à valoriser davantage vos sables de recyclage ? 🧐");
    }
    if (co2 < 5) {
        tips.unshift("Superbe impact ! Vous êtes déjà sur la voie de la décarbonation profonde. 🍃");
    }

    // Choisir un conseil basé sur l'état ou aléatoire
    const selectedTip = tips[0]; 
    tipText.innerText = selectedTip;
};

const updateBreakdown = (buy, trans, energy) => {
    const breakdown = document.getElementById('breakdown');
    if (!breakdown) return;
    breakdown.innerHTML = `
        <ul style="list-style: none; font-size: 0.9rem; color: var(--text-muted);">
            <li>📥 Redevance réception : -${buy.toFixed(2)} € (Gain)</li>
            <li>🚛 Transport amont : 0.00 € (Client)</li>
            <li>⚙️ Transformation : ${energy.toFixed(2)} €</li>
            <li>🏢 Frais fixes : 2.00 €</li>
        </ul>
    `;
};

const updateGamification = (margin, co2, energy) => {
    let xp = Math.max(0, (margin * 10) + (co2 * 5));
    let levelIndex = Math.min(LEVEL_NAMES.length - 1, Math.floor(xp / 50));
    let levelNum = levelIndex + 1;
    let progress = xp % 50 * 2;

    document.getElementById('user-level').innerText = levelNum;
    document.getElementById('xp-progress').style.width = `${progress}%`;
    
    // FIX : Mise à jour du nom du rang
    const xpTextEl = document.querySelector('.xp-text');
    xpTextEl.innerHTML = `Niveau <span id="user-level">${levelNum}</span> - ${LEVEL_NAMES[levelIndex]}`;

    // Trophées
    const t1 = document.getElementById('trophy-1');
    const t2 = document.getElementById('trophy-2');
    const t3 = document.getElementById('trophy-3');

    if (co2 > 10) t1.classList.replace('locked', 'unlocked'); else t1.classList.replace('unlocked', 'locked');
    if (margin > 5) t2.classList.replace('locked', 'unlocked'); else t2.classList.replace('unlocked', 'locked');
    if (energy < 0.75) t3.classList.replace('locked', 'unlocked'); else t3.classList.replace('unlocked', 'locked');
};

// Logique du Calculateur GNR (Modal)
const gnrModal = document.getElementById('gnr-modal');
const openBtn = document.getElementById('open-gnr-calc');
const closeBtn = document.querySelector('.close-modal');
const applyBtn = document.getElementById('apply-gnr-calc');

// Inputs Modal
const modalLiters = document.getElementById('modal-gnr-liters');
const modalTonnes = document.getElementById('modal-gnr-tonnes');
const modalHours = document.getElementById('modal-gnr-hours');

// Résultats Modal
const resLT = document.getElementById('res-l-t');
const resTH = document.getElementById('res-t-h');

openBtn.onclick = () => gnrModal.style.display = 'flex';
closeBtn.onclick = () => gnrModal.style.display = 'none';

window.onclick = (event) => {
    if (event.target == gnrModal) gnrModal.style.display = 'none';
};

const calculateGnrModal = () => {
    const l = parseFloat(modalLiters.value) || 0;
    const t = parseFloat(modalTonnes.value) || 0;
    const h = parseFloat(modalHours.value) || 0;

    let l_t = 0;
    let t_h = 0;

    if (t > 0) {
        l_t = l / t;
        resLT.innerText = `${l_t.toFixed(2)} L/t`;
    } else {
        resLT.innerText = `0.00 L/t`;
    }

    if (h > 0) {
        t_h = t / h;
        resTH.innerText = `${t_h.toFixed(2)} t/h`;
    } else {
        resTH.innerText = `0.00 t/h`;
    }

    return l_t;
};

// Listeners pour calcul temps réel dans la modal
[modalLiters, modalTonnes, modalHours].forEach(el => {
    el.addEventListener('input', calculateGnrModal);
});

applyBtn.onclick = () => {
    const result = calculateGnrModal();
    if (result > 0) {
        document.getElementById('energy-cons').value = result.toFixed(2);
        updateCalculations();
        gnrModal.style.display = 'none';
    } else {
        alert("Veuillez saisir des données valides (tonnage > 0)");
    }
};

// --- SYSTÈME DE SAUVEGARDE LOCALE (Phase S) ---

const saveBtn = document.getElementById('save-simulation');
const historyList = document.getElementById('history-list');

const saveSimulation = () => {
    const name = prompt("Nommez votre simulation (ex: Chantier A, Scénario 1) :");
    if (!name) return;

    const simulationData = {
        id: Date.now(),
        name: name,
        date: new Date().toLocaleString('fr-FR'),
        inputs: {
            buyPrice: document.getElementById('buy-price').value,
            transportDist: document.getElementById('transport-dist').value,
            energyCons: document.getElementById('energy-cons').value,
            sellPrice: document.getElementById('sell-price').value,
            subRate: document.getElementById('substitution-rate').value,
            exposure: document.getElementById('exposure-class').value
        }
    };

    let history = JSON.parse(localStorage.getItem('eco_simulations') || '[]');
    history.unshift(simulationData);
    localStorage.setItem('eco_simulations', JSON.stringify(history));
    
    renderHistory();
    alert("Simulation sauvegardée avec succès !");
};

const renderHistory = () => {
    const history = JSON.parse(localStorage.getItem('eco_simulations') || '[]');
    if (!historyList) return;

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">Aucune simulation enregistrée pour le moment.</p>';
        return;
    }

    historyList.innerHTML = history.map(sim => `
        <div class="history-item" data-id="${sim.id}">
            <div class="history-info">
                <span class="history-name">${sim.name}</span>
                <span class="history-date">${sim.date}</span>
            </div>
            <div class="history-actions">
                <button class="btn-icon load" onclick="loadSimulation(${sim.id})" title="Charger">📂</button>
                <button class="btn-icon delete" onclick="deleteSimulation(${sim.id})" title="Supprimer">🗑️</button>
            </div>
        </div>
    `).join('');
};

window.loadSimulation = (id) => {
    const history = JSON.parse(localStorage.getItem('eco_simulations') || '[]');
    const sim = history.find(s => s.id === id);
    if (!sim) return;

    // Remplissage des inputs
    document.getElementById('buy-price').value = sim.inputs.buyPrice;
    document.getElementById('transport-dist').value = sim.inputs.transportDist;
    document.getElementById('energy-cons').value = sim.inputs.energyCons;
    document.getElementById('sell-price').value = sim.inputs.sellPrice;
    document.getElementById('substitution-rate').value = sim.inputs.subRate;
    document.getElementById('exposure-class').value = sim.inputs.exposure;

    updateCalculations();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteSimulation = (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette simulation ?")) return;
    let history = JSON.parse(localStorage.getItem('eco_simulations') || '[]');
    history = history.filter(s => s.id !== id);
    localStorage.setItem('eco_simulations', JSON.stringify(history));
    renderHistory();
};

if (saveBtn) {
    saveBtn.addEventListener('click', saveSimulation);
}

// Listeners globaux
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        updateCalculations();
    }
});

// Initialisation
updateCalculations();
renderHistory();
