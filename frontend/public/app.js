/**
 * NomadMatch — Frontend Application
 * Flujo: Preferencias → buildQuery() → API call → rankCities() → displayMatches()
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : '';

// Current tier state
let currentTier = 'free';

// City emoji map for visual placeholders
const CITY_EMOJIS = {
    'Lisbon': '🇵🇹', 'Barcelona': '🇪🇸', 'Berlin': '🇩🇪', 'Prague': '🇨🇿',
    'Budapest': '🇭🇺', 'Tallinn': '🇪🇪', 'Valencia': '🇪🇸', 'Porto': '🇵🇹',
    'Athens': '🇬🇷', 'Krakow': '🇵🇱', 'Split': '🇭🇷', 'Sofia': '🇧🇬',
    'Bucharest': '🇷🇴', 'Tbilisi': '🇬🇪', 'Belgrade': '🇷🇸', 'Vilnius': '🇱🇹',
    'Riga': '🇱🇻', 'Warsaw': '🇵🇱', 'Amsterdam': '🇳🇱', 'Copenhagen': '🇩🇰',
    'Stockholm': '🇸🇪', 'Edinburgh': '🏴', 'Dublin': '🇮🇪', 'Munich': '🇩🇪',
    'Vienna': '🇦🇹', 'Malta': '🇲🇹', 'Malaga': '🇪🇸', 'Nice': '🇫🇷',
    'Sarajevo': '🇧🇦', 'Tirana': '🇦🇱', 'Brno': '🇨🇿', 'Gdansk': '🇵🇱',
    'Ljubljana': '🇸🇮', 'Cluj-Napoca': '🇷🇴', 'Wroclaw': '🇵🇱', 'Seville': '🇪🇸',
    'Granada': '🇪🇸', 'Naples': '🇮🇹', 'Thessaloniki': '🇬🇷', 'Plovdiv': '🇧🇬',
    'Funchal': '🇵🇹', 'Las Palmas': '🇪🇸', 'Coimbra': '🇵🇹', 'Timisoara': '🇷🇴',
    'Bratislava': '🇸🇰', 'Nicosia': '🇨🇾', 'Groningen': '🇳🇱', 'Innsbruck': '🇦🇹',
    'Cork': '🇮🇪', 'Aarhus': '🇩🇰'
};

/**
 * 1. buildQuery() — Convert UI preferences into a semantic text query
 */
function buildQuery() {
    const budget = document.getElementById('budget').value;
    const climate = document.getElementById('climate').value;
    const internet = document.getElementById('internet').value;
    const visa = document.getElementById('visa').value;
    const vibe = document.getElementById('vibe').value;

    let parts = ['European city for digital nomads'];
    
    if (budget) {
        const budgetMap = {
            'Very Affordable': 'very affordable budget cheap low cost',
            'Affordable': 'affordable budget economical',
            'Moderate': 'moderate budget mid-range',
            'Expensive': 'expensive premium high quality',
            'Very Expensive': 'very expensive luxury top tier'
        };
        parts.push(budgetMap[budget] || budget);
    }
    
    if (climate) {
        const climateMap = {
            'Warm': 'warm sunny Mediterranean climate beach weather',
            'Mild': 'mild temperate comfortable climate',
            'Hot': 'hot sunny summer tropical warm',
            'Cool': 'cool fresh temperate'
        };
        parts.push(climateMap[climate] || climate);
    }
    
    if (internet) {
        parts.push(`${internet.toLowerCase()} internet fast reliable connection`);
    }
    
    if (visa === 'Yes') {
        parts.push('digital nomad visa available legal stay');
    }
    
    if (vibe) {
        const vibeMap = {
            'Beach': 'beach coastal seaside surf ocean',
            'Tech': 'tech startup innovation hub coworking',
            'Nightlife': 'nightlife party bars clubs social scene',
            'Historic': 'historic cultural architecture museums heritage',
            'Nature': 'nature outdoor hiking mountains green',
            'Affordable': 'affordable cheap budget-friendly economical',
            'Creative': 'creative artistic design culture bohemian'
        };
        parts.push(vibeMap[vibe] || vibe);
    }
    
    return parts.join(' ');
}

/**
 * 2. getPreferences() — Get structured preferences for boost scoring
 */
function getPreferences() {
    return {
        budget: document.getElementById('budget').value,
        climate: document.getElementById('climate').value,
        internet: document.getElementById('internet').value,
        visa: document.getElementById('visa').value,
        vibes: document.getElementById('vibe').value ? [document.getElementById('vibe').value] : [],
        nightlife: document.getElementById('vibe').value === 'Nightlife' ? 'Yes' : '',
        family: ''
    };
}

/**
 * 3. findMatches() — Main orchestrator: query API, display results
 */
async function findMatches() {
    const query = buildQuery();
    const preferences = getPreferences();
    
    // Show loading
    document.getElementById('results-placeholder').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/api/v1/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: query,
                num_results: 15,
                preferences: preferences,
                tier: currentTier
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        displayMatches(data.results || []);
        
    } catch (error) {
        console.error('Error:', error);
        // Show demo results if API is not available
        displayDemoResults();
    }
    
    // Hide loading
    document.getElementById('loading').classList.add('hidden');
}

/**
 * 4. displayMatches() — Render the top 3 city cards (Free or Premium)
 */
function displayMatches(cities) {
    const container = document.getElementById('results-container');
    
    if (cities.length === 0) {
        container.innerHTML = '<div class="placeholder"><p>No se encontraron ciudades. Intenta con otras preferencias.</p></div>';
        container.classList.remove('hidden');
        return;
    }
    
    container.innerHTML = cities.map((city, index) => {
        const meta = city.metadata || {};
        const premium = city.premium_data || null;
        const emoji = CITY_EMOJIS[city.city] || '🏙️';
        const scorePct = city.score_pct || Math.round((city.score || 0) * 100);
        const isPremium = currentTier === 'premium' && premium;
        
        // Build tags
        const tags = [];
        if (meta.budget) tags.push({ text: meta.budget, class: 'budget' });
        if (meta.internet) tags.push({ text: `${meta.internet} Internet`, class: '' });
        if (meta.visa === 'Yes') tags.push({ text: '✅ Visa', class: 'visa' });
        if (meta.safety === 'Excellent') tags.push({ text: '🛡️ Muy seguro', class: '' });
        
        const tagsHtml = tags.map(t => `<span class="tag ${t.class}">${t.text}</span>`).join('');
        
        // Premium visa section
        let premiumHtml = '';
        if (isPremium) {
            const visaAvail = premium.visa_available === 'Yes';
            const incomeReq = premium.visa_income_req_eur;
            
            premiumHtml = `
                <div class="premium-section">
                    <h4>🛂 Visa & Fiscalidad</h4>
                    <div class="premium-grid">
                        <div class="premium-item">
                            <span class="label">Visa Nómada</span>
                            <span class="value ${visaAvail ? 'highlight' : 'warning'}">${visaAvail ? '✅ Disponible' : '❌ No disponible'}</span>
                        </div>
                        <div class="premium-item">
                            <span class="label">Tipo</span>
                            <span class="value">${premium.visa_type || 'N/A'}</span>
                        </div>
                        <div class="premium-item">
                            <span class="label">Duración</span>
                            <span class="value">${premium.visa_duration || 'N/A'}</span>
                        </div>
                        <div class="premium-item">
                            <span class="label">Ingreso mínimo</span>
                            <span class="value">${incomeReq > 0 ? '€' + incomeReq.toLocaleString() + '/mes' : 'Sin requisito'}</span>
                        </div>
                        <div class="premium-item">
                            <span class="label">Visa Score</span>
                            <span class="value ${premium.visa_score === 'Excellent' ? 'highlight' : ''}">${premium.visa_score || 'N/A'}</span>
                        </div>
                        <div class="premium-item">
                            <span class="label">Schengen</span>
                            <span class="value">${premium.schengen || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (isPremium) {
            return `
                <div class="city-card premium-card" style="animation-delay: ${index * 0.15}s">
                    <div class="city-image">${emoji}</div>
                    <div class="city-info">
                        <div class="city-card-header">
                            <div>
                                <div class="city-name">${city.city}</div>
                                <div class="city-country">${city.country} · ${city.region || ''}</div>
                            </div>
                            <div class="score-badge">${scorePct}%</div>
                        </div>
                        <div class="city-tags">${tagsHtml}</div>
                        ${premiumHtml}
                    </div>
                </div>
            `;
        }
        
        // Free tier card (original)
        return `
            <div class="city-card" style="animation-delay: ${index * 0.15}s">
                <div class="city-image">${emoji}</div>
                <div class="city-info">
                    <div class="city-name">${city.city}</div>
                    <div class="city-country">${city.country} · ${city.region || ''}</div>
                    <div class="city-tags">${tagsHtml}</div>
                </div>
                <div class="city-score">
                    <div class="score-value">${scorePct}%</div>
                    <div class="score-label">match</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.classList.remove('hidden');
}

/**
 * Demo results for when API is not connected
 */
function displayDemoResults() {
    const prefs = getPreferences();
    
    // Simple client-side demo matching
    const demoData = [
        { city: 'Lisbon', country: 'Portugal', region: 'Southern Europe', score_pct: 92,
          metadata: { budget: 'Moderate', internet: 'Excellent', visa: 'Yes', safety: 'Good', vibe_tags: 'Sunny, Creative, Beach-Adjacent' },
          premium_data: { visa_available: 'Yes', visa_type: 'D7/D8 Digital Nomad Visa', visa_duration: '2 years', visa_income_req_eur: 3040, visa_score: 'Excellent', schengen: 'Schengen Area' }},
        { city: 'Barcelona', country: 'Spain', region: 'Southern Europe', score_pct: 87,
          metadata: { budget: 'Moderate', internet: 'Excellent', visa: 'Yes', safety: 'Good', vibe_tags: 'Beach, Cosmopolitan, Nightlife' },
          premium_data: { visa_available: 'Yes', visa_type: 'Spanish DNV (Startups Law)', visa_duration: '1+3+2 years', visa_income_req_eur: 2130, visa_score: 'Good', schengen: 'Schengen Area' }},
        { city: 'Valencia', country: 'Spain', region: 'Southern Europe', score_pct: 84,
          metadata: { budget: 'Moderate', internet: 'Good', visa: 'Yes', safety: 'Good', vibe_tags: 'Beach, Family-Friendly, Mediterranean' },
          premium_data: { visa_available: 'Yes', visa_type: 'Spanish DNV (Startups Law)', visa_duration: '1+3+2 years', visa_income_req_eur: 2130, visa_score: 'Good', schengen: 'Schengen Area' }},
        { city: 'Prague', country: 'Czech Republic', region: 'Central Europe', score_pct: 82,
          metadata: { budget: 'Affordable', internet: 'Good', visa: 'Yes', safety: 'Excellent', vibe_tags: 'Historic, Affordable, Beautiful' },
          premium_data: { visa_available: 'Yes', visa_type: 'Zivno Trade License', visa_duration: '2 years', visa_income_req_eur: 5350, visa_score: 'Good', schengen: 'Schengen Area' }},
        { city: 'Budapest', country: 'Hungary', region: 'Central Europe', score_pct: 80,
          metadata: { budget: 'Affordable', internet: 'Good', visa: 'Yes', safety: 'Good', vibe_tags: 'Thermal Baths, Affordable, Ruin Bars' },
          premium_data: { visa_available: 'Yes', visa_type: 'White Card DNV', visa_duration: '1 year', visa_income_req_eur: 2000, visa_score: 'Good', schengen: 'Schengen Area' }},
        { city: 'Berlin', country: 'Germany', region: 'Central Europe', score_pct: 78,
          metadata: { budget: 'Moderate', internet: 'Good', visa: 'No', safety: 'Good', vibe_tags: 'Creative, Tech, Nightlife, Liberal' },
          premium_data: { visa_available: 'No', visa_type: 'Freiberufler Visa', visa_duration: '1-3 years', visa_income_req_eur: 4500, visa_score: 'Moderate', schengen: 'Schengen Area' }},
        { city: 'Tallinn', country: 'Estonia', region: 'Northern Europe', score_pct: 75,
          metadata: { budget: 'Moderate', internet: 'Excellent', visa: 'Yes', safety: 'Excellent', vibe_tags: 'Digital, Startup, Nordic, Tech-forward' },
          premium_data: { visa_available: 'Yes', visa_type: 'Digital Nomad Visa + e-Residency', visa_duration: '1 year', visa_income_req_eur: 3504, visa_score: 'Excellent', schengen: 'Schengen Area' }},
        { city: 'Sofia', country: 'Bulgaria', region: 'Eastern Europe', score_pct: 73,
          metadata: { budget: 'Very Affordable', internet: 'Good', visa: 'Yes', safety: 'Good', vibe_tags: 'Affordable, Mountains, Budget' },
          premium_data: { visa_available: 'Yes', visa_type: 'D Visa Self-Employed', visa_duration: '1 year', visa_income_req_eur: 2000, visa_score: 'Good', schengen: 'Non-Schengen EU' }},
    ];
    
    // Simple scoring based on preferences
    let scored = demoData.map(city => {
        let score = city.score_pct / 100;
        const meta = city.metadata;
        
        if (prefs.visa === 'Yes' && meta.visa === 'Yes') score += 0.05;
        if (prefs.budget && meta.budget === prefs.budget) score += 0.05;
        if (prefs.vibes.length && meta.vibe_tags.toLowerCase().includes(prefs.vibes[0].toLowerCase())) score += 0.05;
        
        return { ...city, score: Math.min(score, 1), score_pct: Math.round(Math.min(score, 1) * 100) };
    });
    
    scored.sort((a, b) => b.score_pct - a.score_pct);
    displayMatches(scored.slice(0, 3));
}

/**
 * Tier toggle (Free / Premium)
 */
function setTier(tier) {
    currentTier = tier;
    document.getElementById('tier-free').classList.toggle('active', tier === 'free');
    document.getElementById('tier-premium').classList.toggle('active', tier === 'premium');
    
    const hint = document.getElementById('tier-hint');
    if (tier === 'premium') {
        hint.textContent = '⭐ Premium activo — datos de visa y fiscalidad incluidos';
        hint.classList.add('premium-active');
    } else {
        hint.textContent = 'Activa Premium para ver guías de visa y fiscalidad';
        hint.classList.remove('premium-active');
    }
}

/**
 * Language toggle (basic)
 */
function setLang(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Auto-check API health on load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${API_BASE}/api/v1/health`);
        if (res.ok) {
            const data = await res.json();
            console.log('✅ API connected:', data);
        }
    } catch (e) {
        console.log('⚠️ API not available — demo mode active');
    }
});
