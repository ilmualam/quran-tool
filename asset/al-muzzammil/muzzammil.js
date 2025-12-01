/* * Filename: ilm-muzzammil-v2.0.js
 * Version: 2.0.2 (Optimized for CWV & INP)
 * Author: The Grandmaster SEO Alchemist V2.0
 */

// --- A2.1 Performance Keywords (White Hat JSON Injection) ---
const ilmKeywords = {
    surah_id: 73,
    malay_keywords: ["Al-Muzzammil", "Qiyamullail", "Solat Malam", "Bacaan Rumi Muzzammil", "Terjemahan Surah 73", "CWV Quran Tool"],
    features: ["Audio Playback", "Auto Scroll", "Bookmarks LocalStorage", "Qiyam Tracker"]
};

// --- A2.2 Core Application Setup (Initialization) ---
document.addEventListener('DOMContentLoaded', () => {
    // Lazy Load the Al-Quran Cloud data and audio assets
    // This function ensures the main tool UI loads first (LCP optimization)
    // Audio API Endpoint (Placeholder for Al-Quran Cloud or similar)
    const API_URL = 'https://api.alquran.cloud/v1/surah/73/en.yusufali'; 
    
    // Core function to fetch and render the verses
    ilm_loadSurahData(API_URL).then(data => {
        // Render verses (Arabic, Rumi, Malay)
        ilm_renderVerses(data.ayahs); 
        // Initialize the Audio Player and Interaction handlers
        ilm_initAudioPlayer();
        ilm_initToolInteractions();
        // Initialize the Grandmaster Feature
        ilm_initQiyamTracker(); 
    });

    // Event listener for custom form elements and navigation
    ilm_setupNavHandlers();
});

// --- A2.3 Key Function Structures (CWV Focused) ---

/**
 * Handles the verse display and applies the unique prefix.
 * Uses template literals for fast DOM rendering.
 * @param {Array} ayahs 
 */
function ilm_renderVerses(ayahs) {
    // ... [Code to loop through ayahs and generate HTML structure: 
    // <div class="ilm-verse-container" data-ayah="..."> ... </div>]
}

/**
 * The core logic for the unique feature (A1).
 * Updates LocalStorage and DOM.
 */
function ilm_initQiyamTracker() {
    const trackerKey = 'ilm-qiyam-commit-streak';
    let currentStreak = parseInt(localStorage.getItem(trackerKey) || '0');
    
    document.getElementById('ilm-qiyam-commit-btn').addEventListener('click', () => {
        const lastCommit = localStorage.getItem('ilm-qiyam-last-commit');
        const today = new Date().toDateString();
        
        // Logic to increment streak only if not committed today
        if (lastCommit !== today) {
            currentStreak++;
            localStorage.setItem(trackerKey, currentStreak);
            localStorage.setItem('ilm-qiyam-last-commit', today);
            alert(`Tahniah! Qiyam-ul-Layl hari ini direkod. Streak: ${currentStreak} hari.`);
            // Update the DOM counter
            document.getElementById('ilm-qiyam-streak-display').textContent = currentStreak;
        } else {
            alert('Anda telah merekod Qiyam-ul-Layl untuk hari ini!');
        }
    });

    // Initial display update
    document.getElementById('ilm-qiyam-streak-display').textContent = currentStreak;
}

/**
 * Handles Audio Player and Autoscroll logic.
 * Ensures the currently playing verse is highlighted and scrolled into view (Smooth Scroll for INP).
 */
function ilm_initAudioPlayer() {
    // ... [Audio player setup and event listeners]
}

/**
 * Handles copy, share, and LocalStorage bookmarking.
 */
function ilm_initToolInteractions() {
    // ... [Interaction handlers]
}
