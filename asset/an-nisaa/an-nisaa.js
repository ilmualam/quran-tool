// =======================================================
// Surah An-Nisa Interactive Tool
// Verses: loaded from JSON
// Domain Signature: ilmualam.com (JANGAN BUANG)
// =======================================================
(function () {
  'use strict';

  // ==========================
  // CONFIG & CONSTANTS
  // ==========================
  const ILMUALAM_SIGNATURE = "ilmualam.com - Surah An-Nisa Interactive Tool";
  const CONTAINER_ID = 'surah-an-nisa-container';
  const LOCAL_STORAGE_SETTINGS_KEY = 'ilmu_an_nisa_settings_v1';
  const LOCAL_STORAGE_BOOKMARKS_KEY = 'ilmu_an_nisa_bookmarks_v1';

  // ====== TUKAR KAT SINI: URL JSON AYAT AN-NISA ======
  // Upload file JSON yang kau bagi ke path ni atau ubah ikut repo kau.
  const VERSES_JSON_URL = 'https://cdn.jsdelivr.net/gh/ilmualam/quran-tool@main/asset/an-nisaa/annisa-verses.json';

  // Mapping qari -> edition id API AlQuran.cloud (boleh adjust kalau perlu)
  const QARI_EDITIONS = {
    mishary: 'ar.alafasy',
    husary: 'ar.husary',
    sudais: 'ar.abdurrahmaansudais'
  };

  const SURAH_NUMBER = 4; // An-Nisa

  // Cache audio URL by qari+verse
  const audioCache = {};

  let state = {
    verses: [],
    isPlaying: false,
    currentVerseNumber: 1,
    autoScroll: true,
    showTransliteration: true,
    arabicFontSize: 28,
    translationFontSize: 16,
    bookmarks: [],
    currentQari: 'mishary'
  };

  let els = {};
  let audio;

  // ==========================
  // INIT
  // ==========================
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // Bind container & elements
    els.container = container;
    els.versesContainer = container.querySelector('#versesContainer');
    els.loadingIndicator = container.querySelector('#loadingIndicator');
    els.playPauseBtn = container.querySelector('#playPauseBtn');
    els.playIcon = container.querySelector('#playIcon');
    els.pauseIcon = container.querySelector('#pauseIcon');
    els.qariSelector = container.querySelector('#qariSelector');
    els.settingsToggle = container.querySelector('#settingsToggle');
    els.settingsContent = container.querySelector('#settingsContent');
    els.arabicSize = container.querySelector('#arabicSize');
    els.arabicSizeValue = container.querySelector('#arabicSizeValue');
    els.translationSize = container.querySelector('#translationSize');
    els.translationSizeValue = container.querySelector('#translationSizeValue');
    els.showTransliterationCheckbox = container.querySelector('#showTransliteration');
    els.autoScrollCheckbox = container.querySelector('#autoScroll');
    els.currentVerseLabel = container.querySelector('#currentVerse');
    els.audioTimeLabel = container.querySelector('#audioTime');
    els.progressBar = container.querySelector('#progressBar');
    els.toast = document.getElementById('toast') || container.querySelector('.toast');

    // Setup audio
    audio = new Audio();
    audio.preload = 'metadata';

    restoreSettings();
    restoreBookmarks();
    bindGlobalEvents();

    // Load verses from JSON
    loadVersesFromJson().then(() => {
      console.info(ILMUALAM_SIGNATURE);
    });
  }

  // ==========================
  // LOAD VERSES
  // ==========================
  async function loadVersesFromJson() {
    try {
      if (els.loadingIndicator) {
        els.loadingIndicator.style.display = 'flex';
      }

      const res = await fetch(VERSES_JSON_URL, { cache: 'force-cache' });
      if (!res.ok) {
        throw new Error('Gagal memuatkan data ayat An-Nisa');
      }
      const data = await res.json();

      // Expect: array of { number, arabic, transliteration, translation }
      state.verses = Array.isArray(data) ? data : [];
      renderVerses();

      if (els.loadingIndicator) {
        els.loadingIndicator.style.display = 'none';
      }
    } catch (err) {
      console.error(err);
      if (els.loadingIndicator) {
        els.loadingIndicator.innerHTML = '<p>Ralat memuatkan data Surah An-Nisa. Sila cuba lagi.</p>';
      }
      showToast('Gagal memuatkan ayat. Semak URL JSON atau sambungan internet.');
    }
  }

  // ==========================
  // RENDER VERSES
  // ==========================
  function renderVerses() {
    if (!els.versesContainer) return;
    els.versesContainer.innerHTML = '';

    const frag = document.createDocumentFragment();

    state.verses.forEach((v) => {
      const verseNum = v.number;

      const verseEl = document.createElement('div');
      verseEl.className = 'verse';
      verseEl.dataset.verseNumber = String(verseNum);

      const header = document.createElement('div');
      header.className = 'verse-header';

      const numberBtn = document.createElement('button');
      numberBtn.className = 'verse-number';
      numberBtn.type = 'button';
      numberBtn.textContent = verseNum;
      numberBtn.dataset.verseNumber = String(verseNum);

      const actions = document.createElement('div');
      actions.className = 'verse-actions';

      // Play button
      const playBtn = document.createElement('button');
      playBtn.className = 'verse-action-btn verse-play-btn';
      playBtn.type = 'button';
      playBtn.dataset.verseNumber = String(verseNum);
      playBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      `;

      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'verse-action-btn verse-copy-btn';
      copyBtn.type = 'button';
      copyBtn.dataset.verseNumber = String(verseNum);
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 
          0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 
          16H8V7h11v14z"></path>
        </svg>
      `;

      // Share button
      const shareBtn = document.createElement('button');
      shareBtn.className = 'verse-action-btn verse-share-btn';
      shareBtn.type = 'button';
      shareBtn.dataset.verseNumber = String(verseNum);
      shareBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 
          12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.02-4.11C16.56 
          7.7 17.24 8 18 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 
          1.34-3 3c0 .24.04.47.09.7L8.07 9.81C7.55 9.33 6.87 
          9.03 6.11 9.03 4.45 9.03 3.11 10.37 3.11 12.03s1.34 
          3 3 3c.76 0 1.44-.3 1.96-.77l7.12 4.18c-.05.21-.08.43-.08.66 
          0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 
          2.92-2.92-1.31-2.92-2.92-2.92z"></path>
        </svg>
      `;

      // Bookmark button
      const bookmarkBtn = document.createElement('button');
      bookmarkBtn.className = 'verse-action-btn verse-bookmark-btn';
      bookmarkBtn.type = 'button';
      bookmarkBtn.dataset.verseNumber = String(verseNum);
      bookmarkBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M6 4c0-1.1.9-2 2-2h8c1.1 0 
          2 .9 2 2v18l-7-3-7 3V4z"></path>
        </svg>
      `;

      if (state.bookmarks.includes(verseNum)) {
        bookmarkBtn.classList.add('is-bookmarked');
      }

      actions.appendChild(playBtn);
      actions.appendChild(copyBtn);
      actions.appendChild(shareBtn);
      actions.appendChild(bookmarkBtn);

      header.appendChild(numberBtn);
      header.appendChild(actions);

      const arabic = document.createElement('div');
      arabic.className = 'verse-arabic';
      arabic.textContent = v.arabic || '';

      const translit = document.createElement('div');
      translit.className = 'verse-transliteration';
      translit.textContent = v.transliteration || '';

      const translation = document.createElement('p');
      translation.className = 'verse-translation';
      translation.textContent = v.translation || '';

      verseEl.appendChild(header);
      verseEl.appendChild(arabic);
      verseEl.appendChild(translit);
      verseEl.appendChild(translation);

      frag.appendChild(verseEl);
    });

    els.versesContainer.appendChild(frag);

    applySettingsToDOM();
    bindVerseEvents();
  }

  // ==========================
  // SETTINGS & BOOKMARKS
  // ==========================
  function restoreSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY));
      if (saved && typeof saved === 'object') {
        state.arabicFontSize = saved.arabicFontSize || state.arabicFontSize;
        state.translationFontSize = saved.translationFontSize || state.translationFontSize;
        state.showTransliteration = saved.showTransliteration !== false;
        state.autoScroll = saved.autoScroll !== false;
        state.currentQari = saved.currentQari || state.currentQari;
      }
    } catch (e) {
      // ignore
    }

    if (els.arabicSize) {
      els.arabicSize.value = state.arabicFontSize;
      if (els.arabicSizeValue) els.arabicSizeValue.textContent = state.arabicFontSize + 'px';
    }
    if (els.translationSize) {
      els.translationSize.value = state.translationFontSize;
      if (els.translationSizeValue) els.translationSizeValue.textContent = state.translationFontSize + 'px';
    }
    if (els.showTransliterationCheckbox) {
      els.showTransliterationCheckbox.checked = state.showTransliteration;
    }
    if (els.autoScrollCheckbox) {
      els.autoScrollCheckbox.checked = state.autoScroll;
    }
    if (els.qariSelector) {
      els.qariSelector.value = state.currentQari;
    }

    applySettingsToDOM();
  }

  function saveSettings() {
    const payload = {
      arabicFontSize: state.arabicFontSize,
      translationFontSize: state.translationFontSize,
      showTransliteration: state.showTransliteration,
      autoScroll: state.autoScroll,
      currentQari: state.currentQari
    };
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(payload));
  }

  function restoreBookmarks() {
    try {
      const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY));
      if (Array.isArray(saved)) {
        state.bookmarks = saved.map(Number).filter(Boolean);
      }
    } catch (e) {
      state.bookmarks = [];
    }
  }

  function saveBookmarks() {
    localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(state.bookmarks));
  }

  function applySettingsToDOM() {
    if (!els.container) return;
    els.container.style.setProperty('--an-nisa-arabic-font', state.arabicFontSize + 'px');
    els.container.style.setProperty('--an-nisa-translation-font', state.translationFontSize + 'px');
    els.container.dataset.showTranslit = state.showTransliteration ? '1' : '0';
  }

  // ==========================
  // EVENTS
  // ==========================
  function bindGlobalEvents() {
    if (els.playPauseBtn) {
      els.playPauseBtn.addEventListener('click', onGlobalPlayPause);
    }

    if (els.qariSelector) {
      els.qariSelector.addEventListener('change', (e) => {
        state.currentQari = e.target.value;
        saveSettings();
        // reset audio cache for new qari
        audio.pause();
        state.isPlaying = false;
        updatePlayPauseIcon();
        showToast('Qari ditukar.');
      });
    }

    if (els.settingsToggle && els.settingsContent) {
      els.settingsToggle.addEventListener('click', () => {
        const display = els.settingsContent.style.display === 'none' || !els.settingsContent.style.display;
        els.settingsContent.style.display = display ? 'block' : 'none';
      });
    }

    if (els.arabicSize) {
      els.arabicSize.addEventListener('input', (e) => {
        state.arabicFontSize = Number(e.target.value) || 28;
        if (els.arabicSizeValue) els.arabicSizeValue.textContent = state.arabicFontSize + 'px';
        applySettingsToDOM();
        saveSettings();
      });
    }

    if (els.translationSize) {
      els.translationSize.addEventListener('input', (e) => {
        state.translationFontSize = Number(e.target.value) || 16;
        if (els.translationSizeValue) els.translationSizeValue.textContent = state.translationFontSize + 'px';
        applySettingsToDOM();
        saveSettings();
      });
    }

    if (els.showTransliterationCheckbox) {
      els.showTransliterationCheckbox.addEventListener('change', (e) => {
        state.showTransliteration = !!e.target.checked;
        applySettingsToDOM();
        saveSettings();
      });
    }

    if (els.autoScrollCheckbox) {
      els.autoScrollCheckbox.addEventListener('change', (e) => {
        state.autoScroll = !!e.target.checked;
        saveSettings();
      });
    }

    // Audio events
    audio.addEventListener('timeupdate', handleAudioTimeUpdate);
    audio.addEventListener('ended', handleAudioEnded);
  }

  function bindVerseEvents() {
    if (!els.versesContainer) return;

    els.versesContainer.addEventListener('click', async (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const verseNumber = Number(target.dataset.verseNumber || target.getAttribute('data-verse-number'));
      if (!verseNumber) return;

      if (target.classList.contains('verse-number') || target.classList.contains('verse-play-btn')) {
        // play that verse
        await playSpecificVerse(verseNumber);
      } else if (target.classList.contains('verse-copy-btn')) {
        handleCopyVerse(verseNumber);
      } else if (target.classList.contains('verse-share-btn')) {
        handleShareVerse(verseNumber);
      } else if (target.classList.contains('verse-bookmark-btn')) {
        handleBookmarkToggle(verseNumber, target);
      }
    });
  }

  // ==========================
  // AUDIO CONTROL
  // ==========================
  function onGlobalPlayPause() {
    // If nothing has been played yet, start from currentVerseNumber
    if (!state.isPlaying) {
      playSpecificVerse(state.currentVerseNumber);
    } else {
      audio.pause();
      state.isPlaying = false;
      updatePlayPauseIcon();
    }
  }

  async function playSpecificVerse(verseNumber) {
    if (!verseNumber || verseNumber < 1 || verseNumber > state.verses.length) return;

    state.currentVerseNumber = verseNumber;

    try {
      const url = await getAudioUrlForVerse(state.currentQari, verseNumber);
      if (!url) {
        showToast('Audio tidak tersedia untuk ayat ini.');
        return;
      }

      audio.src = url;
      audio.currentTime = 0;
      await audio.play();
      state.isPlaying = true;

      updatePlayPauseIcon();
      updateActiveVerseHighlight();
      updateCurrentVerseLabel();

      if (state.autoScroll) {
        scrollToVerse(verseNumber);
      }
    } catch (err) {
      console.error(err);
      showToast('Tidak dapat memainkan audio. Cuba lagi.');
    }
  }

  async function getAudioUrlForVerse(qariKey, verseNumber) {
    const editionId = QARI_EDITIONS[qariKey] || QARI_EDITIONS.mishary;
    const cacheKey = `${editionId}-${verseNumber}`;

    if (audioCache[cacheKey]) return audioCache[cacheKey];

    // Guna API AlQuran.cloud untuk dapatkan URL audio
    const apiUrl = `https://api.alquran.cloud/v1/ayah/${SURAH_NUMBER}:${verseNumber}/${editionId}`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.warn('Fail to fetch audio:', apiUrl);
      return null;
    }
    const json = await res.json();
    const audioUrl = json?.data?.audio;
    if (audioUrl) {
      audioCache[cacheKey] = audioUrl;
    }
    return audioUrl || null;
  }

  function handleAudioTimeUpdate() {
    if (!els.audioTimeLabel || !els.progressBar) return;

    const cur = audio.currentTime || 0;
    const dur = audio.duration || 0;

    els.audioTimeLabel.textContent = `${formatTime(cur)} / ${dur ? formatTime(dur) : '0:00'}`;

    const pct = dur ? (cur / dur) * 100 : 0;
    els.progressBar.style.width = `${pct}%`;
  }

  function handleAudioEnded() {
    // Auto next verse
    const nextVerse = state.currentVerseNumber + 1;
    if (nextVerse <= state.verses.length) {
      playSpecificVerse(nextVerse);
    } else {
      state.isPlaying = false;
      updatePlayPauseIcon();
    }
  }

  function updatePlayPauseIcon() {
    if (!els.playIcon || !els.pauseIcon) return;
    if (state.isPlaying) {
      els.playIcon.style.display = 'none';
      els.pauseIcon.style.display = 'block';
    } else {
      els.playIcon.style.display = 'block';
      els.pauseIcon.style.display = 'none';
    }
  }

  function updateCurrentVerseLabel() {
    if (els.currentVerseLabel) {
      els.currentVerseLabel.textContent = `Ayat ${state.currentVerseNumber}`;
    }
  }

  function updateActiveVerseHighlight() {
    if (!els.versesContainer) return;

    const oldActive = els.versesContainer.querySelector('.verse.active');
    if (oldActive) oldActive.classList.remove('active');

    const newActive = els.versesContainer.querySelector(
      `.verse[data-verse-number="${state.currentVerseNumber}"]`
    );
    if (newActive) newActive.classList.add('active');
  }

  function scrollToVerse(verseNumber) {
    if (!els.versesContainer) return;
    const verseEl = els.versesContainer.querySelector(`.verse[data-verse-number="${verseNumber}"]`);
    if (!verseEl) return;

    verseEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  // ==========================
  // COPY, SHARE, BOOKMARK
  // ==========================
  function getVerseObject(verseNumber) {
    return state.verses.find((v) => v.number === verseNumber);
  }

  function buildVerseTextForShare(verseNumber) {
    const v = getVerseObject(verseNumber);
    if (!v) return '';
    return [
      `Surah An-Nisa, Ayat ${verseNumber}`,
      '',
      v.arabic || '',
      '',
      v.transliteration || '',
      '',
      v.translation || '',
      '',
      `— via ${ILMUALAM_SIGNATURE}`
    ].join('\n');
  }

  async function handleCopyVerse(verseNumber) {
    const text = buildVerseTextForShare(verseNumber);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Ayat ${verseNumber} telah disalin.`);
    } catch (e) {
      showToast('Gagal salin ke papan klip.');
    }
  }

  async function handleShareVerse(verseNumber) {
    const text = buildVerseTextForShare(verseNumber);
    if (!text) return;

    const url = 'https://www.ilmualam.com/'; // boleh tukar ke URL khusus artikel An-Nisa

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Surah An-Nisa Ayat ${verseNumber} - ilmualam.com`,
          text,
          url
        });
      } catch (e) {
        // user cancel
      }
    } else {
      // fallback copy
      try {
        await navigator.clipboard.writeText(text);
        showToast('Perkongsian tidak disokong. Teks ayat telah disalin.');
      } catch (e) {
        showToast('Gagal perkongsian. Cuba lagi.');
      }
    }
  }

  function handleBookmarkToggle(verseNumber, btn) {
    const idx = state.bookmarks.indexOf(verseNumber);
    if (idx === -1) {
      state.bookmarks.push(verseNumber);
      btn.classList.add('is-bookmarked');
      showToast(`Ayat ${verseNumber} ditanda sebagai tandabuku.`);
    } else {
      state.bookmarks.splice(idx, 1);
      btn.classList.remove('is-bookmarked');
      showToast(`Tandabuku ayat ${verseNumber} dibuang.`);
    }
    saveBookmarks();
  }

  // ==========================
  // UTILS
  // ==========================
  function formatTime(sec) {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? '0' + r : r}`;
  }

  let toastTimeout;
  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      els.toast.classList.remove('show');
    }, 2600);
  }
})();
