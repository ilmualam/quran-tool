/**
 * Surah An-Nahl Interactive Tool
 * Version: 1.0.0
 * Author: IlmuAlam.com
 * License: MIT
 * 
 * Copyright (c) 2025 IlmuAlam.com
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    surahNumber: 16,
    totalAyahs: 128,
    apiBase: 'https://api.alquran.cloud/v1',
    domain: 'ilmualam.com',
    qariOptions: {
      'ar.alafasy': 'Mishary Rashid Alafasy',
      'ar.husary': 'Mahmoud Khalil Al-Husary',
      'ar.abdurrahmaansudais': 'Abdul Rahman Al-Sudais'
    },
    defaultQari: 'ar.alafasy',
    edition: {
      arabic: 'quran-uthmani',
      transliteration: 'en.transliteration',
      translation: 'ms.basmeih'
    }
  };

  // State management
  const state = {
    currentAyah: 1,
    isPlaying: false,
    selectedQari: CONFIG.defaultQari,
    surahData: null,
    bookmarks: JSON.parse(localStorage.getItem('quran-bookmarks-16') || '[]'),
    settings: JSON.parse(localStorage.getItem('quran-settings') || '{"arabicSize":28,"translationSize":14,"showRumi":true,"autoScroll":true}')
  };

  // Initialize tool
  function init() {
    renderSkeleton();
    fetchSurahData();
    attachEventListeners();
  }

  // Render loading skeleton
  function renderSkeleton() {
    const container = document.getElementById('ilmu-quran-tool');
    if (!container) return;

    container.innerHTML = `
      <style>
        .ilmu-quran-container{font-family:-apple-system,BlinkMacSystemFont,"Inter",Roboto,"Helvetica Neue",Arial,sans-serif}
        .ilmu-quran-header{background:linear-gradient(135deg,#249749 0%,#0c3808 100%);color:#fff;padding:10px;border-radius:8px 8px 0 0;margin-bottom:10px;}
        .ilmu-quran-title{font-size:1.5rem;font-weight:700;margin:0 0 0.5rem;text-align:center}
        .ilmu-quran-meta{display:flex;justify-content:center;gap:1.5rem;font-size:0.875rem}
        .ilmu-quran-controls{background:#f8f9fa;padding:1rem;border-radius:8px;margin-bottom:1rem;display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center}
        .ilmu-quran-audio-player{flex:1;min-width:200px;display:flex;align-items:center;gap:0.5rem}
        .ilmu-quran-btn{background:#249749;color:#fff;border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:600;transition:all 0.2s}
        .ilmu-quran-btn:hover{background:#1d7a3a;transform:translateY(-1px)}
        .ilmu-quran-btn:active{transform:translateY(0)}
        .ilmu-quran-select{padding:0.5rem;border-radius:6px;border:1px solid #ddd;font-size:0.875rem;background:#fff}
        .ilmu-quran-progress{flex:1;height:6px;background:#e0e0e0;border-radius:3px;cursor:pointer;position:relative;overflow:hidden}
        .ilmu-quran-progress-bar{height:100%;background:#249749;border-radius:3px;width:0;transition:width 0.3s}
        .ilmu-quran-settings{display:none;background:#fff;border:1px solid #ddd;border-radius:8px;padding:1rem;margin-bottom:1rem}
        .ilmu-quran-settings.active{display:block}
        .ilmu-quran-setting-item{margin-bottom:1rem}
        .ilmu-quran-setting-label{display:block;margin-bottom:0.25rem;font-size:0.875rem;font-weight:600;color:#0c3808}
        .ilmu-quran-slider{width:100%;height:6px;border-radius:3px;background:#ddd;outline:none}
        .ilmu-quran-checkbox{margin-right:0.5rem}
        .ilmu-quran-ayah{background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:10px;margin-bottom:10px;transition:all 0.3s}
        .ilmu-quran-ayah.active{border-color:#249749;box-shadow:0 4px 12px rgba(36,151,73,0.15)}
        .ilmu-quran-ayah-number{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;background:#249749;color:#fff;border-radius:50%;font-weight:700;font-size:0.875rem;margin-bottom:0.75rem;cursor:pointer;transition:all 0.2s}
        .ilmu-quran-ayah-number:hover{transform:scale(1.1)}
        .ilmu-quran-arabic{font-family:"Amiri","Traditional Arabic","Al Qalam Quran Majeed","Arabic Typesetting",serif;font-size:28px;line-height:2;text-align:right;color:#0c3808;margin-bottom:0.75rem;direction:rtl}
        .ilmu-quran-transliteration{font-size:14px;line-height:1.5;text-align:left;color:#0c3808;font-style:italic;margin-bottom:0.75rem;border:1px dashed;border-color:#0c3803;border-radius:5px;background-color:#f8fdf9;}
        .ilmu-quran-translation{font-size:15px;text-align:left;line-height:1.5;color:#0c3808;margin-bottom:0.75rem}
        .ilmu-quran-actions{display:flex;gap:0.5rem;flex-wrap:wrap}
        .ilmu-quran-action-btn{background:#f8f9fa;border:1px solid #ddd;color:#0c3808;padding:0.4rem 0.75rem;border-radius:6px;font-size:0.75rem;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:0.25rem}
        .ilmu-quran-action-btn:hover{background:#e9ecef;border-color:#249749}
        .ilmu-quran-action-btn.active{background:#249749;color:#fff;border-color:#249749}
        .ilmu-quran-loading{text-align:center;padding:3rem 1rem;color:#666}
        .ilmu-quran-spinner{border:3px solid #f3f3f3;border-top:3px solid #249749;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 1rem}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @media (max-width:640px){
          .ilmu-quran-title{font-size:1.25rem}
          .ilmu-quran-controls{flex-direction:column}
          .ilmu-quran-audio-player{width:100%}
          .ilmu-quran-arabic{font-size:24px}
        }
      </style>
      <div class="ilmu-quran-container">
        <div class="ilmu-quran-header">
          <h2 class="ilmu-quran-title">سورة النحل<br>Surah An-Nahl</h2>
          <div class="ilmu-quran-meta">
            <span>📖 128 Ayat</span>
            <span>📍 Makkiyah</span>
            <span>🐝 Lebah</span>
          </div>
        </div>
        <div class="ilmu-quran-controls">
          <div class="ilmu-quran-audio-player">
            <button class="ilmu-quran-btn" id="playBtn">▶ Play</button>
            <select class="ilmu-quran-select" id="qariSelect">
              <option value="ar.alafasy">Mishary Alafasy</option>
              <option value="ar.husary">Husary</option>
              <option value="ar.abdurrahmaansudais">Sudais</option>
            </select>
            <div class="ilmu-quran-progress" id="progress">
              <div class="ilmu-quran-progress-bar" id="progressBar"></div>
            </div>
          </div>
          <button class="ilmu-quran-btn" id="settingsBtn">⚙️ Tetapan</button>
        </div>
        <div class="ilmu-quran-settings" id="settingsPanel">
          <div class="ilmu-quran-setting-item">
            <label class="ilmu-quran-setting-label">Saiz Arab: <span id="arabicSizeValue">28</span>px</label>
            <input type="range" class="ilmu-quran-slider" id="arabicSize" min="20" max="40" value="28">
          </div>
          <div class="ilmu-quran-setting-item">
            <label class="ilmu-quran-setting-label">Saiz Terjemahan: <span id="translationSizeValue">14</span>px</label>
            <input type="range" class="ilmu-quran-slider" id="translationSize" min="12" max="22" value="14">
          </div>
          <div class="ilmu-quran-setting-item">
            <label class="ilmu-quran-setting-label">
              <input type="checkbox" class="ilmu-quran-checkbox" id="showRumi" checked>
              Tunjuk Transliterasi (Rumi)
            </label>
          </div>
          <div class="ilmu-quran-setting-item">
            <label class="ilmu-quran-setting-label">
              <input type="checkbox" class="ilmu-quran-checkbox" id="autoScroll" checked>
              Auto Scroll
            </label>
          </div>
        </div>
        <div id="ayahsContainer" class="ilmu-quran-loading">
          <div class="ilmu-quran-spinner"></div>
          <p>Memuatkan Surah An-Nahl...</p>
        </div>
      </div>
      <audio id="audioPlayer" preload="none"></audio>
    `;
  }

  // Fetch surah data from API
  async function fetchSurahData() {
    try {
      const [arabic, transliteration, translation, audio] = await Promise.all([
        fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/${CONFIG.edition.arabic}`).then(r => r.json()),
        fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/${CONFIG.edition.transliteration}`).then(r => r.json()),
        fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/${CONFIG.edition.translation}`).then(r => r.json()),
        fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/${state.selectedQari}`).then(r => r.json())
      ]);

      state.surahData = {
        ayahs: arabic.data.ayahs.map((ayah, index) => ({
          number: ayah.numberInSurah,
          arabic: ayah.text,
          transliteration: transliteration.data.ayahs[index].text,
          translation: translation.data.ayahs[index].text,
          audio: audio.data.ayahs[index].audio
        }))
      };

      renderAyahs();
    } catch (error) {
      console.error('Error fetching surah data:', error);
      document.getElementById('ayahsContainer').innerHTML = '<p style="color:red;text-align:center">Ralat memuatkan data. Sila cuba lagi.</p>';
    }
  }

  // Render all ayahs
  function renderAyahs() {
    const container = document.getElementById('ayahsContainer');
    container.innerHTML = state.surahData.ayahs.map(ayah => `
      <div class="ilmu-quran-ayah" id="ayah-${ayah.number}" data-ayah="${ayah.number}">
        <div class="ilmu-quran-ayah-number" data-ayah="${ayah.number}">${ayah.number}</div>
        <div class="ilmu-quran-arabic" style="font-size:${state.settings.arabicSize}px">${ayah.arabic}</div>
        <div class="ilmu-quran-transliteration" style="font-size:${state.settings.translationSize}px;display:${state.settings.showRumi ? 'block' : 'none'}">${ayah.transliteration}</div>
        <div class="ilmu-quran-translation" style="font-size:${state.settings.translationSize}px">${ayah.translation}</div>
        <div class="ilmu-quran-actions">
          <button class="ilmu-quran-action-btn" data-action="play" data-ayah="${ayah.number}">▶ Main</button>
          <button class="ilmu-quran-action-btn" data-action="copy" data-ayah="${ayah.number}">📋 Salin</button>
          <button class="ilmu-quran-action-btn" data-action="share" data-ayah="${ayah.number}">↗️ Kongsi</button>
          <button class="ilmu-quran-action-btn ${state.bookmarks.includes(ayah.number) ? 'active' : ''}" data-action="bookmark" data-ayah="${ayah.number}">
            ${state.bookmarks.includes(ayah.number) ? '★' : '☆'} Bookmark
          </button>
        </div>
      </div>
    `).join('');

    attachAyahListeners();
  }

  // Attach event listeners
  function attachEventListeners() {
    // Play/Pause button
    document.getElementById('playBtn').addEventListener('click', togglePlayPause);

    // Qari selection
    document.getElementById('qariSelect').addEventListener('change', (e) => {
      state.selectedQari = e.target.value;
      fetchSurahData();
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      document.getElementById('settingsPanel').classList.toggle('active');
    });

    // Settings controls
    document.getElementById('arabicSize').addEventListener('input', (e) => {
      state.settings.arabicSize = e.target.value;
      document.getElementById('arabicSizeValue').textContent = e.target.value;
      updateSettings();
    });

    document.getElementById('translationSize').addEventListener('input', (e) => {
      state.settings.translationSize = e.target.value;
      document.getElementById('translationSizeValue').textContent = e.target.value;
      updateSettings();
    });

    document.getElementById('showRumi').addEventListener('change', (e) => {
      state.settings.showRumi = e.target.checked;
      updateSettings();
    });

    document.getElementById('autoScroll').addEventListener('change', (e) => {
      state.settings.autoScroll = e.target.checked;
      saveSettings();
    });

    // Audio player events
    const audio = document.getElementById('audioPlayer');
    audio.addEventListener('ended', playNextAyah);
    audio.addEventListener('error', () => console.error('Audio playback error'));
  }

  // Attach ayah-specific listeners
  function attachAyahListeners() {
    // Ayah number click
    document.querySelectorAll('.ilmu-quran-ayah-number').forEach(el => {
      el.addEventListener('click', (e) => {
        const ayahNum = parseInt(e.target.dataset.ayah);
        scrollToAyah(ayahNum);
        playAyah(ayahNum);
      });
    });

    // Action buttons
    document.querySelectorAll('.ilmu-quran-action-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const ayahNum = parseInt(e.target.dataset.ayah);
        handleAction(action, ayahNum);
      });
    });
  }

  // Toggle play/pause
  function togglePlayPause() {
    if (state.isPlaying) {
      pauseAudio();
    } else {
      playAyah(state.currentAyah);
    }
  }

  // Play specific ayah
  function playAyah(ayahNum) {
    const ayah = state.surahData.ayahs[ayahNum - 1];
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');

    audio.src = ayah.audio;
    audio.play();
    state.isPlaying = true;
    state.currentAyah = ayahNum;
    playBtn.textContent = '⏸ Pause';

    highlightAyah(ayahNum);
    updateProgress();

    if (state.settings.autoScroll) {
      scrollToAyah(ayahNum);
    }
  }

  // Pause audio
  function pauseAudio() {
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    audio.pause();
    state.isPlaying = false;
    playBtn.textContent = '▶ Play';
  }

  // Play next ayah
  function playNextAyah() {
    if (state.currentAyah < CONFIG.totalAyahs) {
      playAyah(state.currentAyah + 1);
    } else {
      pauseAudio();
      state.currentAyah = 1;
    }
  }

  // Highlight active ayah
  function highlightAyah(ayahNum) {
    document.querySelectorAll('.ilmu-quran-ayah').forEach(el => el.classList.remove('active'));
    document.getElementById(`ayah-${ayahNum}`)?.classList.add('active');
  }

  // Scroll to ayah
  function scrollToAyah(ayahNum) {
    const element = document.getElementById(`ayah-${ayahNum}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Update progress bar
  function updateProgress() {
    const progress = (state.currentAyah / CONFIG.totalAyahs) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
  }

  // Handle action buttons
  function handleAction(action, ayahNum) {
    const ayah = state.surahData.ayahs[ayahNum - 1];

    switch (action) {
      case 'play':
        playAyah(ayahNum);
        break;

      case 'copy':
        const textToCopy = `Surah An-Nahl, Ayat ${ayahNum}\n\n${ayah.arabic}\n\n${ayah.transliteration}\n\n${ayah.translation}\n\nSumber: ${CONFIG.domain}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
          alert('✓ Ayat disalin ke clipboard!');
        });
        break;

      case 'share':
        const shareText = `Surah An-Nahl, Ayat ${ayahNum}: ${ayah.translation}`;
        if (navigator.share) {
          navigator.share({ title: 'Surah An-Nahl', text: shareText, url: window.location.href });
        } else {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + window.location.href)}`;
          window.open(whatsappUrl, '_blank');
        }
        break;

      case 'bookmark':
        toggleBookmark(ayahNum);
        break;
    }
  }

  // Toggle bookmark
  function toggleBookmark(ayahNum) {
    const index = state.bookmarks.indexOf(ayahNum);
    if (index > -1) {
      state.bookmarks.splice(index, 1);
    } else {
      state.bookmarks.push(ayahNum);
    }
    localStorage.setItem('quran-bookmarks-16', JSON.stringify(state.bookmarks));
    renderAyahs();
  }

  // Update settings display
  function updateSettings() {
    document.querySelectorAll('.ilmu-quran-arabic').forEach(el => {
      el.style.fontSize = `${state.settings.arabicSize}px`;
    });

    document.querySelectorAll('.ilmu-quran-transliteration, .ilmu-quran-translation').forEach(el => {
      if (el.classList.contains('ilmu-quran-transliteration')) {
        el.style.display = state.settings.showRumi ? 'block' : 'none';
      }
      el.style.fontSize = `${state.settings.translationSize}px`;
    });

    saveSettings();
  }

  // Save settings to localStorage
  function saveSettings() {
    localStorage.setItem('quran-settings', JSON.stringify(state.settings));
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Hidden copyright notice (base64 encoded)
  console.log(atob('wqkgMjAyNSBJbG11QWxhbS5jb20gLSBBbGwgUmlnaHRzIFJlc2VydmVk'));
})();
