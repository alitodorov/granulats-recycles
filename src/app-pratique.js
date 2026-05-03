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
        client_name: t('client-name'), client_period: t('client-period'), client_site: t('client-site'),
        t_input: tIn, redevance, distance: g('distance'), transport_cost: g('transport-cost'),
        hours: g('hours'), gnr_total: g('gnr-total'), gnr_price: g('gnr-price'),
        products, labor: g('labor'), machine: g('machine'), maintenance: g('maintenance'),
        other_charges: g('other-charges'), observations: t('observations'),
        ca_total: parseFloat(totalCA.toFixed(2)), marge_brute: parseFloat((totalCA - totalCharges).toFixed(2))
    };
}

function loadPratiqueIntoForm(row) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    set('client-name', row.client_name); set('client-period', row.client_period); set('client-site', row.client_site);
    set('t-input', row.t_input); set('redevance', row.redevance); set('distance', row.distance);
    set('transport-cost', row.transport_cost); set('hours', row.hours);
    set('gnr-total', row.gnr_total); set('gnr-price', row.gnr_price);
    if (row.products && row.products.length === 4) {
        row.products.forEach((p, i) => {
            const n = i + 1;
            set('p' + n + '-prod', p.prod); set('p' + n + '-sold', p.sold); set('p' + n + '-price', p.price);
        });
    }
    set('labor', row.labor); set('machine', row.machine);
    set('maintenance', row.maintenance); set('other-charges', row.other_charges);
    set('observations', row.observations);
    calculate();
}

async function savePratique() {
    const defaultName = 'Pratique ' + new Date().toLocaleString('fr-FR');
    const name = prompt('Nom de la simulation :', defaultName);
    if (!name) return;
    const { error } = await supabase.from(TABLE_P).insert({ name, ...collectPratiqueData() });
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
    if (idx > -1) selectedP.splice(idx, 1);
    else { if (selectedP.length >= 2) selectedP.shift(); selectedP.push(id); }
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
    const rows = [
        ['Nom', a.name, b.name],
        ['Client', a.client_name || '—', b.client_name || '—'],
        ['CA Total', a.ca_total, b.ca_total, '€', 'higher'],
        ['Marge Brute', a.marge_brute, b.marge_brute, '€', 'higher'],
        ['Tonnes reçues', a.t_input, b.t_input, 't', 'higher'],
        ['Conso GNR', a.gnr_total, b.gnr_total, 'L', 'lower'],
    ];
    let html = '<table style="width:100%;border-collapse:collapse;font-size:0.875rem;"><tr style="border-bottom:2px solid var(--border);"><th style="text-align:left;padding:8px 12px;font-size:0.75rem;text-transform:uppercase;color:var(--muted);">Indicateur</th><th style="text-align:right;padding:8px 12px;font-size:0.75rem;text-transform:uppercase;color:var(--muted);">' + a.name + '</th><th style="text-align:right;padding:8px 12px;font-size:0.75rem;text-transform:uppercase;color:var(--muted);">' + b.name + '</th></tr>';
    rows.forEach(([label, va, vb, unit, dir]) => {
        let ca = '', cb = '';
        if (dir && typeof va === 'number') {
            ca = (dir === 'higher' ? va > vb : va < vb) ? 'color:var(--success);font-weight:700' : (va === vb ? '' : 'color:var(--danger);font-weight:700');
            cb = (dir === 'higher' ? vb > va : vb < va) ? 'color:var(--success);font-weight:700' : (va === vb ? '' : 'color:var(--danger);font-weight:700');
            va = va.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' ' + unit;
            vb = vb.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' ' + unit;
        }
        html += '<tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 12px;">' + label + '</td><td style="text-align:right;padding:8px 12px;' + ca + '">' + va + '</td><td style="text-align:right;padding:8px 12px;' + cb + '">' + vb + '</td></tr>';
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
        const date = new Date(row.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
        const margeColor = (row.marge_brute ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)';
        return `<div class="history-item" data-id="${row.id}" onclick="toggleCompareP('${row.id}')" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:background 0.2s;">
            <div style="display:flex;flex-direction:column;"><strong style="font-size:0.9rem;">${row.name}</strong><span style="font-size:0.72rem;color:var(--muted);">${date}${row.client_name ? ' · ' + row.client_name : ''}</span></div>
            <span style="font-weight:700;color:${margeColor};font-size:0.95rem;">${(row.marge_brute ?? 0).toLocaleString('fr-FR', {maximumFractionDigits:0})} €</span>
            <div style="display:flex;gap:6px;">
                <button onclick="event.stopPropagation();loadPratiqueSim('${row.id}')" style="background:var(--navy);color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.78rem;">↻</button>
                <button onclick="event.stopPropagation();deletePratique('${row.id}')" style="background:var(--danger);color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.78rem;">🗑</button>
            </div></div>`;
    }).join('');
}

loadHistoryP();
