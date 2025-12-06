// ### addduha.js – Tool Interaktif Surah Ad-Dhuha (IlmuAlam) ###
// - Ambil teks & audio dari api.alquran.cloud (verse-by-verse Alafasy)
// - Auto-scroll & highlight ayat semasa
// - Progress hafazan + bookmark + dark mode + view mode + share

(function () {
  'use strict';

  const API_URL =
    'https://api.alquran.cloud/v1/surah/93/editions/quran-uthmani,ms.basmeih,en.transliteration,ar.alafasy';

  const LS_KEYS = {
    mode: 'ilmu_ad_dhuha_mode',
    dark: 'ilmu_ad_dhuha_dark',
    progress: 'ilmu_ad_dhuha_progress',
    bookmarks: 'ilmu_ad_dhuha_bookmarks',
  };

  function init() {
    const root = document.getElementById('surah-ad-dhuha-tool');
    if (!root) return;

    const versesContainer = root.querySelector('#verses-container');
    const playToggle = root.querySelector('#play-toggle');
    const progressBar = root.querySelector('#audio-progress');
    const progressFill = root.querySelector('#audio-progress-fill');
    const timeDisplay = root.querySelector('#time-display');
    const statProgress = root.querySelector('#stat-progress');
    const statBookmarks = root.querySelector('#stat-bookmarks');
    const controlButtons = root.querySelectorAll('.control-btn');
    const shareButtons = root.querySelectorAll('.share-btn');

    const state = {
      verses: [],
      audios: [],
      currentIndex: 0,
      playing: false,
      mode: 'all',
      dark: false,
      completed: new Set(),
      bookmarks: new Set(),
      audioTimer: null,
    };

    // === Helpers: localStorage ===
    function safeGet(key) {
      try {
        return window.localStorage ? window.localStorage.getItem(key) : null;
      } catch (e) {
        return null;
      }
    }

    function safeSet(key, value) {
      try {
        if (window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {
        // ignore
      }
    }

    // === Load saved prefs (mode / dark / progress / bookmarks) ===
    (function loadSaved() {
      const savedMode = safeGet(LS_KEYS.mode);
      if (savedMode) state.mode = savedMode;

      const savedDark = safeGet(LS_KEYS.dark);
      if (savedDark === '1') {
        state.dark = true;
        root.classList.add('dark-mode');
      }

      const savedProgress = safeGet(LS_KEYS.progress);
      if (savedProgress) {
        savedProgress.split(',').forEach((n) => {
          const num = parseInt(n, 10);
          if (!isNaN(num)) state.completed.add(num);
        });
      }

      const savedBookmarks = safeGet(LS_KEYS.bookmarks);
      if (savedBookmarks) {
        savedBookmarks.split(',').forEach((n) => {
          const num = parseInt(n, 10);
          if (!isNaN(num)) state.bookmarks.add(num);
        });
      }
    })();

    // === Fetch data dari API ===
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        if (!json || json.code !== 200 || !json.data || !Array.isArray(json.data)) {
          throw new Error('Response tidak seperti dijangka');
        }
        buildFromApi(json.data);
      })
      .catch((err) => {
        console.error('Ad-Dhuha tool error:', err);
        if (versesContainer) {
          versesContainer.innerHTML =
            '<p style="padding:12px 0;color:#b91c1c;">Maaf, tool Surah Ad-Dhuha sedang mengalami masalah teknikal. Sila cuba refresh halaman atau cuba lagi kemudian.</p>';
        }
      });

    // === Bina verses dari API multiple editions ===
    function buildFromApi(dataArr) {
      const editions = {};
      dataArr.forEach((entry) => {
        if (entry && entry.edition && entry.edition.identifier) {
          editions[entry.edition.identifier] = entry;
        }
      });

      const ar = editions['quran-uthmani'];
      const ms = editions['ms.basmeih'];
      const rumi = editions['en.transliteration'];
      const audioEd = editions['ar.alafasy'];

      if (!ar || !ms || !rumi || !audioEd) {
        throw new Error(
          'Edition quran-uthmani/ms.basmeih/en.transliteration/ar.alafasy tidak lengkap'
        );
      }

      const total =
        (ar.numberOfAyahs && Number(ar.numberOfAyahs)) ||
        (Array.isArray(ar.ayahs) ? ar.ayahs.length : 0);

      if (!total || !Array.isArray(ar.ayahs)) {
        throw new Error('Data ayat tidak sah');
      }

      const verses = [];
      const audios = [];

      for (let i = 0; i < total; i++) {
        const v = {
          index: i,
          number: i + 1,
          arabic: (ar.ayahs[i] && ar.ayahs[i].text) || '',
          rumi: (rumi.ayahs[i] && rumi.ayahs[i].text) || '',
          translation: (ms.ayahs[i] && ms.ayahs[i].text) || '',
          audioUrl: (audioEd.ayahs[i] && audioEd.ayahs[i].audio) || '',
        };

        verses.push(v);

        const audio = new Audio(v.audioUrl);
        audio.preload = 'none';
        audio.addEventListener('ended', () => handleAudioEnded(i));
        audios.push(audio);
      }

      state.verses = verses;
      state.audios = audios;

      renderVerses();
      applyMode(state.mode);
      updateStats();
      wireControls();
    }

    // === Render verse cards ===
    function renderVerses() {
      if (!versesContainer) return;
      versesContainer.innerHTML = '';

      state.verses.forEach((v) => {
        const card = document.createElement('article');
        card.className = 'verse-card';
        card.dataset.index = String(v.index);

        const header = document.createElement('div');
        header.className = 'verse-header';

        const num = document.createElement('div');
        num.className = 'verse-number';
        num.textContent = String(v.number);

        const actions = document.createElement('div');
        actions.className = 'verse-actions';

        // Complete (progress) button
        const completeBtn = document.createElement('button');
        completeBtn.type = 'button';
        completeBtn.className = 'action-icon action-complete';
        completeBtn.setAttribute(
          'aria-label',
          'Tanda ayat ' + v.number + ' selesai'
        );
        completeBtn.innerHTML = '✓';
        if (state.completed.has(v.number)) completeBtn.classList.add('active');
        completeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleCompleted(v.number, completeBtn);
        });

        // Bookmark button
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.type = 'button';
        bookmarkBtn.className = 'action-icon action-bookmark';
        bookmarkBtn.setAttribute(
          'aria-label',
          'Tanda ayat ' + v.number + ' sebagai kegemaran'
        );
        bookmarkBtn.innerHTML = '★';
        if (state.bookmarks.has(v.number)) bookmarkBtn.classList.add('active');
        bookmarkBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleBookmark(v.number, bookmarkBtn);
        });

        actions.appendChild(completeBtn);
        actions.appendChild(bookmarkBtn);

        header.appendChild(num);
        header.appendChild(actions);

        const arabicEl = document.createElement('div');
        arabicEl.className = 'verse-arabic';
        arabicEl.textContent = v.arabic;

        const rumiEl = document.createElement('div');
        rumiEl.className = 'verse-rumi';
        rumiEl.textContent = v.rumi;

        const transEl = document.createElement('div');
        transEl.className = 'verse-translation';
        transEl.textContent = v.translation;

        card.appendChild(header);
        card.appendChild(arabicEl);
        card.appendChild(rumiEl);
        card.appendChild(transEl);

        // Klik pada kad ayat
        card.addEventListener('click', function () {
          state.currentIndex = v.index;
          highlightCurrent();
          scrollToCurrent();
          if (state.playing) {
            // Kalau tengah play, tukar terus ke ayat baru
            playFromCurrent(true);
          }
        });

        versesContainer.appendChild(card);
      });
    }

    // === Audio control ===
    function pauseAllAudios() {
      state.audios.forEach((a) => {
        try {
          a.pause();
        } catch (e) {}
      });
    }

    function resetOtherAudios(current) {
      state.audios.forEach((a) => {
        if (a !== current) {
          try {
            a.currentTime = 0;
          } catch (e) {}
        }
      });
    }

    function playFromCurrent(resetTime) {
      const audio = state.audios[state.currentIndex];
      if (!audio) return;

      pauseAllAudios();
      resetOtherAudios(audio);

      if (resetTime) {
        try {
          audio.currentTime = 0;
        } catch (e) {}
      }

      audio
        .play()
        .then(() => {
          state.playing = true;
          if (playToggle) playToggle.textContent = '⏸';
          highlightCurrent();
          scrollToCurrent();
          startProgressTimer();
        })
        .catch((err) => {
          console.error('Play error:', err);
        });
    }

    function handleAudioEnded(index) {
      if (!state.playing) return;

      // Auto ke ayat seterusnya
      if (index < state.verses.length - 1) {
        state.currentIndex = index + 1;
        playFromCurrent(true); // auto-scroll dipanggil dalam ni
      } else {
        // Habis surah
        state.playing = false;
        if (playToggle) playToggle.textContent = '▶';
        stopProgressTimer();
      }
    }

    function startProgressTimer() {
      stopProgressTimer();
      const audio = state.audios[state.currentIndex];
      if (!audio) return;

      state.audioTimer = window.setInterval(function () {
        if (!audio.duration || isNaN(audio.duration)) return;

        const pct = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = pct + '%';

        if (timeDisplay) {
          timeDisplay.textContent =
            formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
        }
      }, 200);
    }

    function stopProgressTimer() {
      if (state.audioTimer) {
        window.clearInterval(state.audioTimer);
        state.audioTimer = null;
      }
    }

    function formatTime(sec) {
      const s = Math.floor(sec || 0);
      const m = Math.floor(s / 60);
      const r = s % 60;
      return (
        String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0')
      );
    }

    // === Highlight & auto scroll ===
    function highlightCurrent() {
      if (!versesContainer) return;
      const cards = versesContainer.querySelectorAll('.verse-card');
      cards.forEach((c) => c.classList.remove('playing'));
      const current = cards[state.currentIndex];
      if (current) current.classList.add('playing');
    }

    function scrollToCurrent() {
      if (!versesContainer) return;
      const current = versesContainer.querySelector('.verse-card.playing');
      if (current && current.scrollIntoView) {
        current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }

    // === Progress + Bookmark ===
    function toggleCompleted(num, btn) {
      if (state.completed.has(num)) {
        state.completed.delete(num);
        if (btn) btn.classList.remove('active');
      } else {
        state.completed.add(num);
        if (btn) btn.classList.add('active');
      }
      safeSet(LS_KEYS.progress, Array.from(state.completed).join(','));
      updateStats();
    }

    function toggleBookmark(num, btn) {
      if (state.bookmarks.has(num)) {
        state.bookmarks.delete(num);
        if (btn) btn.classList.remove('active');
      } else {
        state.bookmarks.add(num);
        if (btn) btn.classList.add('active');
      }
      safeSet(LS_KEYS.bookmarks, Array.from(state.bookmarks).join(','));
      updateStats();
    }

    function updateStats() {
      const total = state.verses.length || 11;
      const pct = total
        ? Math.round((state.completed.size / total) * 100)
        : 0;
      if (statProgress) statProgress.textContent = pct + '%';
      if (statBookmarks)
        statBookmarks.textContent = String(state.bookmarks.size);
    }

    // === Mode view (Arab / Rumi / Terjemahan / Tadabbur) ===
    function applyMode(mode) {
      state.mode = mode || 'all';
      safeSet(LS_KEYS.mode, state.mode);

      controlButtons.forEach((btn) => {
        const m = btn.getAttribute('data-mode');
        if (m) {
          if (m === state.mode) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      });

      if (!versesContainer) return;
      const cards = versesContainer.querySelectorAll('.verse-card');

      cards.forEach((card) => {
        const ar = card.querySelector('.verse-arabic');
        const rumi = card.querySelector('.verse-rumi');
        const trans = card.querySelector('.verse-translation');
        if (!ar || !rumi || !trans) return;

        switch (state.mode) {
          case 'arabic':
            ar.style.display = '';
            rumi.style.display = 'none';
            trans.style.display = 'none';
            break;
          case 'rumi':
            ar.style.display = 'none';
            rumi.style.display = '';
            trans.style.display = 'none';
            break;
          case 'translation':
            ar.style.display = 'none';
            rumi.style.display = 'none';
            trans.style.display = '';
            break;
          case 'tadabbur':
            ar.style.display = '';
            rumi.style.display = 'none';
            trans.style.display = '';
            break;
          case 'all':
          default:
            ar.style.display = '';
            rumi.style.display = '';
            trans.style.display = '';
            break;
        }
      });
    }

    // === Dark mode ===
    function toggleDarkMode() {
      state.dark = !state.dark;
      if (state.dark) root.classList.add('dark-mode');
      else root.classList.remove('dark-mode');
      safeSet(LS_KEYS.dark, state.dark ? '1' : '0');
    }

    // === Share buttons ===
    function handleShare(type) {
      const url =
        window.location.origin +
        window.location.pathname +
        '#surah-ad-dhuha-tool';

      const text =
        'Tool Surah Ad-Dhuha Rumi, Terjemahan & Audio di IlmuAlam.com\n' +
        url;

      if (type === 'copy') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(url)
            .then(() => {
              alert('Link tool telah disalin.');
            })
            .catch(() => {
              alert('Gagal salin link. Sila cuba manual.');
            });
        } else {
          alert('Clipboard tidak disokong, sila copy url secara manual.');
        }
        return;
      }

      const encodedText = encodeURIComponent(text);
      const encodedUrl = encodeURIComponent(url);

      if (type === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodedText, '_blank');
      } else if (type === 'telegram') {
        window.open(
          'https://t.me/share/url?url=' +
            encodedUrl +
            '&text=' +
            encodedText,
          '_blank'
        );
      }
    }

    // === Wire event handlers (once verses dah render) ===
    function wireControls() {
      // Play / Pause
      if (playToggle) {
        playToggle.addEventListener('click', function () {
          if (!state.verses.length) return;

          if (!state.playing) {
            if (
              state.currentIndex < 0 ||
              state.currentIndex >= state.verses.length
            ) {
              state.currentIndex = 0;
            }
            playFromCurrent(false);
          } else {
            pauseAllAudios();
            state.playing = false;
            if (playToggle) playToggle.textContent = '▶';
            stopProgressTimer();
          }
        });
      }

      // Progress bar seek (dalam ayat semasa sahaja)
      if (progressBar) {
        progressBar.addEventListener('click', function (e) {
          const audio = state.audios[state.currentIndex];
          if (!audio || !audio.duration) return;

          const rect = progressBar.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          const clamped = Math.min(Math.max(ratio, 0), 1);

          try {
            audio.currentTime = audio.duration * clamped;
          } catch (err) {
            console.error('Seek error:', err);
          }
        });
      }

      // Mode buttons + dark mode toggle
      controlButtons.forEach((btn) => {
        const mode = btn.getAttribute('data-mode');
        const toggle = btn.getAttribute('data-toggle');

        if (mode) {
          btn.addEventListener('click', function () {
            applyMode(mode);
          });
        } else if (toggle === 'dark') {
          btn.addEventListener('click', function () {
            toggleDarkMode();
          });
        }
      });

      // Share
      shareButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
          const type = btn.getAttribute('data-share');
          if (!type) return;
          handleShare(type);
        });
      });

      // Apply initial mode & stats
      applyMode(state.mode);
      updateStats();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
