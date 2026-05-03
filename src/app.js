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

    const energyCost = energyCons * 1.2;
    const costPrice = (-buyPrice) + energyCost + 2;
    const margin = sellPrice - costPrice;
    const co2 = transportDist * EMISSIONS.TRANSPORT_KM_TONNE + energyCons * EMISSIONS.GN_LITRE;

    return {
        buy_price: buyPrice, transport_dist: transportDist, energy_cons: energyCons,
        sell_price: sellPrice, exposure_class: exposureClass, substitution_rate: substitutionRate,
        margin: parseFloat(margin.toFixed(2)), co2: parseFloat(co2.toFixed(2))
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
    const { error } = await supabase.from(TABLE).insert({ name, ...collectData() });
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
    if (idx > -1) selectedForCompare.splice(idx, 1);
    else { if (selectedForCompare.length >= 2) selectedForCompare.shift(); selectedForCompare.push(id); }
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
            ca = (dir === 'higher' ? va > vb : va < vb) ? 'compare-better' : (va === vb ? '' : 'compare-worse');
            cb = (dir === 'higher' ? vb > va : vb < va) ? 'compare-better' : (va === vb ? '' : 'compare-worse');
            va = va.toFixed(2) + ' ' + unit; vb = vb.toFixed(2) + ' ' + unit;
        }
        html += '<tr><td>' + label + '</td><td class="' + ca + '">' + va + '</td><td class="' + cb + '">' + vb + '</td></tr>';
    });
    html += '</table>';
    const panel = document.getElementById('compare-panel');
    panel.innerHTML = html; panel.style.display = 'block';
}

async function loadHistory() {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    const list = document.getElementById('history-list');
    if (error || !data || data.length === 0) {
        list.innerHTML = '<p class="empty-state">Aucune simulation enregistrée pour le moment.</p>';
        return;
    }
    list.innerHTML = data.map(row => {
        const date = new Date(row.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
        const marginStyle = (row.margin ?? 0) >= 0 ? 'color:var(--success)' : 'color:var(--danger)';
        return `<div class="history-item" data-id="${row.id}" onclick="toggleCompare('${row.id}')">
            <div class="history-info"><span class="history-name">${row.name}</span><span class="history-date">${date}</span></div>
            <span style="font-weight:700;${marginStyle}">${(row.margin ?? 0).toFixed(2)} €/t</span>
            <div class="history-actions">
                <button class="btn-icon" title="Recharger" onclick="event.stopPropagation();loadSim('${row.id}')">↻</button>
                <button class="btn-icon delete" title="Supprimer" onclick="event.stopPropagation();deleteSimulation('${row.id}')">🗑</button>
            </div></div>`;
    }).join('');
}

async function loadSim(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error || !data) { showToast('Erreur chargement', true); return; }
    loadDataIntoForm(data);
    showToast('✓ Simulation chargée : ' + data.name);
}

document.getElementById('save-simulation').addEventListener('click', saveSimulation);
document.getElementById('btn-compare').addEventListener('click', showCompare);
loadHistory();
