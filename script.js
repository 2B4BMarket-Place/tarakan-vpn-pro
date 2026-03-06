// База данных стран (30+ стран)
const countriesDB = [
    // Бесплатные страны
    { country: "France", city: "Paris", flag: "🇫🇷", free: true },
    { country: "Germany", city: "Berlin", flag: "🇩🇪", free: true },
    { country: "United Kingdom", city: "London", flag: "🇬🇧", free: true },
    { country: "Italy", city: "Milan", flag: "🇮🇹", free: true },
    { country: "Spain", city: "Madrid", flag: "🇪🇸", free: true },
    { country: "Netherlands", city: "Amsterdam", flag: "🇳🇱", free: true },
    { country: "Sweden", city: "Stockholm", flag: "🇸🇪", free: true },
    { country: "Norway", city: "Oslo", flag: "🇳🇴", free: true },
    { country: "Finland", city: "Helsinki", flag: "🇫🇮", free: true },
    { country: "Denmark", city: "Copenhagen", flag: "🇩🇰", free: true },
    { country: "Poland", city: "Warsaw", flag: "🇵🇱", free: true },
    { country: "Belgium", city: "Brussels", flag: "🇧🇪", free: true },
    { country: "Austria", city: "Vienna", flag: "🇦🇹", free: true },
    { country: "Switzerland", city: "Zurich", flag: "🇨🇭", free: true },
    { country: "Portugal", city: "Lisbon", flag: "🇵🇹", free: true },
    
    // Премиум страны
    { country: "USA", city: "New York", flag: "🇺🇸", free: false },
    { country: "USA", city: "Los Angeles", flag: "🇺🇸", free: false },
    { country: "USA", city: "Chicago", flag: "🇺🇸", free: false },
    { country: "USA", city: "Miami", flag: "🇺🇸", free: false },
    { country: "Canada", city: "Toronto", flag: "🇨🇦", free: false },
    { country: "Canada", city: "Vancouver", flag: "🇨🇦", free: false },
    { country: "Canada", city: "Montreal", flag: "🇨🇦", free: false },
    { country: "Australia", city: "Sydney", flag: "🇦🇺", free: false },
    { country: "Australia", city: "Melbourne", flag: "🇦🇺", free: false },
    { country: "Japan", city: "Tokyo", flag: "🇯🇵", free: false },
    { country: "Japan", city: "Osaka", flag: "🇯🇵", free: false },
    { country: "Singapore", city: "Singapore", flag: "🇸🇬", free: false },
    { country: "Brazil", city: "São Paulo", flag: "🇧🇷", free: false },
    { country: "Mexico", city: "Mexico City", flag: "🇲🇽", free: false },
    { country: "South Africa", city: "Johannesburg", flag: "🇿🇦", free: false },
    { country: "India", city: "Mumbai", flag: "🇮🇳", free: false },
    { country: "UAE", city: "Dubai", flag: "🇦🇪", free: false },
    { country: "Israel", city: "Tel Aviv", flag: "🇮🇱", free: false },
    { country: "South Korea", city: "Seoul", flag: "🇰🇷", free: false }
];

// Состояние приложения
let premiumActive = false;
let searchTerm = '';
let statusTimeout = null;

// DOM элементы
const container = document.getElementById('countriesContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const vpnKeyInput = document.getElementById('vpnKeyInput');
const activateKeyBtn = document.getElementById('activateKeyBtn');
const goPremiumBtn = document.getElementById('goPremiumBtn');
const trialBtn = document.getElementById('trialBtn');
const optimalLocation = document.getElementById('optimalLocation');
const statusDiv = document.getElementById('statusMessage');
const statusSpan = document.getElementById('statusText');

// Загрузка статуса из localStorage
function loadPremiumStatus() {
    const stored = localStorage.getItem('tarakan_premium');
    premiumActive = stored === 'true';
}

// Сохранение статуса
function setPremiumActive(active, message = '') {
    premiumActive = active;
    localStorage.setItem('tarakan_premium', active ? 'true' : 'false');
    renderCountries();
    
    if (active) {
        showStatus(message || 'Premium activated! All countries unlocked ✓', 'success');
        // Отправка на сервер для логирования
        fetch('/api/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type: 'premium', 
                timestamp: new Date().toISOString() 
            })
        }).catch(() => {});
    }
}

// Показать статус
function showStatus(text, type = 'success') {
    statusSpan.innerText = text;
    statusDiv.className = `status-message show ${type}`;
    
    if (statusTimeout) clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
        statusDiv.classList.remove('show');
    }, 3500);
}

// Фильтрация стран
function filterCountries() {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return countriesDB;
    
    return countriesDB.filter(c => 
        c.country.toLowerCase().includes(term) || 
        c.city.toLowerCase().includes(term)
    );
}

// Отрисовка стран
function renderCountries() {
    const filtered = filterCountries();
    
    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 40px; color: #647b9e;">
            <i class="fas fa-search" style="font-size: 40px; margin-bottom: 15px;"></i><br>
            No locations found
        </div>`;
        return;
    }
    
    let html = '';
    filtered.forEach(c => {
        const isFree = c.free;
        const isAccessible = isFree || premiumActive;
        const lockClass = !isAccessible ? 'premium-locked' : '';
        
        html += `<div class="country-card ${lockClass}" data-country="${c.country}" data-city="${c.city}" data-free="${isFree}">`;
        html += `<span class="flag">${c.flag}</span>`;
        html += `<div class="country-info">`;
        html += `<div class="country-name">${c.country}`;
        
        if (isFree) {
            html += `<span class="free-badge"><i class="fas fa-check"></i> FREE</span>`;
        }
        
        html += `</div>`;
        html += `<div class="country-city">${c.city}</div>`;
        html += `</div>`;
        
        if (!isAccessible) {
            html += `<div class="premium-lock-icon"><i class="fas fa-lock"></i></div>`;
        }
        html += `</div>`;
    });
    
    container.innerHTML = html;
    
    // Добавление обработчиков
    document.querySelectorAll('.country-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('premium-locked')) {
                showStatus('This is a premium location. Enter key or start trial', 'error');
                return;
            }
            
            const country = card.dataset.country;
            const city = card.dataset.city;
            showStatus(`✅ Connected to ${country} (${city}) • 0 ms latency`, 'success');
        });
    });
}

// Обработчики событий
searchBtn.addEventListener('click', () => {
    searchTerm = searchInput.value;
    renderCountries();
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchTerm = searchInput.value;
        renderCountries();
    }
});

// Активация по ключу
activateKeyBtn.addEventListener('click', async () => {
    const key = vpnKeyInput.value.trim();
    
    if (!key) {
        showStatus('Please enter a VPN key', 'error');
        return;
    }
    
    // Валидация на сервере
    try {
        const response = await fetch('/api/validate-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        
        const data = await response.json();
        
        if (data.valid) {
            setPremiumActive(true, `✨ Key activated! Premium until ${data.expiry}`);
            vpnKeyInput.value = '';
        } else {
            showStatus('Invalid key. Try: TRIAL2024', 'error');
        }
    } catch (error) {
        // Fallback для демо
        if (key.length >= 5) {
            setPremiumActive(true, '✓ Demo key accepted');
            vpnKeyInput.value = '';
        } else {
            showStatus('Key must be at least 5 characters', 'error');
        }
    }
});

// Триал
trialBtn.addEventListener('click', async () => {
    setPremiumActive(true, '🎉 7-day trial activated!');
    
    // Отправка на сервер
    fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userId: 'user_' + Math.random().toString(36).substr(2, 9),
            startDate: new Date().toISOString()
        })
    }).catch(() => {});
});

// GoPremium
goPremiumBtn.addEventListener('click', () => {
    window.open('https://example.com/pricing', '_blank');
    showStatus('Redirecting to secure payment...', 'success');
});

// Optimal location
optimalLocation.addEventListener('click', async () => {
    // Получение оптимальной локации с сервера
    try {
        const response = await fetch('/api/optimal-location');
        const data = await response.json();
        
        document.querySelector('.optimal-chip .location').innerHTML = 
            `<i class="fas fa-map-pin"></i> ${data.country}-${data.city}`;
        
        showStatus(`Optimal location updated: ${data.country}-${data.city}`, 'success');
    } catch {
        showStatus('Italy-Milan (fastest route)', 'success');
    }
});

// Рекомендованные карточки
document.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', () => {
        const country = card.dataset.country;
        const city = card.dataset.city;
        
        const countryData = countriesDB.find(c => 
            c.country === country && c.city.includes(city.split(' ')[0])
        );
        
        if (!countryData) return;
        
        if (!countryData.free && !premiumActive) {
            showStatus(`🔒 ${country} requires premium`, 'error');
        } else {
            showStatus(`🚀 Fast connecting to ${country} (${countryData.city})`, 'success');
        }
    });
});

// Загрузка при старте
loadPremiumStatus();
renderCountries();

// Проверка обновлений каждые 30 секунд
setInterval(async () => {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.maintenance) {
            showStatus('⚠️ Scheduled maintenance in 5 min', 'error');
        }
    } catch {}
}, 30000);
