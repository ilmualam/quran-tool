/**
 * Surah Ad-Dhuha Interactive Tool
 * Copyright © 2025 ilmualam.com
 * 
 * This code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification is strictly prohibited.
 * Licensed exclusively for use on ilmualam.com
 * 
 * @author ilmualam.com
 * @version 2.1.0
 * @license Proprietary
 */

(function() {
  'use strict';

  // =========================
  //  DOMAIN PROTECTION
  // =========================
  const ALLOWED_DOMAIN = 'ilmualam.com';
  if (
    !window.location.hostname.includes(ALLOWED_DOMAIN) &&
    !window.location.hostname.includes('localhost')
  ) {
    console.error('Unauthorized domain. This tool is licensed for ilmualam.com only.');
    return;
  }

  // =========================
  //  SURAH DATA
  // =========================
  const surahData = {
    number: 93,
    name: 'Ad-Dhuha',
    verses: [
      {
        number: 1,
        arabic: 'وَٱلضُّحَىٰ',
        rumi: 'Wad-dhuha',
        translation: 'Demi waktu Dhuha (pagi yang cerah).',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6207.mp3'
      },
      {
        number: 2,
        arabic: 'وَٱلَّيْلِ إِذَا سَجَىٰ',
        rumi: 'Wal-layli idza saja',
        translation: 'Dan demi malam apabila ia menjadi sunyi.',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6208.mp3'
      },
      {
        number: 3,
        arabic: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
        rumi: "Ma wadda'aka rabbuka wa ma qala",
        translation: 'Tuhanmu (wahai Muhammad) tidak meninggalkan engkau dan tidak membenci engkau.',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6209.mp3'
      },
      {
        number: 4,
        arabic: 'وَلَلْءَاخِرَةُ خَيْرٌۭ لَّكَ مِنَ ٱلْأُولَىٰ',
        rumi: 'Walal-akhiratu khayrul laka minal-ula',
        translation: 'Dan sesungguhnya hari kemudian (akhirat) adalah lebih baik bagimu daripada permulaan (dunia).',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6210.mp3'
      },
      {
        number: 5,
        arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
        rumi: "Wa lasawfa yu'tika rabbuka fatardha",
        translation: 'Dan kelak Tuhanmu pasti memberikan kepadamu (segala nikmat), lalu engkau menjadi redha.',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6211.mp3'
      },
      {
        number: 6,
        arabic: 'أَلَمْ يَجِدْكَ يَتِيمًۭا فَـَٔاوَىٰ',
        rumi: 'Alam yajidka yatiman fa-awa',
        translation: 'Bukankah Dia mendapatimu sebagai anak yatim, lalu Dia memberi perlindungan?',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6212.mp3'
      },
      {
        number: 7,
        arabic: 'وَوَجَدَكَ ضَآلًّۭا فَهَدَىٰ',
        rumi: 'Wa wajadaka dhol-lan fahada',
        translation: 'Dan Dia mendapatimu dalam keadaan bingung, lalu Dia memberi petunjuk?',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6213.mp3'
      },
      {
        number: 8,
        arabic: 'وَوَجَدَكَ عَآئِلًۭا فَأَغْنَىٰ',
        rumi: "Wa wajadaka 'a-ilan fa-aghna",
        translation: 'Dan Dia mendapatimu dalam keadaan miskin, lalu Dia memberikan kekayaan?',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6214.mp3'
      },
      {
        number: 9,
        arabic: 'فَأَمَّا ٱلْيَتِيمَ فَلَا تَقْهَرْ',
        rumi: 'Fa-ammal yatima fala taqhar',
        translation: 'Maka terhadap anak yatim, janganlah kamu berlaku sewenang-wenangnya.',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6215.mp3'
      },
      {
        number: 10,
        arabic: 'وَأَمَّا ٱلسَّآئِلَ فَلَا تَنْهَرْ',
        rumi: 'Wa ammas-sa-ila fala tanhar',
        translation: 'Dan terhadap orang yang meminta-minta, janganlah kamu menghardiknya.',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6216.mp3'
      },
      {
        number: 11,
        arabic: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
        rumi: "Wa amma bi ni'mati rabbika fahaddith",
        translation: 'Dan terhadap nikmat Tuhanmu, maka hendaklah kamu sebar-sebarkan (dengan bersyukur).',
        audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6217.mp3'
      }
    ]
  };

  // =========================
  //  TOOL STATE
  =========================
  let currentState = {
    showArabic: true,
    showRumi: true,
    showMalay: true,
    darkMode: false,
    isPlaying: false,
    currentVerse: 0,
    progress: JSON.parse(localStorage.getItem('surahAdDhuhaProgress')) || {},
    bookmarks: JSON.parse(localStorage.getItem('surahAdDhuhaBookmarks')) || []
  };

  let audioElement = new Audio();

  // =========================
  //  INIT TOOL
  // =========================
  function initSurahTool() {
    const container = document.getElementById('surah-ad-dhuha-tool');
    if (!container) return;

    container.innerHTML = `
      <div class="surah-tool-container ${currentState.darkMode ? 'dark-mode' : ''}">
        <div class="tool-header">
          <h3>🌅 Tool Interaktif Surah Ad-Dhuha (Rumi, Terjemahan &amp; Audio)</h3>
          <p>
            Bacaan <strong>Surah Ad-Dhuha rumi</strong>, teks Arab bertajwid, 
            <strong>terjemahan Melayu ringkas</strong>, audio ayat demi ayat, 
            bookmark &amp; progress <strong>hafazan Surah Ad-Dhuha</strong> – 
            semua dalam satu tool Al-Quran online di IlmuAlam.com.
          </p>
        </div>

        <div class="controls-panel">
          <button class="control-btn ${currentState.showArabic ? 'active' : ''}" onclick="toggleDisplay('arabic')">
            📖 Arab
          </button>
          <button class="control-btn ${currentState.showRumi ? 'active' : ''}" onclick="toggleDisplay('rumi')">
            🔤 Rumi
          </button>
          <button class="control-btn ${currentState.showMalay ? 'active' : ''}" onclick="toggleDisplay('malay')">
            🇲🇾 Terjemahan BM
          </button>
          <button class="control-btn ${currentState.darkMode ? 'active' : ''}" onclick="toggleDarkMode()">
            ${currentState.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button class="control-btn" onclick="resetProgress()">
            🔄 Reset Hafazan
          </button>
        </div>

        <div class="audio-controls">
          <button class="play-btn" onclick="toggleAudio()">
            ${currentState.isPlaying ? '⏸' : '▶️'}
          </button>
          <div class="progress-bar" onclick="seekAudio(event)">
            <div class="progress-fill" id="audioProgress"></div>
          </div>
          <div class="time-display" id="timeDisplay">0:00 / 0:00</div>
        </div>

        <div class="verses-container" id="versesContainer"></div>

        <div class="stats-panel">
          <div class="stat-item">
            <div class="stat-value" id="totalVerses">${surahData.verses.length}</div>
            <div class="stat-label">Jumlah Ayat</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="completedVerses">0</div>
            <div class="stat-label">Ayat Dihafal (Hafazan)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="progressPercentage">0%</div>
            <div class="stat-label">Progress Hafazan</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="bookmarkCount">0</div>
            <div class="stat-label">Ayat Favorite / Bookmark</div>
          </div>
        </div>

        <div class="share-buttons">
          <button class="share-btn whatsapp" onclick="shareToWhatsApp()">
            📱 Share WhatsApp
          </button>
          <button class="share-btn telegram" onclick="shareToTelegram()">
            ✈️ Share Telegram
          </button>
          <button class="share-btn copy" onclick="copyLink()">
            🔗 Copy Link
          </button>
        </div>
      </div>
    `;

    renderVerses();
    updateStats();

    audioElement.addEventListener('timeupdate', updateAudioProgress);
    audioElement.addEventListener('ended', playNextVerse);
  }

  // =========================
  //  RENDER VERSES
  // =========================
  function renderVerses() {
    const container = document.getElementById('versesContainer');
    if (!container) return;

    container.innerHTML = surahData.verses
      .map((verse, index) => {
        const playingClass =
          currentState.currentVerse === index && currentState.isPlaying
            ? 'playing'
            : '';

        return `
        <div class="verse-card ${playingClass}" id="verse-${index}">
          <div class="verse-header">
            <div class="verse-number">${verse.number}</div>
            <div class="verse-actions">
              <div 
                class="action-icon ${currentState.progress[index] ? 'active' : ''}" 
                onclick="toggleProgress(${index})" 
                title="Tandakan ayat Surah Ad-Dhuha ini sebagai sudah dikuasai">
                ✓
              </div>
              <div 
                class="action-icon ${currentState.bookmarks.includes(index) ? 'active' : ''}" 
                onclick="toggleBookmark(${index})" 
                title="Bookmark ayat favorite untuk rujukan pantas">
                ⭐
              </div>
              <div 
                class="action-icon" 
                onclick="playVerse(${index})" 
                title="Mainkan audio bacaan ayat ${verse.number}">
                🔊
              </div>
            </div>
          </div>
          ${
            currentState.showArabic
              ? `<div class="verse-arabic">${verse.arabic}</div>`
              : ''
          }
          ${
            currentState.showRumi
              ? `<div class="verse-rumi">${verse.rumi}</div>`
              : ''
          }
          ${
            currentState.showMalay
              ? `<div class="verse-translation">${verse.translation}</div>`
              : ''
          }
        </div>
      `;
      })
      .join('');
  }

  // =========================
  //  DISPLAY TOGGLES
  // =========================
  function toggleDisplay(type) {
    if (type === 'arabic') currentState.showArabic = !currentState.showArabic;
    if (type === 'rumi') currentState.showRumi = !currentState.showRumi;
    if (type === 'malay') currentState.showMalay = !currentState.showMalay;
    initSurahTool();
  }

  function toggleDarkMode() {
    currentState.darkMode = !currentState.darkMode;
    initSurahTool();
  }

  // =========================
  //  AUDIO CONTROLS
  // =========================
  function toggleAudio() {
    if (currentState.isPlaying) {
      audioElement.pause();
      currentState.isPlaying = false;
    } else {
      if (!audioElement.src) {
        playVerse(0);
      } else {
        audioElement.play();
        currentState.isPlaying = true;
        initSurahTool();
      }
    }
    initSurahTool();
  }

  function playVerse(index) {
    currentState.currentVerse = index;
    audioElement.src = surahData.verses[index].audio;
    audioElement.play();
    currentState.isPlaying = true;
    initSurahTool();

    const verseElement = document.getElementById(`verse-${index}`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function playNextVerse() {
    if (currentState.currentVerse < surahData.verses.length - 1) {
      playVerse(currentState.currentVerse + 1);
    } else {
      currentState.isPlaying = false;
      currentState.currentVerse = 0;
      initSurahTool();
    }
  }

  function updateAudioProgress() {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    const progressFill = document.getElementById('audioProgress');
    if (progressFill) {
      progressFill.style.width = `${progress || 0}%`;
    }

    const timeDisplay = document.getElementById('timeDisplay');
    if (timeDisplay) {
      const current = formatTime(audioElement.currentTime);
      const total = formatTime(audioElement.duration);
      timeDisplay.textContent = `${current} / ${total}`;
    }
  }

  function seekAudio(event) {
    const progressBar = event.currentTarget;
    const clickX = event.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;
    if (!isNaN(audioElement.duration)) {
      audioElement.currentTime = audioElement.duration * percentage;
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // =========================
  //  PROGRESS & BOOKMARK
  // =========================
  function toggleProgress(index) {
    currentState.progress[index] = !currentState.progress[index];
    localStorage.setItem(
      'surahAdDhuhaProgress',
      JSON.stringify(currentState.progress)
    );
    updateStats();
    renderVerses();
  }

  function toggleBookmark(index) {
    const bookmarkIndex = currentState.bookmarks.indexOf(index);
    if (bookmarkIndex > -1) {
      currentState.bookmarks.splice(bookmarkIndex, 1);
    } else {
      currentState.bookmarks.push(index);
    }
    localStorage.setItem(
      'surahAdDhuhaBookmarks',
      JSON.stringify(currentState.bookmarks)
    );
    updateStats();
    renderVerses();
  }

  function resetProgress() {
    if (
      confirm(
        'Adakah anda pasti mahu reset semua progress & bookmark Surah Ad-Dhuha?'
      )
    ) {
      currentState.progress = {};
      currentState.bookmarks = [];
      localStorage.removeItem('surahAdDhuhaProgress');
      localStorage.removeItem('surahAdDhuhaBookmarks');
      updateStats();
      renderVerses();
    }
  }

  function updateStats() {
    const completed = Object.values(currentState.progress).filter(Boolean)
      .length;
    const total = surahData.verses.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    const completedElement = document.getElementById('completedVerses');
    const percentageElement = document.getElementById('progressPercentage');
    const bookmarkElement = document.getElementById('bookmarkCount');

    if (completedElement) completedElement.textContent = completed;
    if (percentageElement) percentageElement.textContent = `${percentage}%`;
    if (bookmarkElement) bookmarkElement.textContent =
      currentState.bookmarks.length;
  }

  // =========================
  //  SHARE FUNCTIONS
  // =========================
  function shareToWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      'Surah Ad-Dhuha rumi, terjemahan Melayu, tafsir ringkas & tool interaktif (audio + bookmark + hafazan) di IlmuAlam.com. Cuba di sini:'
    );
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  }

  function shareToTelegram() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      'Tool interaktif Surah Ad-Dhuha: bacaan rumi, terjemahan Melayu, audio & progress hafazan. Jom tadabbur sama-sama di IlmuAlam.com:'
    );
    window.open(
      `https://t.me/share/url?url=${url}&text=${text}`,
      '_blank'
    );
  }

  function copyLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        alert(
          'Link Surah Ad-Dhuha berjaya disalin. Kongsi dengan keluarga & rakan anda.'
        );
      })
      .catch(() => {
        alert('Maaf, link tidak dapat disalin. Cuba lagi.');
      });
  }

  // =========================
  //  EXPOSE TO WINDOW (INLINE HANDLERS)
  // =========================
  window.toggleDisplay = toggleDisplay;
  window.toggleDarkMode = toggleDarkMode;
  window.toggleAudio = toggleAudio;
  window.playVerse = playVerse;
  window.toggleProgress = toggleProgress;
  window.toggleBookmark = toggleBookmark;
  window.resetProgress = resetProgress;
  window.seekAudio = seekAudio;
  window.shareToWhatsApp = shareToWhatsApp;
  window.shareToTelegram = shareToTelegram;
  window.copyLink = copyLink;

  // =========================
  //  BOOTSTRAP
  // =========================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSurahTool);
  } else {
    initSurahTool();
  }
})();
