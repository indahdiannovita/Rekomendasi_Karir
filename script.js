// Configuration object for Element SDK
const defaultConfig = {
    app_title: "✏️ Rekomendasi Karir",
    welcome_message: "Temukan Karir yang Tepat untuk Anda"
};

// Global variables
let currentFormData = {};
let currentRecommendations = [];

// Skills mapping based on major
const skillsMapping = {
    'agribisnis': [
        'Pengolahan Hasil Perikanan',
        'Manajemen Kualitas Produk',
        'Teknik Pengawetan',
        'Analisis Nutrisi',
        'Pemasaran Produk Perikanan'
    ],
    'tkj': [
        'Jaringan Komputer',
        'Administrasi Server',
        'Troubleshooting Hardware',
        'Konfigurasi Router',
        'Keamanan Jaringan'
    ],
    'tkr': [
        'Diagnosa Mesin',
        'Sistem Kelistrikan Kendaraan',
        'Perawatan Berkala',
        'Perbaikan Transmisi',
        'Sistem Rem dan Suspensi'
    ],
    'til': [
        'Instalasi Listrik Rumah',
        'Panel Listrik',
        'Motor Listrik',
        'Sistem Kontrol',
        'Keselamatan Kerja Listrik'
    ]
};

// Career recommendations mapping (Base score is stored in 'match')
const careerMapping = {
    'agribisnis': [
        { name: 'Quality Control Perikanan', match: 85, reason: 'Sesuai dengan keahlian pengolahan dan analisis kualitas produk perikanan' },
        { name: 'Supervisor Produksi Makanan Laut', match: 80, reason: 'Cocok untuk mengelola proses produksi dengan latar belakang agribisnis' },
        { name: 'Marketing Produk Perikanan', match: 75, reason: 'Kombinasi pengetahuan produk dan kemampuan pemasaran' }
    ],
    'tkj': [
        { name: 'Network Administrator', match: 90, reason: 'Sangat sesuai dengan keahlian jaringan komputer dan administrasi server' },
        { name: 'IT Support Specialist', match: 85, reason: 'Cocok untuk troubleshooting dan maintenance sistem komputer' },
        { name: 'Cyber Security Analyst', match: 80, reason: 'Sesuai dengan pengetahuan keamanan jaringan dan sistem' }
    ],
    'tkr': [
        { name: 'Mekanik Otomotif', match: 90, reason: 'Sangat sesuai dengan keahlian diagnosa dan perbaikan kendaraan' },
        { name: 'Service Advisor', match: 75, reason: 'Kombinasi pengetahuan teknis dan kemampuan komunikasi dengan pelanggan' },
        { name: 'Quality Inspector Otomotif', match: 80, reason: 'Cocok untuk inspeksi kualitas komponen kendaraan' }
    ],
    'til': [
        { name: 'Teknisi Listrik', match: 90, reason: 'Sangat sesuai dengan keahlian instalasi dan maintenance sistem listrik' },
        { name: 'Electrical Supervisor', match: 85, reason: 'Cocok untuk mengawasi proyek instalasi listrik' },
        { name: 'Maintenance Engineer', match: 80, reason: 'Sesuai untuk perawatan sistem kelistrikan industri' }
    ]
};

// --- START: ELEMENT SDK AND INITIALIZATION ---

// Element SDK implementation
const element = {
    defaultConfig,
    onConfigChange: async (config) => {
        document.getElementById('app-title').textContent = config.app_title || defaultConfig.app_title;
        document.getElementById('welcome-message').textContent = config.welcome_message || defaultConfig.welcome_message;
    },
    mapToCapabilities: (config) => ({
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
    }),
    mapToEditPanelValues: (config) => new Map([
        ["app_title", config.app_title || defaultConfig.app_title],
        ["welcome_message", config.welcome_message || defaultConfig.welcome_message]
    ])
};

// Initialize Element SDK
if (window.elementSdk) {
    window.elementSdk.init(element);
}

// --- END: ELEMENT SDK AND INITIALIZATION ---

// --- START: NAVIGATION FUNCTIONS ---

// Page navigation functions
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
}

function showHome() {
    showPage('home-page');
}

function showHistory() {
    loadHistory();
    showPage('history-page');
}

function startNewForm() {
    currentFormData = {};
    showPage('academic-page');
}

function showAcademic() {
    showPage('academic-page');
}

function showSkills() {
    if (!validateAcademicData()) {
        return;
    }
    collectAcademicData();
    populateSkills();
    showPage('skills-page');
}

function showExperience() {
    if (!validateSkillsData()) {
        return;
    }
    collectSkillsData();
    showPage('experience-page');
}

function showPreferences() {
    if (!validateExperienceData()) {
        return;
    }
    collectExperienceData();
    showPage('preferences-page');
}

// --- END: NAVIGATION FUNCTIONS ---

// --- START: VALIDATION AND UTILITIES ---

// Validation functions
function validateAcademicData() {
    const jurusan = document.querySelector('input[name="jurusan"]:checked');
    const tahunLulus = document.getElementById('tahun-lulus').value;
    const pendidikan = document.querySelector('input[name="pendidikan"]:checked');

    if (!jurusan) {
        showErrorMessage('Silakan pilih jurusan terlebih dahulu');
        return false;
    }
    if (!tahunLulus) {
        showErrorMessage('Silakan pilih tahun lulus terlebih dahulu');
        return false;
    }
    if (!pendidikan) {
        showErrorMessage('Silakan pilih pendidikan terakhir terlebih dahulu');
        return false;
    }
    return true;
}

function validateSkillsData() {
    const skills = document.querySelectorAll('#skills-list input[type="checkbox"]:checked');
    if (skills.length === 0) {
        showErrorMessage('Silakan pilih minimal satu keterampilan');
        return false;
    }
    return true;
}

function validateExperienceData() {
    const experience = document.querySelector('input[name="pengalaman"]:checked');
    if (!experience) {
        showErrorMessage('Silakan pilih pengalaman kerja Anda');
        return false;
    }
    return true;
}

function validatePreferencesData() {
    const preferences = document.querySelector('input[name="preferensi"]:checked');
    if (!preferences) {
        showErrorMessage('Silakan pilih preferensi pekerjaan Anda');
        return false;
    }
    return true;
}

function showErrorMessage(message) {
    // Remove existing error message if any
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and show error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorMessage.textContent = '⚠️ ' + message;
    document.body.appendChild(errorMessage);

    setTimeout(() => {
        errorMessage.remove();
    }, 3000);
}

// Utility functions
function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 success-message';
    successMessage.textContent = message;
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// --- END: VALIDATION AND UTILITIES ---

// --- START: DATA COLLECTION AND POPULATION ---

// Data collection functions
function collectAcademicData() {
    const jurusan = document.querySelector('input[name="jurusan"]:checked')?.value;
    const tahunLulus = document.getElementById('tahun-lulus').value;
    const pendidikan = document.querySelector('input[name="pendidikan"]:checked')?.value;

    currentFormData.jurusan = jurusan;
    currentFormData.tahunLulus = tahunLulus;
    currentFormData.pendidikan = pendidikan;
}

function collectSkillsData() {
    const skills = Array.from(document.querySelectorAll('#skills-list input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    const additionalSkills = document.getElementById('additional-skills').value;

    currentFormData.skills = skills;
    currentFormData.additionalSkills = additionalSkills;
}

function collectExperienceData() {
    const experience = document.querySelector('input[name="pengalaman"]:checked')?.value;

    currentFormData.experience = experience;
}

function collectPreferencesData() {
    const preferences = document.querySelector('input[name="preferensi"]:checked')?.value;

    currentFormData.preferences = preferences;
}

// Skills population
function populateSkills() {
    const skillsList = document.getElementById('skills-list');
    const jurusan = currentFormData.jurusan;
    const skills = skillsMapping[jurusan] || [];

    skillsList.innerHTML = '';
    skills.forEach(skill => {
        const skillElement = document.createElement('label');
        skillElement.className = 'flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer';
        skillElement.innerHTML = `
            <input type="checkbox" class="checkbox-custom" value="${skill}">
            <span>${skill}</span>
        `;
        skillsList.appendChild(skillElement);
    });
}

// --- END: DATA COLLECTION AND POPULATION ---

// --- START: RECOMMENDATIONS LOGIC (FIX IMPLEMENTED) ---

// Fungsi baru untuk menyesuaikan skor kecocokan berdasarkan input pengguna lainnya
function adjustMatchScore(career, formData) {
    let score = career.match; // Mulai dari skor dasar (dari careerMapping)

    // 1. Penyesuaian berdasarkan Pendidikan Terakhir
    // Bonus untuk tingkat pendidikan yang lebih tinggi
    if (formData.pendidikan === 'sarjana') {
        score += 5;
    } else if (formData.pendidikan === 'diploma') {
        score += 2;
    } else if (formData.pendidikan === 'sma') {
        score -= 3; // Sedikit pengurangan untuk standar minimum
    }
    
    // 2. Penyesuaian berdasarkan Pengalaman Kerja
    // Bonus berdasarkan pengalaman kerja
    if (formData.experience === '1-3-tahun') {
        score += 10;
    } else if (formData.experience === 'kurang-1-tahun') {
        score += 5;
    } else if (formData.experience === 'magang') {
        score += 3;
    } else if (formData.experience === 'fresh-graduate') {
        score -= 5;
    }
    
    // 3. Penyesuaian berdasarkan Keterampilan yang Dipilih
    // Setiap keterampilan yang dicentang memberikan bonus
    if (formData.skills && Array.isArray(formData.skills)) {
        score += formData.skills.length * 2; // Bonus 2 poin per skill
    }
    
    // 4. Penyesuaian berdasarkan Tahun Lulus
    const currentYear = new Date().getFullYear();
    const graduationYear = parseInt(formData.tahunLulus);
    const yearsSinceGraduation = currentYear - graduationYear;

    // Pengurangan untuk lulus lama tanpa pengalaman yang memadai
    if (yearsSinceGraduation > 2 && formData.experience === 'fresh-graduate') {
        score -= (yearsSinceGraduation - 2) * 2; 
    }
    
    // 5. Penyesuaian berdasarkan Preferensi (hanya contoh sederhana, bisa diabaikan jika tidak relevan)
    if (formData.preferences === 'part-time') {
        score += 1; // Mungkin sedikit lebih fleksibel
    }

    // Batasi skor agar tidak melebihi 100 atau di bawah 0
    return Math.max(0, Math.min(100, score));
}

// Recommendations generation
function generateRecommendations() {
    if (!validatePreferencesData()) {
        return;
    }
    collectPreferencesData();
    
    const jurusan = currentFormData.jurusan;
    let careers = careerMapping[jurusan] || [];
    
    // 1. Sesuaikan skor kecocokan berdasarkan data FORM LENGKAP
    const adjustedCareers = careers.map(career => {
        const newMatch = adjustMatchScore(career, currentFormData);
        // Buat objek baru dengan skor yang sudah disesuaikan
        return { 
            ...career, 
            match: newMatch 
        };
    });
    
    // 2. Sortir hasil berdasarkan skor kecocokan yang sudah disesuaikan (tertinggi di atas)
    adjustedCareers.sort((a, b) => b.match - a.match);
    
    // 3. Ambil 3 rekomendasi teratas
    currentRecommendations = adjustedCareers.slice(0, 3);

    displayRecommendations();
    showPage('recommendations-page');
}

function displayRecommendations() {
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';

    if (currentRecommendations.length === 0) {
        recommendationsList.innerHTML = `
            <div class="text-center py-8">
                <div class="text-gray-500 text-lg mb-2">🤔</div>
                <p class="text-gray-600">Tidak ada rekomendasi yang sesuai dengan profil Anda saat ini.</p>
            </div>
        `;
        return;
    }

    currentRecommendations.forEach((career, index) => {
        const careerElement = document.createElement('div');
        careerElement.className = 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6';
        careerElement.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">${career.name}</h3>
                <div class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${career.match}% Cocok
                </div>
            </div>
            <p class="text-gray-700 mb-4">${career.reason}</p>
            <div class="bg-white rounded-lg p-3">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">Tingkat Kesesuaian:</span>
                    <div class="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all duration-500 progress-bar" style="width: ${career.match}%"></div>
                    </div>
                    <span class="font-medium text-blue-600">${career.match}%</span>
                </div>
            </div>
        `;
        recommendationsList.appendChild(careerElement);
    });
}

// --- END: RECOMMENDATIONS LOGIC (FIX IMPLEMENTED) ---

// --- START: HISTORY MANAGEMENT ---

// History management
function saveRecommendations() {
    const historyData = {
        timestamp: new Date().toISOString(),
        formData: { ...currentFormData },
        recommendations: [...currentRecommendations]
    };

    localStorage.setItem('careerHistory', JSON.stringify(historyData));
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 success-message';
    successMessage.textContent = '✅ Rekomendasi berhasil disimpan!';
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
        showHome();
    }, 2000);
}

function loadHistory() {
    const historyContent = document.getElementById('history-content');
    const savedHistory = localStorage.getItem('careerHistory');

    if (!savedHistory) {
        historyContent.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">📋</div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">History Kosong</h3>
                <p class="text-gray-600 mb-6">Belum ada rekomendasi yang disimpan. Mulai form baru untuk mendapatkan rekomendasi karir.</p>
                <button onclick="startNewForm()" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg btn-primary">
                    Mulai Form Baru
                </button>
            </div>
        `;
        return;
    }

    const history = JSON.parse(savedHistory);
    const date = new Date(history.timestamp).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    historyContent.innerHTML = `
        <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Rekomendasi Terakhir</h3>
                <button onclick="deleteHistory()" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Hapus History">
                    🗑️
                </button>
            </div>
            <p class="text-sm text-gray-600 mb-4">Disimpan pada: ${date}</p>
            
            <div class="bg-white rounded-lg p-4 mb-4">
                <h4 class="font-medium text-gray-800 mb-2">Profil Anda:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                    <li><strong>Jurusan:</strong> ${history.formData.jurusan || 'Tidak dipilih'}</li>
                    <li><strong>Tahun Lulus:</strong> ${history.formData.tahunLulus || 'Tidak dipilih'}</li>
                    <li><strong>Pendidikan:</strong> ${history.formData.pendidikan || 'Tidak dipilih'}</li>
                    <li><strong>Pengalaman:</strong> ${history.formData.experience || 'Tidak dipilih'}</li>
                    <li><strong>Preferensi:</strong> ${history.formData.preferences || 'Tidak dipilih'}</li>
                </ul>
            </div>

            <div class="space-y-3">
                <h4 class="font-medium text-gray-800">Rekomendasi Karir:</h4>
                ${history.recommendations.map(career => `
                    <div class="bg-white border rounded-lg p-4 card-hover">
                        <div class="flex items-center justify-between mb-2">
                            <h5 class="font-medium text-gray-800">${career.name}</h5>
                            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">${career.match}% Cocok</span>
                        </div>
                        <p class="text-sm text-gray-600">${career.reason}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function deleteHistory() {
    // Create custom confirmation modal instead of browser confirm
    const confirmModal = document.createElement('div');
    confirmModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay';
    confirmModal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4 modal-content">
            <div class="text-center mb-4">
                <div class="text-4xl mb-2">🗑️</div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Hapus History</h3>
                <p class="text-gray-600">Apakah Anda yakin ingin menghapus history rekomendasi ini?</p>
            </div>
            <div class="flex space-x-3">
                <button onclick="cancelDelete()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Batal
                </button>
                <button onclick="confirmDelete()" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Hapus
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal);
}

function cancelDelete() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function confirmDelete() {
    // Remove the modal first
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }

    // Delete the history
    localStorage.removeItem('careerHistory');
    loadHistory();
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 success-message';
    successMessage.textContent = '🗑️ History berhasil dihapus!';
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 2000);
}

// --- END: HISTORY MANAGEMENT ---

// --- START: INITIALIZATION ---

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    showHome();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                cancelDelete();
            }
        }
    });
    
    // Add form auto-save functionality
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Auto-save form data to localStorage for recovery
            const autoSaveData = {
                timestamp: new Date().toISOString(),
                formData: currentFormData
            };
            localStorage.setItem('careerFormAutoSave', JSON.stringify(autoSaveData));
        });
    });
    
    // Load auto-saved data if available
    const autoSavedData = localStorage.getItem('careerFormAutoSave');
    if (autoSavedData) {
        try {
            const parsed = JSON.parse(autoSavedData);
            const saveTime = new Date(parsed.timestamp);
            const now = new Date();
            const hoursDiff = (now - saveTime) / (1000 * 60 * 60);
            
            // Only restore if saved within last 24 hours
            if (hoursDiff < 24) {
                currentFormData = parsed.formData || {};
            }
        } catch (e) {
            console.log('Could not restore auto-saved data');
        }
    }
});

// Export functions for global access (if needed)
window.careerApp = {
    showHome,
    showHistory,
    startNewForm,
    showAcademic,
    showSkills,
    showExperience,
    showPreferences,
    generateRecommendations,
    saveRecommendations,
    deleteHistory,
    cancelDelete,
    confirmDelete
};

// --- END: INITIALIZATION ---