// Global Değişkenler
let dataCheckInterval = null; // Interval kontrolü için eklendi

// Loading Functions
function showLoading(title = 'Moto Karar', subtitle = 'En uygun motosiklet bulunuyor...') {
    const overlay = document.getElementById('loadingOverlay');
    const titleEl = document.querySelector('.loading-title');
    const subtitleEl = document.querySelector('.loading-subtitle');
    
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
}

// Loading with timeout
function showLoadingWithTimeout(title, subtitle, timeout = 5000) {
    showLoading(title, subtitle);
    return setTimeout(() => {
        hideLoading();
    }, timeout);
}

// Kriterler ve özellikleri (SADELEŞTİRİLMİŞ)
const criteria = [
    { id: 'price', name: 'Fiyat', type: 'min', unit: '₺', description: 'Düşük fiyat tercih edilir' },
    { id: 'power', name: 'Motor Gücü', type: 'max', unit: 'HP', description: 'Yüksek güç tercih edilir' },
    { id: 'fuel', name: 'Yakıt Tüketimi', type: 'min', unit: 'L/100km', description: 'Düşük tüketim tercih edilir' },
    { id: 'weight', name: 'Ağırlık', type: 'min', unit: 'kg', description: 'Hafif motosiklet tercih edilir' }
];

// Örnek motosiklet verileri (SADELEŞTİRİLMİŞ)
let motorcycles = [
    {
        name: 'Honda CBR 650R',
        values: { price: 450000, power: 95, fuel: 5.2, weight: 208 }
    },
    {
        name: 'Yamaha MT-07',
        values: { price: 380000, power: 74, fuel: 4.8, weight: 184 }
    },
    {
        name: 'Kawasaki Ninja 650',
        values: { price: 420000, power: 68, fuel: 5.0, weight: 193 }
    }
];

// Admin modu kontrolü
let isAdmin = false;
const ADMIN_USERNAME = 'admin81';
const ADMIN_PASSWORD = '8118';

// Admin modunu kontrol et (localStorage'dan)
function checkAdminMode() {
    isAdmin = localStorage.getItem('adminMode') === 'true';
    updateAdminUI();
}

// Admin UI'ı güncelle
function updateAdminUI() {
    const adminControls = document.getElementById('adminMotorcycleControls');
    if (adminControls) {
        adminControls.style.display = isAdmin ? 'block' : 'none';
    }
}

// Admin giriş modalını göster
function showAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    const form = document.getElementById('adminLoginForm');
    const errorDiv = document.getElementById('adminError');
    
    // Hata mesajını gizle
    errorDiv.style.display = 'none';
    
    // Formu sıfırla
    form.reset();
    
    // Modal'ı göster
    modal.style.display = 'block';
    
    // Form submit olayını ayarla
    form.onsubmit = function(e) {
        e.preventDefault();
        authenticateAdmin();
    };
}

// Admin giriş modalını kapat
function closeAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    const errorDiv = document.getElementById('adminError');
    modal.style.display = 'none';
    errorDiv.style.display = 'none';
    document.getElementById('adminLoginForm').reset();
}

// Admin kimlik doğrulama
function authenticateAdmin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminError');
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Doğru bilgiler
        isAdmin = true;
        localStorage.setItem('adminMode', 'true');
        updateAdminUI();
        closeAdminLoginModal();
        if (window.showToast) showToast('✅ Admin modu açıldı!', 'success'); else alert('✅ Admin modu açıldı!');
    } else {
        // Yanlış bilgiler
        errorDiv.textContent = '❌ Hatalı kullanıcı adı veya şifre!';
        errorDiv.style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
}

// Admin modunu kapat
function logoutAdmin() {
    isAdmin = false;
    localStorage.setItem('adminMode', 'false');
    updateAdminUI();
    if (window.showToast) showToast('Admin modu kapatıldı', 'info'); else alert('Admin modu kapatıldı');
}

// Admin modunu aç/kapat (gizli tuş kombinasyonu ile: Ctrl+Shift+A)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (isAdmin) {
            // Eğer admin modu açıksa kapat
            logoutAdmin();
        } else {
            // Eğer admin modu kapalıysa giriş modalını göster
            showAdminLoginModal();
        }
    }
});

// API'den motosiklet verilerini yükle
async function loadMotorcyclesFromAPI() {
    try {
        showLoading('Moto Karar', 'Veriler yükleniyor...');
        // API endpoint - eğer API çalışmıyorsa JSON'a geri dön
        const API_URL = 'http://localhost:5000/api/motorcycles';
        
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Veriyi işle
        let loadedMotorcycles = [];
        if (Array.isArray(data)) {
            loadedMotorcycles = data;
        } else if (data.motorcycles && Array.isArray(data.motorcycles)) {
            loadedMotorcycles = data.motorcycles;
        } else if (data.data && Array.isArray(data.data)) {
            loadedMotorcycles = data.data;
        } else {
            console.warn('Geçersiz veri formatı, JSON dosyasına geri dönülüyor');
            return await loadMotorcyclesFromJSON();
        }
        
        // Veriyi doğrula
        loadedMotorcycles = loadedMotorcycles.filter(m => {
            if (!m.name || !m.values) return false;
            // Tüm kriterlerin mevcut olduğunu kontrol et
            return criteria.every(c => typeof m.values[c.id] === 'number');
        });
        
        if (loadedMotorcycles.length === 0) {
            console.warn('Geçerli motosiklet verisi bulunamadı, JSON dosyasına geri dönülüyor');
            return await loadMotorcyclesFromJSON();
        }
        
        // Veriyi güncelle
        motorcycles = loadedMotorcycles;
        
        // UI'ı güncelle
        initializeMotorcycles();
        console.log(`✅ API'den ${motorcycles.length} motosiklet yüklendi`);
        return true;
    } catch (error) {
        console.warn('API\'den veri yüklenirken hata oluştu:', error);
        console.log('JSON dosyasına geri dönülüyor...');
        return await loadMotorcyclesFromJSON();
    }
}

// JSON dosyasından motosiklet verilerini yükle (fallback)
async function loadMotorcyclesFromJSON() {
    try {
        const response = await fetch('filtrelenmis_motorlar.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Veriyi işle
        let loadedMotorcycles = [];
        if (Array.isArray(data)) {
            loadedMotorcycles = data;
        } else if (data.motorcycles && Array.isArray(data.motorcycles)) {
            loadedMotorcycles = data.motorcycles;
        } else if (data.data && Array.isArray(data.data)) {
            loadedMotorcycles = data.data;
        } else {
            console.warn('Geçersiz veri formatı, varsayılan veriler kullanılıyor');
            return false;
        }
        
        // Veriyi doğrula
        loadedMotorcycles = loadedMotorcycles.filter(m => {
            if (!m.name || !m.values) return false;
            return criteria.every(c => typeof m.values[c.id] === 'number');
        });
        
        if (loadedMotorcycles.length === 0) {
            console.warn('Geçerli motosiklet verisi bulunamadı, varsayılan veriler kullanılıyor');
            return false;
        }

        // HATA DÜZELTME: Veriyi güncelle ve UI'ı başlat
        motorcycles = loadedMotorcycles;
        initializeMotorcycles();
        console.log(`✅ JSON dosyasından ${motorcycles.length} motosiklet yüklendi`);
        return true;

    } catch (error) {
        console.error('JSON yükleme hatası:', error);
        return false;
    }
}

// Otomatik veri yenilemeyi başlat
function startDataAutoRefresh() {
    // Varsa eski interval'i temizle
    if (dataCheckInterval) clearInterval(dataCheckInterval);

    // Her 30 saniyede bir kontrol et
    dataCheckInterval = setInterval(async () => {
        try {
            // Önce API'den dene
            const API_URL = 'http://localhost:5000/api/motorcycles';
            const response = await fetch(`${API_URL}?t=${Date.now()}`, {
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                // API çalışmıyor, pas geç
                return;
            }
            
            const data = await response.json();
            let newMotorcycles = [];
            
            // Veriyi işle
            if (Array.isArray(data)) {
                newMotorcycles = data;
            } else if (data.motorcycles && Array.isArray(data.motorcycles)) {
                newMotorcycles = data.motorcycles;
            } else if (data.data && Array.isArray(data.data)) {
                newMotorcycles = data.data;
            } else {
                return;
            }
            
            if (newMotorcycles.length === 0) {
                return; // Geçerli veri yoksa güncelleme yapma
            }

            // Veriyi güncelle (basitçe üzerine yazıyoruz, istenirse diff kontrolü yapılabilir)
            motorcycles = newMotorcycles.filter(m => {
                 if (!m.name || !m.values) return false;
                 return criteria.every(c => typeof m.values[c.id] === 'number');
            });

            if(motorcycles.length > 0) {
                 initializeMotorcycles();
            }
            
        } catch (error) {
            console.error('Otomatik veri güncelleme hatası:', error);
        }
    }, 30000); // 30 saniye
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeCriteria();
    checkAdminMode();
    // API'den veri yükle ve otomatik güncellemeyi başlat (API çalışmıyorsa JSON'a geri döner)
    loadMotorcyclesFromAPI(); // Bu fonksiyon içinde gerekirse JSON'a döner
    startDataAutoRefresh();
});

// Kriterleri başlat
function initializeCriteria() {
    const container = document.getElementById('criteria-container');
    container.innerHTML = '';
    
    criteria.forEach((criterion, index) => {
        const criterionDiv = document.createElement('div');
        criterionDiv.className = 'criterion-item';
        criterionDiv.innerHTML = `
            <label>
                <span class="criterion-name">${criterion.name}</span>
                <span class="criterion-info" title="${criterion.description}">ℹ️</span>
                <span class="criterion-type">(${criterion.type === 'max' ? 'Maksimize' : 'Minimize'})</span>
            </label>
            <div class="slider-container">
                <input type="range" 
                       id="weight-${criterion.id}" 
                       class="weight-slider" 
                       min="1" 
                       max="10" 
                       value="5" 
                       oninput="updateWeightValue('${criterion.id}', this.value)">
                <span class="weight-value" id="value-${criterion.id}">5</span>
            </div>
        `;
        container.appendChild(criterionDiv);
    });
}

// Motosiklet isminden markayı çıkar
function getBrandFromName(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('honda')) return 'Honda';
    if (nameLower.includes('yamaha')) return 'Yamaha';
    if (nameLower.includes('ducati')) return 'Ducati';
    if (nameLower.includes('bmw')) return 'BMW';
    if (nameLower.includes('ktm')) return 'KTM';
    if (nameLower.includes('husqvarna')) return 'Husqvarna';
    if (nameLower.includes('kawasaki')) return 'Kawasaki';
    if (nameLower.includes('bajaj')) return 'Bajaj';
    if (nameLower.includes('triumph')) return 'Triumph';
    
    return 'Diğer'; 
}

// Motosikletleri markalara göre grupla
function groupMotorcyclesByBrand() {
    const grouped = {};
    
    motorcycles.forEach((motorcycle, index) => {
        const brand = getBrandFromName(motorcycle.name);
        if (!grouped[brand]) {
            grouped[brand] = [];
        }
        grouped[brand].push({ ...motorcycle, originalIndex: index });
    });
    
    return grouped;
}

// Motosikletleri başlat (markalara göre gruplandırılmış)
function initializeMotorcycles() {
    const container = document.getElementById('motorcycles-container');
    container.innerHTML = '';
    
    const grouped = groupMotorcyclesByBrand();
    const brandOrder = ['Bajaj', 'Honda', 'Yamaha', 'Ducati', 'BMW', 'KTM', 'Triumph', 'Husqvarna', 'Kawasaki'];
    
    brandOrder.forEach(brand => {
        if (!grouped[brand] || grouped[brand].length === 0) {
            return; 
        }
        
        const brandSection = document.createElement('div');
        brandSection.className = 'brand-section';
        
        const brandHeader = document.createElement('div');
        brandHeader.className = 'brand-header';
        brandHeader.innerHTML = `
            <h2 class="brand-title">${brand}</h2>
            <span class="brand-count">${grouped[brand].length} model</span>
            <span class="brand-toggle">▼</span>
        `;
        
        const brandContent = document.createElement('div');
        brandContent.className = 'brand-content';
        brandContent.style.display = 'none'; 
        
        const motorcyclesGrid = document.createElement('div');
        motorcyclesGrid.className = 'motorcycle-grid';
        
        grouped[brand].forEach((motorcycle) => {
            const motorcycleDiv = document.createElement('div');
            motorcycleDiv.className = 'motorcycle-card';
            motorcycleDiv.innerHTML = `
                <div class="motorcycle-header">
                    <h3>${motorcycle.name}</h3>
                    <label class="checkbox-label">
                        <input type="checkbox" class="motorcycle-checkbox" data-index="${motorcycle.originalIndex}" checked>
                        <span>Seç</span>
                    </label>
                </div>
                <div class="motorcycle-specs">
                    ${criteria.map(c => `
                        <div class="spec-item">
                            <span class="spec-label">${c.name}:</span>
                            <span class="spec-value">${motorcycle.values[c.id]} ${c.unit}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            motorcyclesGrid.appendChild(motorcycleDiv);
        });
        
        brandContent.appendChild(motorcyclesGrid);
        brandSection.appendChild(brandHeader);
        brandSection.appendChild(brandContent);
        container.appendChild(brandSection);
        
        brandHeader.addEventListener('click', function() {
            const isOpen = brandContent.style.display !== 'none';
            brandContent.style.display = isOpen ? 'none' : 'block';
            const toggle = brandHeader.querySelector('.brand-toggle');
            toggle.textContent = isOpen ? '▼' : '▲';
            brandHeader.classList.toggle('active', !isOpen);
        });
    });
}

// Ağırlık değerini güncelle
function updateWeightValue(criterionId, value) {
    document.getElementById(`value-${criterionId}`).textContent = value;
}

// Varsayılan ağırlıkları yükle
function loadDefaultWeights() {
    criteria.forEach(criterion => {
        const slider = document.getElementById(`weight-${criterion.id}`);
        slider.value = 5;
        updateWeightValue(criterion.id, 5);
    });
}

// AHP için global değişkenler
let ahpComparisonMatrix = null;
let ahpWeights = null;
let ahpComparisonPairs = []; 
let currentComparisonIndex = 0; 

// Ağırlık belirleme yöntemini değiştir
function switchWeightMethod(method) {
    const sliderMethod = document.getElementById('slider-method');
    const ahpMethod = document.getElementById('ahp-method');
    
    if (method === 'slider') {
        sliderMethod.style.display = 'block';
        ahpMethod.style.display = 'none';
        ahpWeights = null;
    } else {
        sliderMethod.style.display = 'none';
        ahpMethod.style.display = 'block';
        initializeAHPWizard();
    }
}

// AHP Wizard'ı başlat (Adım 1: İkili karşılaştırmalar)
function initializeAHPWizard() {
    const n = criteria.length;
    // AHP nesnesinin başka bir scriptte tanımlı olduğu varsayılıyor
    if (typeof AHP === 'undefined') {
        console.error('AHP kütüphanesi bulunamadı!');
        return;
    }

    ahpComparisonMatrix = AHP.createEmptyMatrix(n);
    ahpWeights = null;
    currentComparisonIndex = 0;
    
    ahpComparisonPairs = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            ahpComparisonPairs.push({
                row: i,
                col: j,
                criterion1: criteria[i],
                criterion2: criteria[j],
                value: null
            });
        }
    }
    
    showNextComparison();
}

// Bir sonraki karşılaştırmayı göster
function showNextComparison() {
    const container = document.getElementById('ahp-comparison-container');
    
    if (currentComparisonIndex >= ahpComparisonPairs.length) {
        showAHPWeightsCalculation();
        return;
    }
    
    const currentPair = ahpComparisonPairs[currentComparisonIndex];
    const progress = ((currentComparisonIndex + 1) / ahpComparisonPairs.length * 100).toFixed(0);
    
    let html = `
        <div class="ahp-wizard-step">
            <div class="ahp-progress-bar">
                <div class="ahp-progress-fill" style="width: ${progress}%"></div>
                <span class="ahp-progress-text">Adım ${currentComparisonIndex + 1} / ${ahpComparisonPairs.length}</span>
            </div>
            
            <div class="ahp-comparison-question">
                <h3>⚖️ İkili Karşılaştırma</h3>
                <p class="comparison-question-text">
                    <strong>"${currentPair.criterion1.name}"</strong> kriteri, 
                    <strong>"${currentPair.criterion2.name}"</strong> kriterinden ne kadar önemli?
                </p>
                
                <div class="comparison-criteria-info">
                    <div class="criterion-info-box">
                        <strong>${currentPair.criterion1.name}</strong>
                        <small>${currentPair.criterion1.description}</small>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="criterion-info-box">
                        <strong>${currentPair.criterion2.name}</strong>
                        <small>${currentPair.criterion2.description}</small>
                    </div>
                </div>
                
                <div class="comparison-scale-selector">
                    <label class="scale-label">Önem Derecesi (Saaty Ölçeği):</label>
                    <select id="ahp-comparison-value" class="ahp-scale-select" onchange="updateCurrentComparison(this.value)">
                        <option value="">Seçiniz...</option>
                        <option value="1">1 - Eşit derecede önemli</option>
                        <option value="2">2 - Eşit ile Orta derecede önemli arası</option>
                        <option value="3">3 - Orta derecede önemli</option>
                        <option value="4">4 - Orta ile Kuvvetli derecede önemli arası</option>
                        <option value="5">5 - Kuvvetli derecede önemli</option>
                        <option value="6">6 - Kuvvetli ile Çok Kuvvetli önemli arası</option>
                        <option value="7">7 - Çok kuvvetli derecede önemli</option>
                        <option value="8">8 - Çok kuvvetli ile Aşırı derecede önemli arası</option>
                        <option value="9">9 - Aşırı derecede daha önemli</option>
                    </select>
                    <small class="scale-help">
                        <strong>Not:</strong> Eğer "${currentPair.criterion2.name}" daha önemliyse, 
                        seçiminiz otomatik olarak tersine çevrilecektir (1/9, 1/8, ... 1/1).
                    </small>
                </div>
                
                <div class="ahp-wizard-buttons">
                    ${currentComparisonIndex > 0 ? `
                        <button class="btn btn-secondary" onclick="previousComparison()">← Önceki</button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="nextComparison()" id="next-comparison-btn" disabled>
                        ${currentComparisonIndex === ahpComparisonPairs.length - 1 ? '✅ Karşılaştırmaları Tamamla' : 'Sonraki →'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    if (currentPair.value !== null) {
        document.getElementById('ahp-comparison-value').value = currentPair.value;
        document.getElementById('next-comparison-btn').disabled = false;
    }
}

// Mevcut karşılaştırmayı güncelle
function updateCurrentComparison(value) {
    if (!value || value === '') {
        document.getElementById('next-comparison-btn').disabled = true;
        return;
    }
    
    const currentPair = ahpComparisonPairs[currentComparisonIndex];
    const numValue = parseFloat(value);
    
    AHP.fillReciprocal(ahpComparisonMatrix, currentPair.row, currentPair.col, numValue);
    currentPair.value = numValue;
    
    document.getElementById('next-comparison-btn').disabled = false;
}

// Bir sonraki karşılaştırmaya geç
function nextComparison() {
    const select = document.getElementById('ahp-comparison-value');
    if (!select || !select.value) {
        if (window.showToast) showToast('Lütfen bir önem derecesi seçin!', 'error'); else alert('Lütfen bir önem derecesi seçin!');
        return;
    }
    
    currentComparisonIndex++;
    showNextComparison();
}

// Önceki karşılaştırmaya dön
function previousComparison() {
    if (currentComparisonIndex > 0) {
        currentComparisonIndex--;
        showNextComparison();
    }
}

// Adım 2: AHP Ağırlıklarını Hesapla ve Göster
function showAHPWeightsCalculation() {
    const container = document.getElementById('ahp-comparison-container');
    
    try {
        const result = AHP.calculateWeights(ahpComparisonMatrix);
        ahpWeights = result.weights;
        
        let html = `
            <div class="ahp-weights-result">
                <div class="ahp-step-header">
                    <h3>✅ Adım 2: AHP Ağırlıkları Hesaplandı</h3>
                    <p class="step-description">
                        Pairwise comparison matrisinden öncelik vektörü (ağırlıklar) başarıyla hesaplandı.
                    </p>
                </div>
                
                <div class="ahp-consistency-analysis">
                    <h4>📈 Tutarlılık Analizi</h4>
                    <div class="consistency-metrics">
                        <div class="metric-item">
                            <span class="metric-label">Consistency Ratio (CR):</span>
                            <span class="metric-value ${result.isConsistent ? 'consistent' : 'inconsistent'}">
                                ${(result.consistencyRatio * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Consistency Index (CI):</span>
                            <span class="metric-value">${result.consistencyIndex.toFixed(4)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Lambda Max:</span>
                            <span class="metric-value">${result.lambdaMax.toFixed(4)}</span>
                        </div>
                        <div class="consistency-status ${result.isConsistent ? 'status-ok' : 'status-warning'}">
                            ${result.isConsistent 
                                ? '✅ Matris tutarlı! (CR < 0.1) - Karşılaştırmalarınız tutarlı.' 
                                : '⚠️ Matris tutarlılığı düşük (CR >= 0.1) - Karşılaştırmaları gözden geçirmeniz önerilir.'}
                        </div>
                    </div>
                </div>
                
                <div class="ahp-calculated-weights">
                    <h4>⚖️ Hesaplanan Kriter Ağırlıkları</h4>
                    <div class="weights-list">
        `;
        
        criteria.forEach((c, index) => {
            const weightPercent = (result.weights[index] * 100).toFixed(2);
            html += `
                <div class="weight-item-detailed">
                    <div class="weight-item-header">
                        <span class="weight-criterion-name">${c.name}</span>
                        <span class="weight-percentage">${weightPercent}%</span>
                    </div>
                    <div class="weight-bar-detailed">
                        <div class="weight-bar-fill" style="width: ${weightPercent}%"></div>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <div class="ahp-actions">
                    <button class="btn btn-secondary" onclick="restartAHPWizard()">🔄 Karşılaştırmaları Yeniden Yap</button>
                    <button class="btn btn-primary" onclick="proceedToTOPSIS()">🎯 TOPSIS Analizine Geç →</button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        const consistencyInfo = document.getElementById('ahp-consistency-info');
        if (consistencyInfo) {
            consistencyInfo.style.display = 'block';
        }
        
    } catch (error) {
        if (window.showToast) showToast('❌ Hata: ' + error.message, 'error'); else alert('❌ Hata: ' + error.message);
        console.error('AHP hesaplama hatası:', error);
    }
}

// AHP Wizard'ı yeniden başlat
function restartAHPWizard() {
    currentComparisonIndex = 0;
    ahpComparisonPairs.forEach(pair => {
        pair.value = null;
    });
    ahpComparisonMatrix = AHP.createEmptyMatrix(criteria.length);
    showNextComparison();
}

// TOPSIS analizine geç
function proceedToTOPSIS() {
    if (!ahpWeights || ahpWeights.length === 0) {
        if (window.showToast) showToast('Lütfen önce AHP ağırlıklarını hesaplayın!', 'error'); else alert('Lütfen önce AHP ağırlıklarını hesaplayın!');
        return;
    }
    
    const calculateBtn = document.querySelector('.btn-calculate');
    if (calculateBtn) {
        calculateBtn.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            if (window.showToast) showToast('✅ AHP ağırlıkları hazır! Analizi çalıştırabilirsiniz.', 'success'); else alert('✅ AHP ağırlıkları hazır! Şimdi "AHP+TOPSIS Analizini Çalıştır" butonuna tıklayarak analizi başlatabilirsiniz.');
        }, 500);
    }
}

// Motosiklet türünü al
function getMotorcycleType(motorcycle) {
    const name = motorcycle.name.toLowerCase();
    
    if (name.includes('ninja') || name.includes('r') || name.includes('sport') || name.includes('yzf')) return 'Süper Sport';
    if (name.includes('mt') || name.includes('cb') || name.includes('z') || name.includes('naked')) return 'Naked';
    if (name.includes('versys') || name.includes('v-strom') || name.includes('tiger') || name.includes('multistrada')) return 'Adventure';
    if (name.includes('goldwing') || name.includes('harley') || name.includes('cruiser') || name.includes('shadow')) return 'Cruiser';
    if (name.includes('pcx') || name.includes('forza') || name.includes('xmax') || name.includes('nmax')) return 'Scooter';
    if (name.includes('crf') || name.includes('xr') || name.includes('dual') || name.includes('enduro')) return 'Dual Sport';
    
    return 'Naked'; // Varsayılan
}

// TOPSIS analizini hesapla (AHP+TOPSIS hibrit)
function calculateTOPSIS() {
    // Loading göster
    showLoading('Moto Karar', 'Analiz yapılıyor...');
    
    // TOPSIS nesnesinin varlığı kontrol ediliyor
    if (typeof TOPSIS === 'undefined') {
        console.error('TOPSIS kütüphanesi bulunamadı!');
        hideLoading();
        return;
    }

    const selectedCheckboxes = document.querySelectorAll('.motorcycle-checkbox:checked');
    if (selectedCheckboxes.length < 2) {
        hideLoading();
        if (window.showToast) showToast('Lütfen en az 2 motosiklet seçin!', 'error'); else alert('Lütfen en az 2 motosiklet seçin!');
        return;
    }
    
    // Seçili motosikletlerin türlerini kontrol et
    const selectedMotorcycles = Array.from(selectedCheckboxes).map(cb => {
        const index = parseInt(cb.dataset.index);
        return motorcycles[index];
    });
    
    const types = new Set(selectedMotorcycles.map(m => getMotorcycleType(m)));
    console.log('Seçili türler:', Array.from(types));
    
    // Tür bazlı istatistikleri göster
    const typeStats = {};
    selectedMotorcycles.forEach(m => {
        const type = getMotorcycleType(m);
        if (!typeStats[type]) typeStats[type] = 0;
        typeStats[type]++;
    });
    
    console.log('Tür dağılımı:', typeStats);
    
    const weightMethod = document.querySelector('input[name="weightMethod"]:checked').value;
    let normalizedWeights;
    let weightSource = '';
    
    if (weightMethod === 'ahp') {
        if (!ahpWeights || ahpWeights.length === 0) {
            if (window.showToast) showToast('Lütfen önce AHP ağırlıklarını hesaplayın!', 'error'); else alert('Lütfen önce AHP ağırlıklarını hesaplayın!');
            return;
        }
        normalizedWeights = [...ahpWeights];
        weightSource = 'AHP';
    } else {
        const weights = criteria.map(c => {
            const slider = document.getElementById(`weight-${c.id}`);
            return parseFloat(slider.value);
        });
        
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        normalizedWeights = weights.map(w => w / totalWeight);
        weightSource = 'Slider';
    }
    
    const alternativesMatrix = selectedMotorcycles.map(motorcycle => 
        criteria.map(c => motorcycle.values[c.id])
    );
    
    const criteriaTypes = criteria.map(c => c.type);
    
    const results = TOPSIS.calculate(alternativesMatrix, normalizedWeights, criteriaTypes);
    
    displayResults(selectedMotorcycles, results, normalizedWeights, weightSource);
}

// Sonuçları göster
function displayResults(selectedMotorcycles, results, weights, weightSource = 'Slider') {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    
    const rankedResults = results.rankings.map((rank, position) => ({
        position: position + 1,
        motorcycle: selectedMotorcycles[rank],
        score: results.scores[rank],
        distance: results.distances[rank]
    }));
    
    const top10Results = rankedResults.slice(0, 10);
    
    let html = `
        <div class="results-summary">
            <h3>🏆 Sıralama Sonuçları (İlk 10)</h3>
            <p style="color: #667eea; font-weight: 600; margin-bottom: 15px;">
                📊 Kullanılan Yöntem: ${weightSource === 'AHP' ? 'AHP+TOPSIS Hibrit Model' : 'TOPSIS (Slider Ağırlıkları)'}
            </p>
            <div class="ranking-list">
    `;
    
    top10Results.forEach((result, index) => {
        const percentage = (result.score * 100).toFixed(2);
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏍️';
        
        html += `
            <div class="ranking-item ${index === 0 ? 'winner' : ''}" data-motorcycle-index="${index}" onclick="showMotorcycleDetail(${index})">
                <div class="rank-position">${medal} ${result.position}. Sıra</div>
                <div class="rank-name">${result.motorcycle.name}</div>
                <div class="rank-score">
                    <div class="score-bar-container">
                        <div class="score-bar" style="width: ${percentage}%"></div>
                        <span class="score-text">${percentage}%</span>
                    </div>
                </div>
                <div class="rank-details">
                    <span>Pozitif İdeal Uzaklık: ${result.distance.positive.toFixed(4)}</span>
                    <span>Negatif İdeal Uzaklık: ${result.distance.negative.toFixed(4)}</span>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <div class="weights-summary">
            <h3>📊 Kullanılan Kriter Ağırlıkları</h3>
            <div class="weights-list">
    `;
    
    criteria.forEach((criterion, index) => {
        const weightPercent = (weights[index] * 100).toFixed(1);
        html += `
            <div class="weight-item">
                <span class="weight-label">${criterion.name}:</span>
                <div class="weight-bar-container">
                    <div class="weight-bar" style="width: ${weightPercent}%"></div>
                    <span class="weight-text">${weightPercent}%</span>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    window.currentRankedResults = top10Results;
    
    // Loading'i gizle
    hideLoading();
    
    // Grafik fonksiyonlarının varlığı kontrol ediliyor
    setTimeout(() => {
        if(typeof createRankingChart === 'function') createRankingChart(top10Results);
        if(typeof createWeightsChart === 'function') createWeightsChart(weights);
        if(typeof createRadarChart === 'function') createRadarChart(rankedResults.slice(0, 5), selectedMotorcycles, results, weights);
    }, 100);
}

// Yeni motosiklet ekleme modalını göster
function showAddMotorcycleModal() {
    const modal = document.getElementById('addMotorcycleModal');
    const form = document.getElementById('addMotorcycleForm');
    
    const inputsContainer = document.getElementById('motorcycleCriteriaInputs');
    inputsContainer.innerHTML = '';
    
    criteria.forEach(criterion => {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'form-group';
        inputDiv.innerHTML = `
            <label>${criterion.name} (${criterion.unit}):</label>
            <input type="number" 
                   id="input-${criterion.id}" 
                   step="0.1" 
                   required
                   placeholder="${criterion.description}">
        `;
        inputsContainer.appendChild(inputDiv);
    });
    
    form.onsubmit = function(e) {
        e.preventDefault();
        addMotorcycle();
    };
    
    modal.style.display = 'block';
}

// Modalı kapat
function closeAddMotorcycleModal() {
    document.getElementById('addMotorcycleModal').style.display = 'none';
    document.getElementById('addMotorcycleForm').reset();
}

// Yeni motosiklet ekle
function addMotorcycle() {
    const name = document.getElementById('motorcycleName').value;
    if (!name) {
        if (window.showToast) showToast('Lütfen motosiklet adını girin!', 'error'); else alert('Lütfen motosiklet adını girin!');
        return;
    }
    
    const values = {};
    criteria.forEach(criterion => {
        const input = document.getElementById(`input-${criterion.id}`);
        values[criterion.id] = parseFloat(input.value);
        if (isNaN(values[criterion.id])) {
            if (window.showToast) showToast(`Lütfen ${criterion.name} için geçerli bir değer girin!`, 'error'); else alert(`Lütfen ${criterion.name} için geçerli bir değer girin!`);
            return;
        }
    });
    
    motorcycles.push({ name, values });
    initializeMotorcycles();
    closeAddMotorcycleModal();
}

// Veri yükleme modalını göster
function showLoadDataModal() {
    const modal = document.getElementById('loadDataModal');
    const errorDiv = document.getElementById('loadDataError');
    const successDiv = document.getElementById('loadDataSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    document.getElementById('loadMethod').value = 'json';
    
    // HATA DÜZELTME: Çift çağrı kaldırıldı
    toggleLoadMethod();
    
    modal.style.display = 'block';
}

// Veri yükleme modalını kapat
function closeLoadDataModal() {
    const modal = document.getElementById('loadDataModal');
    const errorDiv = document.getElementById('loadDataError');
    const successDiv = document.getElementById('loadDataSuccess');
    
    modal.style.display = 'none';
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    document.getElementById('jsonFileInput').value = '';
    document.getElementById('apiUrl').value = '';
    document.getElementById('apiKey').value = '';
    document.getElementById('jsonUrl').value = '';
}

// Yükleme yöntemini değiştir
function toggleLoadMethod() {
    const method = document.getElementById('loadMethod').value;
    
    const jsonFileMethod = document.getElementById('jsonFileMethod');
    const apiMethod = document.getElementById('apiMethod');
    const jsonUrlMethod = document.getElementById('jsonUrlMethod');

    if(jsonFileMethod) jsonFileMethod.style.display = method === 'json' ? 'block' : 'none';
    if(apiMethod) apiMethod.style.display = method === 'api' ? 'block' : 'none';
    if(jsonUrlMethod) jsonUrlMethod.style.display = method === 'url' ? 'block' : 'none';
}

// Motosiklet verilerini yükle
async function loadMotorcycleData() {
    const method = document.getElementById('loadMethod').value;
    const errorDiv = document.getElementById('loadDataError');
    const successDiv = document.getElementById('loadDataSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    try {
        let data;
        
        if (method === 'json') {
            const fileInput = document.getElementById('jsonFileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                errorDiv.textContent = 'Lütfen bir JSON dosyası seçin!';
                errorDiv.style.display = 'block';
                return;
            }
            
            const text = await file.text();
            data = JSON.parse(text);
        } else if (method === 'api') {
            let apiUrl = document.getElementById('apiUrl').value;
            
            if (!apiUrl) {
                apiUrl = 'http://localhost:5000/api/motorcycles';
            }
            
            const apiKey = document.getElementById('apiKey').value;
            const headers = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            
            const response = await fetch(apiUrl, { headers });
            if (!response.ok) {
                throw new Error(`API hatası: ${response.status} ${response.statusText}`);
            }
            data = await response.json();
        } else if (method === 'url') {
            const jsonUrl = document.getElementById('jsonUrl').value;
            if (!jsonUrl) {
                errorDiv.textContent = 'Lütfen bir JSON URL girin!';
                errorDiv.style.display = 'block';
                return;
            }
            
            const response = await fetch(jsonUrl);
            if (!response.ok) {
                throw new Error(`Yükleme hatası: ${response.status} ${response.statusText}`);
            }
            data = await response.json();
        }
        
        if (Array.isArray(data)) {
            motorcycles = data;
        } else if (data.motorcycles && Array.isArray(data.motorcycles)) {
            motorcycles = data.motorcycles;
        } else if (data.data && Array.isArray(data.data)) {
            motorcycles = data.data;
        } else {
            throw new Error('Geçersiz veri formatı! Veri bir array olmalı veya {motorcycles: []} veya {data: []} formatında olmalı.');
        }
        
        motorcycles = motorcycles.filter(m => {
            if (!m.name || !m.values) return false;
            return criteria.every(c => typeof m.values[c.id] === 'number');
        });
        
        if (motorcycles.length === 0) {
            throw new Error('Geçerli motosiklet verisi bulunamadı!');
        }
        
        initializeMotorcycles();
        closeLoadDataModal();
        
        successDiv.textContent = `✅ ${motorcycles.length} motosiklet başarıyla yüklendi!`;
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        errorDiv.textContent = `❌ Hata: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Veri yükleme hatası:', error);
    }
}

// Motosiklet için kaynak URL'ini al
function getMotorcycleSourceUrl(motorcycle) {
    if (motorcycle.url) {
        const nameLower = motorcycle.name.toLowerCase();
        let brand = 'Marka';
        
        if (nameLower.includes('honda')) brand = 'Honda';
        else if (nameLower.includes('yamaha')) brand = 'Yamaha';
        else if (nameLower.includes('ducati')) brand = 'Ducati';
        else if (nameLower.includes('bmw')) brand = 'BMW';
        else if (nameLower.includes('ktm')) brand = 'KTM';
        else if (nameLower.includes('triumph') || nameLower.includes('triımph')) brand = 'Triumph';
        
        return { brand: brand, url: motorcycle.url };
    }
    
    const nameLower = motorcycle.name.toLowerCase();
    
    const brandUrls = {
        'Honda': 'https://www.honda.com.tr/motosiklet/modeller',
        'Yamaha': 'https://www.yamaha-motor.eu/tr/tr/motorcycles/',
        'Ducati': 'https://korlas.com.tr/markalar/ducati/',
        'BMW': 'https://www.borusanoto.com/bmw-motorrad-tum-modeller',
        'KTM': 'https://www.arnmotors.com/tr/ktm-motosiklet',
        'Triumph': 'https://korlas.com.tr/markalar/triumph/'
    };
    
    if (nameLower.includes('honda')) return { brand: 'Honda', url: brandUrls['Honda'] };
    if (nameLower.includes('yamaha')) return { brand: 'Yamaha', url: brandUrls['Yamaha'] };
    if (nameLower.includes('ducati')) return { brand: 'Ducati', url: brandUrls['Ducati'] };
    if (nameLower.includes('bmw')) return { brand: 'BMW', url: brandUrls['BMW'] };
    if (nameLower.includes('ktm')) return { brand: 'KTM', url: brandUrls['KTM'] };
    if (nameLower.includes('triumph') || nameLower.includes('triımph')) return { brand: 'Triumph', url: brandUrls['Triumph'] };
    
    return null; 
}

// Motosiklet için görsel URL'sini al
function getMotorcycleImageUrl(motorcycle) {
    const possibleKeys = [
        'image', 'image_url', 'imageUrl', 'photo', 'photo_url', 'photoUrl', 'img', 'img_url'
    ];
    
    for (const key of possibleKeys) {
        if (motorcycle[key] && typeof motorcycle[key] === 'string') {
            return motorcycle[key];
        }
    }
    
    return null;
}

// Motosiklet detay modalını göster
function showMotorcycleDetail(resultIndex) {
    if (!window.currentRankedResults || !window.currentRankedResults[resultIndex]) {
        return;
    }
    
    const result = window.currentRankedResults[resultIndex];
    const motorcycle = result.motorcycle;
    
    const modal = document.getElementById('motorcycleDetailModal');
    const title = document.getElementById('detailModalTitle');
    const content = document.getElementById('motorcycleDetailContent');
    
    title.textContent = `🏍️ ${motorcycle.name} - Detaylı Bilgiler`;
    
    const sourceInfo = getMotorcycleSourceUrl(motorcycle);
    const imageUrl = getMotorcycleImageUrl(motorcycle);
    
    let detailHtml = `
        <div class="motorcycle-detail-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin-bottom: 20px;">
            <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
                ${imageUrl ? `
                <div style="flex: 0 0 260px; max-width: 260px;">
                    <img src="${imageUrl}" alt="${motorcycle.name}" 
                         style="width: 100%; height: auto; border-radius: 10px; object-fit: cover; box-shadow: 0 6px 18px rgba(0,0,0,0.25); background:#fff;" 
                         onerror="this.style.display='none';" />
                </div>
                ` : ''}
                <div style="flex: 1 1 250px; min-width: 0;">
                    <h3 style="margin: 0 0 10px 0; font-size: 1.5em;">${motorcycle.name}</h3>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <div>
                            <strong>TOPSIS Skoru:</strong> ${(result.score * 100).toFixed(2)}%
                        </div>
                        <div>
                            <strong>Sıralama:</strong> ${result.position}. Sıra
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="motorcycle-detail-specs" style="margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📊 Teknik Özellikler</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
    `;
    
    criteria.forEach(criterion => {
        const value = motorcycle.values[criterion.id];
        const formattedValue = typeof value === 'number' ? value.toLocaleString('tr-TR') : value;
        
        detailHtml += `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                <div style="font-weight: 600; color: #667eea; margin-bottom: 5px;">${criterion.name}</div>
                <div style="font-size: 1.2em; font-weight: bold; color: #333;">${formattedValue} ${criterion.unit}</div>
                <div style="font-size: 0.85em; color: #666; margin-top: 5px;">${criterion.description}</div>
            </div>
        `;
    });
    
    detailHtml += `
            </div>
        </div>
        
        <div class="motorcycle-detail-analysis" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📈 TOPSIS Analiz Detayları</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 5px;">
                    <span><strong>Pozitif İdeal Uzaklık:</strong></span>
                    <span style="color: #667eea; font-weight: bold;">${result.distance.positive.toFixed(4)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 5px;">
                    <span><strong>Negatif İdeal Uzaklık:</strong></span>
                    <span style="color: #667eea; font-weight: bold;">${result.distance.negative.toFixed(4)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 5px;">
                    <span><strong>Göreceli Yakınlık Skoru:</strong></span>
                    <span style="color: #667eea; font-weight: bold; font-size: 1.2em;">${(result.score * 100).toFixed(2)}%</span>
                </div>
            </div>
        </div>
    `;
    
    if (sourceInfo) {
        const isSpecificUrl = motorcycle.url && motorcycle.url.includes('/') && !motorcycle.url.endsWith('/');
        const linkText = isSpecificUrl 
            ? `🌐 ${motorcycle.name} Detay Sayfasına Git →` 
            : `🌐 ${sourceInfo.brand} Resmi Sitesine Git →`;
        
        detailHtml += `
        <div class="motorcycle-source-link" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; border: 2px solid #667eea; text-align: center;">
            <h3 style="color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">🔗 Kaynak Site</h3>
            <p style="color: #666; margin-bottom: 15px; font-size: 0.95em;">
                ${isSpecificUrl 
                    ? `Bu motosiklet bilgileri <strong>${sourceInfo.brand}</strong> marka sitesindeki <strong>${motorcycle.name}</strong> model sayfasından çekilmiştir.`
                    : `Bu motosiklet bilgileri <strong>${sourceInfo.brand}</strong> marka sitesinden çekilmiştir.`}
            </p>
            <a href="${sourceInfo.url}" target="_blank" rel="noopener noreferrer" 
               style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; text-decoration: none; border-radius: 8px; font-weight: 600; 
                      transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                ${linkText}
            </a>
        </div>
        `;
    }
    
    content.innerHTML = detailHtml;
    modal.style.display = 'block';
}

// Motosiklet detay modalını kapat
function closeMotorcycleDetailModal() {
    document.getElementById('motorcycleDetailModal').style.display = 'none';
}

// Modal dışına tıklandığında kapat
window.onclick = function(event) {
    const addModal = document.getElementById('addMotorcycleModal');
    const adminModal = document.getElementById('adminLoginModal');
    const loadDataModal = document.getElementById('loadDataModal');
    const detailModal = document.getElementById('motorcycleDetailModal');
    
    if (event.target === addModal) {
        closeAddMotorcycleModal();
    }
    if (event.target === adminModal) {
        closeAdminLoginModal();
    }
    if (event.target === loadDataModal) {
        closeLoadDataModal();
    }
    if (event.target === detailModal) {
        closeMotorcycleDetailModal();
    }  
};