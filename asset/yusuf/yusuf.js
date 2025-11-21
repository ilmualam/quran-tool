/*!
 * Surah Yusuf Interactive Reader v1.0.0
 * https://github.com/ilmualam/surah-yusuf-reader
 * 
 * Copyright (c) 2025 IlmuAlam
 * Licensed under MIT License
 * 
 * Features:
 * - 111 Ayat Surah Yusuf from API
 * - Audio player per ayat
 * - Bookmark functionality
 * - Search by keyword
 * - Rumi transliteration
 * - Malay translation
 * - Tafsir ringkas
 * 
 * API Source: Al-Quran Cloud API (https://alquran.cloud/api)
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    SURAH_NUMBER: 12,
    API_BASE: 'https://api.alquran.cloud/v1',
    EDITIONS: {
      arabic: 'quran-uthmani',
      translation: 'ms.basmeih', // Malay translation
      transliteration: 'en.transliteration'
    },
    AUDIO_BASE: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy',
    STORAGE_KEY: 'ilmu-yusuf-bookmarks'
  };

  // State
  let ayatData = [];
  let currentAudio = null;
  let currentAyat = null;
  let bookmarks = [];
  let showBookmarksOnly = false;
  let isLoading = false;

  // Initialize
  function init() {
    loadBookmarks();
    fetchSurahData();
    setupEventListeners();
  }

  // Load bookmarks from localStorage
  function loadBookmarks() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      bookmarks = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load bookmarks:', e);
      bookmarks = [];
    }
  }

  // Save bookmarks to localStorage
  function saveBookmarks() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks:', e);
    }
  }

  // Fetch Surah Yusuf data from API
  async function fetchSurahData() {
    const container = document.getElementById('ilmuAyatContainer');
    if (!container) return;

    isLoading = true;
    showLoading();

    try {
      // Fetch Arabic, Translation, and Transliteration in parallel
      const [arabicRes, translationRes, transliterationRes] = await Promise.all([
        fetch(`${CONFIG.API_BASE}/surah/${CONFIG.SURAH_NUMBER}/${CONFIG.EDITIONS.arabic}`),
        fetch(`${CONFIG.API_BASE}/surah/${CONFIG.SURAH_NUMBER}/${CONFIG.EDITIONS.translation}`),
        fetch(`${CONFIG.API_BASE}/surah/${CONFIG.SURAH_NUMBER}/${CONFIG.EDITIONS.transliteration}`)
      ]);

      const arabicData = await arabicRes.json();
      const translationData = await translationRes.json();
      const transliterationData = await transliterationRes.json();

      // Combine data
      if (arabicData.data && translationData.data && transliterationData.data) {
        const arabicAyahs = arabicData.data.ayahs;
        const translationAyahs = translationData.data.ayahs;
        const transliterationAyahs = transliterationData.data.ayahs;

        ayatData = arabicAyahs.map((ayah, index) => ({
          num: ayah.numberInSurah,
          arabic: ayah.text,
          rumi: transliterationAyahs[index]?.text || '',
          translation: translationAyahs[index]?.text || '',
          tafsir: getTafsir(ayah.numberInSurah),
          audioUrl: `${CONFIG.AUDIO_BASE}/${ayah.number}.mp3`
        }));

        renderAyat(ayatData);
      } else {
        showError('Data tidak lengkap dari API');
      }
    } catch (error) {
      console.error('Error fetching surah data:', error);
      showError('Gagal memuatkan data. Sila semak sambungan internet anda.');
    } finally {
      isLoading = false;
    }
  }

  // Get tafsir for specific ayat (simplified version)
  function getTafsir(ayatNum) {
    const tafsirMap = {
      1: 'Surah dibuka dengan huruf-huruf mukataah. Al-Kitab al-Mubeen merujuk kepada Al-Quran yang jelas.',
      2: 'Al-Quran diturunkan dalam bahasa Arab kerana ia adalah bahasa yang kaya dan tepat.',
      3: 'Kisah Nabi Yusuf AS adalah "ahsanal qasas" (kisah paling baik) kerana penuh pengajaran.',
      4: 'Mimpi Yusuf AS melihat 11 bintang, matahari, dan bulan sujud kepadanya.',
      5: 'Nabi Ya\'qub AS menasihati Yusuf AS agar tidak menceritakan mimpinya kepada saudaranya.',
      6: 'Allah berjanji akan memberi Yusuf AS ilmu tafsir mimpi dan menyempurnakan nikmatNya.',
      18: 'Nabi Ya\'qub AS mengamalkan "Sabrun Jameel" - kesabaran yang indah tanpa mengeluh.',
      87: 'Ayat terkenal tentang larangan berputus asa dari rahmat Allah SWT.',
      111: 'Pengajaran bahawa kisah para Rasul penuh hikmah untuk orang yang berfikir.'
    };
    return tafsirMap[ayatNum] || 'Pengajaran dari ayat ini mengajar kita tentang kesabaran, tawakkal, dan akhlak mulia.';
  }

  // Show loading state
  function showLoading() {
    const container = document.getElementById('ilmuAyatContainer');
    if (container) {
      container.innerHTML = `
        <div class="ilmu-x-loading">
          <p>⏳ Memuatkan ayat-ayat Surah Yusuf...</p>
          <p style="font-size:0.9rem;margin-top:8px">Sambungan ke API Al-Quran</p>
        </div>
      `;
    }
  }

  // Show error message
  function showError(message) {
    const container = document.getElementById('ilmuAyatContainer');
    if (container) {
      container.innerHTML = `
        <div class="ilmu-x-loading">
          <p style="color:#d32f2f">❌ ${message}</p>
          <button class="ilmu-x-btn" onclick="location.reload()" style="margin-top:16px">🔄 Cuba Semula</button>
        </div>
      `;
    }
  }

  // Render ayat list
  function renderAyat(data) {
    const container = document.getElementById('ilmuAyatContainer');
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = '<div class="ilmu-x-loading"><p>Tiada ayat ditemui.</p></div>';
      return;
    }

    container.innerHTML = data.map(ayat => `
      <div class="ilmu-x-ayat-item" data-ayat="${ayat.num}" id="ilmu-ayat-${ayat.num}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px">
          <span class="ilmu-x-ayat-number">Ayat ${ayat.num}</span>
          <div style="display:flex;gap:6px">
            <button class="ilmu-x-btn ilmu-x-btn-small" onclick="ilmuPlayAyat(${ayat.num})" style="padding:4px 10px;font-size:0.8rem" title="Main audio">▶</button>
            <button class="ilmu-x-btn ilmu-x-btn-secondary ilmu-x-btn-small" onclick="ilmuToggleBookmark(${ayat.num})" style="padding:4px 10px;font-size:0.8rem" title="Bookmark">${bookmarks.includes(ayat.num) ? '⭐' : '☆'}</button>
          </div>
        </div>
        <div class="ilmu-x-arabic">${ayat.arabic}</div>
        <div class="ilmu-x-rumi">${ayat.rumi}</div>
        <div class="ilmu-x-translation">${ayat.translation}</div>
        <details style="margin-top:8px">
          <summary style="cursor:pointer;color:var(--ilmu-primary);font-weight:600;padding:4px 0">📚 Tafsir Ringkas</summary>
          <p style="margin-top:8px;color:#555;line-height:1.6;padding:8px;background:#f9f9f9;border-radius:4px">${ayat.tafsir}</p>
        </details>
      </div>
    `).join('');
  }

  // Setup event listeners
  function setupEventListeners() {
    // Search functionality
    const searchBox = document.getElementById('ilmuSearchAyat');
    if (searchBox) {
      searchBox.addEventListener('input', handleSearch);
    }

    // Control buttons
    const playAllBtn = document.getElementById('ilmuPlayAll');
    if (playAllBtn) {
      playAllBtn.addEventListener('click', () => {
        alert('Fungsi main semua akan tersedia dalam versi akan datang');
      });
    }

    const stopBtn = document.getElementById('ilmuStopAll');
    if (stopBtn) {
      stopBtn.addEventListener('click', stopAudio);
    }

    const bookmarkBtn = document.getElementById('ilmuToggleBookmarks');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', toggleBookmarksView);
    }
  }

  // Handle search
  function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      renderAyat(ayatData);
      showBookmarksOnly = false;
      return;
    }

    const filtered = ayatData.filter(ayat => 
      ayat.rumi.toLowerCase().includes(query) ||
      ayat.translation.toLowerCase().includes(query) ||
      ayat.tafsir.toLowerCase().includes(query) ||
      ayat.arabic.includes(query)
    );

    renderAyat(filtered);
  }

  // Toggle bookmarks view
  function toggleBookmarksView() {
    showBookmarksOnly = !showBookmarksOnly;
    const btn = document.getElementById('ilmuToggleBookmarks');
    
    if (showBookmarksOnly) {
      const bookmarkedAyat = ayatData.filter(a => bookmarks.includes(a.num));
      renderAyat(bookmarkedAyat);
      if (btn) btn.textContent = '📖 Semua';
    } else {
      renderAyat(ayatData);
      if (btn) btn.textContent = '⭐ Bookmark';
    }
  }

  // Stop audio playback
  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (currentAyat) {
      const elem = document.getElementById('ilmu-ayat-' + currentAyat);
      if (elem) elem.classList.remove('ilmu-x-active');
      currentAyat = null;
    }
  }

  // Global function: Play ayat audio
  window.ilmuPlayAyat = function(num) {
    stopAudio();

    const ayat = ayatData.find(a => a.num === num);
    if (!ayat) return;

    // Highlight current ayat
    currentAyat = num;
    const elem = document.getElementById('ilmu-ayat-' + num);
    if (elem) {
      elem.classList.add('ilmu-x-active');
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Play audio
    try {
      currentAudio = new Audio(ayat.audioUrl);
      currentAudio.play().catch(err => {
        console.warn('Audio playback failed:', err);
        alert('Gagal memainkan audio. Sila semak sambungan internet.');
      });

      currentAudio.onended = function() {
        if (elem) elem.classList.remove('ilmu-x-active');
        currentAyat = null;
      };
    } catch (err) {
      console.error('Audio error:', err);
      alert('Gagal memainkan audio.');
    }
  };

  // Global function: Toggle bookmark
  window.ilmuToggleBookmark = function(num) {
    const index = bookmarks.indexOf(num);
    
    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(num);
    }

    saveBookmarks();

    // Re-render
    if (showBookmarksOnly) {
      const bookmarkedAyat = ayatData.filter(a => bookmarks.includes(a.num));
      renderAyat(bookmarkedAyat);
    } else {
      renderAyat(ayatData);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* Encoded Copyright: ©IlmuAlam 2025 - U3VyYWggWXVzdWYgUmVhZGVyIC0gSWxtdUFsYW0= */
