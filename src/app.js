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

    // Alertes visuelles
    const marginEl = document.getElementById('margin-value').parentElement;
    if (margin < 0) {
        marginEl.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    } else {
        marginEl.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
    }

    updateBreakdown(buyPrice, transportCost, energyCost);
};

const updateBreakdown = (buy, trans, energy) => {
    const breakdown = document.getElementById('breakdown');
    breakdown.innerHTML = `
        <ul style="list-style: none; font-size: 0.9rem; color: var(--text-light);">
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

// Listeners globaux
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        updateCalculations();
    }
});

// Initialisation
updateCalculations();
