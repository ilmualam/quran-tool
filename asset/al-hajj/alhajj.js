/*!
 * Surah Al-Hajj Interactive Reader
 * Version: 1.0.0
 * Author: IlmuAlam.com
 * License: MIT
 * Description: Interactive Quran reader for Surah Al-Hajj with audio, rumi, translation, and bookmark features
 * API: Al-Quran Cloud (https://alquran.cloud/api)
 * Copyright (c) 2025 IlmuAlam.com
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        surahNumber: 22,
        surahName: 'Al-Hajj',
        totalAyahs: 78,
        apiBase: 'https://api.alquran.cloud/v1',
        editions: {
            arabic: 'quran-simple-enhanced',
            translation: 'ms.basmeih',
            transliteration: 'en.transliteration',
            audio: 'ar.alafasy'
        },
        storageKey: 'ilm_hajj_bookmarks',
        colors: {
            primary: '#249749',
            text: '#0c3808'
        }
    };

    // Hidden copyright (Base64 encoded)
    const _0x5a2b=['SW1sdUFsYW0uY29t','QWxsIHJpZ2h0cyByZXNlcnZlZA=='];

    // State management
    let state = {
        ayahs: [],
        currentAudio: null,
        playingAyah: null,
        bookmarks: loadBookmarks(),
        isLoading: true
    };

    // Initialize
    function init() {
        const container = document.getElementById('surah-reader-tool');
        if (!container) {
            console.error('Surah reader container not found');
            return;
        }
        
        injectStyles();
        renderLoading(container);
        fetchSurahData();
    }

    // Inject CSS styles
    function injectStyles() {
        if (document.getElementById('ilm-hajj-styles')) return;
        
        const styles = `
        .ilm-x-reader{max-width:900px;margin:32px auto;padding:16px;font-family:-apple-system,BlinkMacSystemFont,"Inter",Roboto,sans-serif;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
        .ilm-x-header{background:linear-gradient(135deg,${CONFIG.colors.primary} 0%,#1a7838 100%);color:#fff;padding:20px;border-radius:8px 8px 0 0;margin:-16px -16px 24px;text-align:center}
        .ilm-x-header h2{margin:0 0 8px;font-size:1.5rem;font-weight:700}
        .ilm-x-meta{font-size:0.9rem;opacity:0.95}
        .ilm-x-controls{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;justify-content:center}
        .ilm-x-btn{padding:8px 16px;border:none;border-radius:6px;font-size:0.9rem;cursor:pointer;transition:all 0.3s;font-weight:600;display:inline-flex;align-items:center;gap:6px}
        .ilm-x-btn-primary{background:${CONFIG.colors.primary};color:#fff}
        .ilm-x-btn-primary:hover{background:#1a7838;transform:translateY(-2px)}
        .ilm-x-btn-secondary{background:#f5f5f5;color:${CONFIG.colors.text}}
        .ilm-x-btn-secondary:hover{background:#e0e0e0}
        .ilm-x-search{width:100%;max-width:400px;padding:10px 16px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.95rem;transition:border 0.3s}
        .ilm-x-search:focus{outline:none;border-color:${CONFIG.colors.primary}}
        .ilm-x-ayah{background:#fafafa;border:2px solid transparent;border-radius:8px;padding:16px;margin-bottom:16px;transition:all 0.3s}
        .ilm-x-ayah:hover{border-color:#e0e0e0;box-shadow:0 2px 6px rgba(0,0,0,0.05)}
        .ilm-x-ayah.ilm-x-playing{background:#e8f5ec;border-color:${CONFIG.colors.primary}}
        .ilm-x-ayah.ilm-x-bookmarked{border-left:4px solid ${CONFIG.colors.primary}}
        .ilm-x-ayah-num{background:${CONFIG.colors.primary};color:#fff;padding:4px 10px;border-radius:20px;font-size:0.85rem;font-weight:700;display:inline-block;margin-bottom:12px}
        .ilm-x-arabic{font-size:1.8rem;line-height:2.5;text-align:right;direction:rtl;font-family:"Amiri","Traditional Arabic","Scheherazade",serif;color:${CONFIG.colors.text};margin:16px 0}
        .ilm-x-rumi{font-size:1rem;line-height:1.8;font-style:italic;color:#555;margin:12px 0;padding:12px;background:#fff;border-radius:6px}
        .ilm-x-translation{font-size:0.95rem;line-height:1.7;color:${CONFIG.colors.text};margin:12px 0;padding:12px;background:#fff;border-radius:6px}
        .ilm-x-ayah-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
        .ilm-x-action-btn{padding:6px 12px;border:1px solid #ddd;background:#fff;border-radius:6px;font-size:0.85rem;cursor:pointer;transition:all 0.3s;display:inline-flex;align-items:center;gap:4px}
        .ilm-x-action-btn:hover{background:${CONFIG.colors.primary};color:#fff;border-color:${CONFIG.colors.primary}}
        .ilm-x-action-btn.ilm-x-active{background:${CONFIG.colors.primary};color:#fff;border-color:${CONFIG.colors.primary}}
        .ilm-x-loading{text-align:center;padding:60px 20px}
        .ilm-x-spinner{border:3px solid #f3f3f3;border-top:3px solid ${CONFIG.colors.primary};border-radius:50%;width:40px;height:40px;animation:ilm-spin 1s linear infinite;margin:0 auto 16px}
        @keyframes ilm-spin{to{transform:rotate(360deg)}}
        .ilm-x-error{background:#ffebee;color:#c62828;padding:16px;border-radius:8px;margin:20px 0;text-align:center}
        .ilm-x-filter-info{background:#e3f2fd;color:#1565c0;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:0.9rem;text-align:center}
        .ilm-x-no-results{text-align:center;padding:40px;color:#666;font-size:1.1rem}
        @media (max-width:600px){
        .ilm-x-reader{padding:12px;margin:16px auto}
        .ilm-x-header{padding:16px;margin:-12px -12px 16px}
        .ilm-x-header h2{font-size:1.3rem}
        .ilm-x-arabic{font-size:1.5rem;line-height:2.2}
        .ilm-x-controls{gap:8px}
        .ilm-x-btn{padding:6px 12px;font-size:0.85rem}
        .ilm-x-ayah{padding:12px}
        .ilm-x-action-btn{padding:5px 10px;font-size:0.8rem}
        }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'ilm-hajj-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Render loading state
    function renderLoading(container) {
        container.innerHTML = `
            <div class="ilm-x-reader">
                <div class="ilm-x-loading">
                    <div class="ilm-x-spinner"></div>
                    <p>Memuatkan Surah ${CONFIG.surahName}...</p>
                </div>
            </div>
        `;
    }

    // Render error
    function renderError(container, message) {
        container.innerHTML = `
            <div class="ilm-x-reader">
                <div class="ilm-x-header">
                    <h2>Surah ${CONFIG.surahName}</h2>
                    <div class="ilm-x-meta">${CONFIG.totalAyahs} Ayat | Madaniyyah</div>
                </div>
                <div class="ilm-x-error">
                    ⚠️ ${message}
                    <br><small>Sila cuba sebentar lagi atau hubungi pentadbir.</small>
                </div>
            </div>
        `;
    }

    // Fetch Surah data from API
    async function fetchSurahData() {
        try {
            // Fetch all editions in parallel
            const [arabicRes, translationRes, transliterationRes, audioRes] = await Promise.all([
                fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/editions/${CONFIG.editions.arabic}`),
                fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/editions/${CONFIG.editions.translation}`),
                fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/editions/${CONFIG.editions.transliteration}`),
                fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/editions/${CONFIG.editions.audio}`)
            ]);

            if (!arabicRes.ok || !translationRes.ok || !transliterationRes.ok || !audioRes.ok) {
                throw new Error('Gagal memuatkan data dari API');
            }

            const [arabicData, translationData, transliterationData, audioData] = await Promise.all([
                arabicRes.json(),
                translationRes.json(),
                transliterationRes.json(),
                audioRes.json()
            ]);

            // Combine data
            const arabic = arabicData.data[0].ayahs;
            const translation = translationData.data[0].ayahs;
            const transliteration = transliterationData.data[0].ayahs;
            const audio = audioData.data[0].ayahs;

            state.ayahs = arabic.map((ayah, index) => ({
                number: ayah.number,
                numberInSurah: ayah.numberInSurah,
                arabic: ayah.text,
                translation: translation[index].text,
                transliteration: transliteration[index].text,
                audio: audio[index].audio
            }));

            state.isLoading = false;
            render();
        } catch (error) {
            console.error('Error fetching Surah data:', error);
            const container = document.getElementById('surah-reader-tool');
            renderError(container, 'Maaf, terdapat masalah memuatkan data Al-Quran.');
        }
    }

    // Render main interface
    function render(filteredAyahs = null) {
        const container = document.getElementById('surah-reader-tool');
        const ayahsToDisplay = filteredAyahs || state.ayahs;
        
        const html = `
            <div class="ilm-x-reader">
                <div class="ilm-x-header">
                    <h2>Surah ${CONFIG.surahName} (الحج)</h2>
                    <div class="ilm-x-meta">${CONFIG.totalAyahs} Ayat | Surah Madaniyyah | Juzuk 17</div>
                </div>

                <div class="ilm-x-controls">
                    <input 
                        type="text" 
                        class="ilm-x-search" 
                        placeholder="🔍 Cari ayat (rumi atau terjemahan)..."
                        id="ilm-search-input"
                    >
                    <button class="ilm-x-btn ilm-x-btn-secondary" onclick="ilmHajjReader.showBookmarks()">
                        ⭐ Simpanan (${state.bookmarks.length})
                    </button>
                    <button class="ilm-x-btn ilm-x-btn-secondary" onclick="ilmHajjReader.stopAllAudio()">
                        ⏸️ Hentikan Audio
                    </button>
                </div>

                ${filteredAyahs ? `
                    <div class="ilm-x-filter-info">
                        📌 Menunjukkan ${filteredAyahs.length} hasil carian
                        <button class="ilm-x-btn ilm-x-btn-secondary" style="margin-left:12px;padding:4px 12px" onclick="ilmHajjReader.clearSearch()">
                            ✕ Padam Carian
                        </button>
                    </div>
                ` : ''}

                <div id="ilm-ayah-list">
                    ${ayahsToDisplay.length > 0 ? ayahsToDisplay.map(renderAyah).join('') : '<div class="ilm-x-no-results">Tiada hasil dijumpai</div>'}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Add search listener
        const searchInput = document.getElementById('ilm-search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    // Render single ayah
    function renderAyah(ayah) {
        const isBookmarked = state.bookmarks.includes(ayah.numberInSurah);
        const isPlaying = state.playingAyah === ayah.numberInSurah;
        
        return `
            <div class="ilm-x-ayah ${isPlaying ? 'ilm-x-playing' : ''} ${isBookmarked ? 'ilm-x-bookmarked' : ''}" id="ayah-${ayah.numberInSurah}">
                <div class="ilm-x-ayah-num">Ayat ${ayah.numberInSurah}</div>
                
                <div class="ilm-x-arabic">${ayah.arabic}</div>
                
                <div class="ilm-x-rumi">
                    <strong>Rumi:</strong> ${ayah.transliteration}
                </div>
                
                <div class="ilm-x-translation">
                    <strong>Terjemahan:</strong> ${ayah.translation}
                </div>

                <div class="ilm-x-ayah-actions">
                    <button class="ilm-x-action-btn ${isPlaying ? 'ilm-x-active' : ''}" onclick="ilmHajjReader.playAudio(${ayah.numberInSurah}, '${ayah.audio}')">
                        ${isPlaying ? '⏸️ Henti' : '▶️ Dengar'}
                    </button>
                    <button class="ilm-x-action-btn" onclick="ilmHajjReader.copyAyah(${ayah.numberInSurah})">
                        📋 Salin
                    </button>
                    <button class="ilm-x-action-btn" onclick="ilmHajjReader.shareAyah(${ayah.numberInSurah})">
                        🔗 Kongsi
                    </button>
                    <button class="ilm-x-action-btn ${isBookmarked ? 'ilm-x-active' : ''}" onclick="ilmHajjReader.toggleBookmark(${ayah.numberInSurah})">
                        ${isBookmarked ? '★' : '☆'} Simpan
                    </button>
                </div>
            </div>
        `;
    }

    // Play audio
    function playAudio(ayahNumber, audioUrl) {
        // Stop current audio if playing
        if (state.currentAudio) {
            state.currentAudio.pause();
            state.currentAudio.currentTime = 0;
        }

        // If clicking the same ayah, just stop
        if (state.playingAyah === ayahNumber) {
            state.playingAyah = null;
            render();
            return;
        }

        // Play new audio
        state.currentAudio = new Audio(audioUrl);
        state.playingAyah = ayahNumber;
        
        state.currentAudio.play().catch(err => {
            console.error('Audio play error:', err);
            alert('Maaf, gagal memainkan audio. Sila cuba lagi.');
            state.playingAyah = null;
        });

        state.currentAudio.onended = () => {
            state.playingAyah = null;
            render();
        };

        // Scroll to ayah
        setTimeout(() => {
            const ayahEl = document.getElementById(`ayah-${ayahNumber}`);
            if (ayahEl) {
                ayahEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        render();
    }

    // Stop all audio
    function stopAllAudio() {
        if (state.currentAudio) {
            state.currentAudio.pause();
            state.currentAudio.currentTime = 0;
            state.currentAudio = null;
        }
        state.playingAyah = null;
        render();
    }

    // Copy ayah
    function copyAyah(ayahNumber) {
        const ayah = state.ayahs.find(a => a.numberInSurah === ayahNumber);
        if (!ayah) return;

        const text = `Surah ${CONFIG.surahName} - Ayat ${ayahNumber}

${ayah.arabic}

Rumi: ${ayah.transliteration}

Terjemahan: ${ayah.translation}

Sumber: IlmuAlam.com`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('✅ Ayat berjaya disalin!');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    // Fallback copy method
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showToast('✅ Ayat berjaya disalin!');
        } catch (err) {
            showToast('❌ Gagal menyalin. Sila cuba lagi.');
        }
        
        document.body.removeChild(textarea);
    }

    // Share ayah
    function shareAyah(ayahNumber) {
        const ayah = state.ayahs.find(a => a.numberInSurah === ayahNumber);
        if (!ayah) return;

        const shareData = {
            title: `Surah ${CONFIG.surahName} - Ayat ${ayahNumber}`,
            text: `${ayah.translation}\n\n`,
            url: `${window.location.href}#ayah-${ayahNumber}`
        };

        if (navigator.share) {
            navigator.share(shareData).catch(() => {
                fallbackShare(ayahNumber);
            });
        } else {
            fallbackShare(ayahNumber);
        }
    }

    // Fallback share
    function fallbackShare(ayahNumber) {
        const url = `${window.location.href}#ayah-${ayahNumber}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('🔗 Pautan berjaya disalin!');
            });
        } else {
            showToast('🔗 Pautan: ' + url);
        }
    }

    // Toggle bookmark
    function toggleBookmark(ayahNumber) {
        const index = state.bookmarks.indexOf(ayahNumber);
        
        if (index > -1) {
            state.bookmarks.splice(index, 1);
            showToast('☆ Bookmark dibuang');
        } else {
            state.bookmarks.push(ayahNumber);
            showToast('★ Bookmark disimpan');
        }

        saveBookmarks();
        render();
    }

    // Show bookmarks only
    function showBookmarks() {
        if (state.bookmarks.length === 0) {
            showToast('Tiada bookmark disimpan');
            return;
        }

        const bookmarkedAyahs = state.ayahs.filter(a => 
            state.bookmarks.includes(a.numberInSurah)
        );

        render(bookmarkedAyahs);
    }

    // Handle search
    function handleSearch(query) {
        if (!query.trim()) {
            render();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = state.ayahs.filter(ayah => 
            ayah.transliteration.toLowerCase().includes(searchTerm) ||
            ayah.translation.toLowerCase().includes(searchTerm)
        );

        render(filtered);
    }

    // Clear search
    function clearSearch() {
        const searchInput = document.getElementById('ilm-search-input');
        if (searchInput) searchInput.value = '';
        render();
    }

    // Show toast notification
    function showToast(message) {
        // Remove existing toast
        const existing = document.querySelector('.ilm-x-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'ilm-x-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position:fixed;
            bottom:20px;
            left:50%;
            transform:translateX(-50%);
            background:${CONFIG.colors.text};
            color:#fff;
            padding:12px 24px;
            border-radius:8px;
            font-size:0.9rem;
            z-index:10000;
            box-shadow:0 4px 12px rgba(0,0,0,0.3);
            animation:ilm-toast-in 0.3s ease;
        `;

        // Add animation
        const keyframes = `
            @keyframes ilm-toast-in {
                from { opacity:0; transform:translateX(-50%) translateY(20px); }
                to { opacity:1; transform:translateX(-50%) translateY(0); }
            }
        `;
        
        if (!document.getElementById('ilm-toast-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ilm-toast-keyframes';
            style.textContent = keyframes;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // Load bookmarks from localStorage
    function loadBookmarks() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    // Save bookmarks to localStorage
    function saveBookmarks() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.bookmarks));
        } catch (e) {
            console.error('Failed to save bookmarks:', e);
        }
    }

    // Global API
    window.ilmHajjReader = {
        playAudio,
        stopAllAudio,
        copyAyah,
        shareAyah,
        toggleBookmark,
        showBookmarks,
        clearSearch
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Console signature
    console.log('%c' + atob(_0x5a2b[0]), 'color:#249749;font-weight:bold;font-size:14px');
    console.log('%c' + atob(_0x5a2b[1]), 'color:#666;font-size:12px');

})();
