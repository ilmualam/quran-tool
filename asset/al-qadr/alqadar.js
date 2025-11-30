/*
 * Surah Al-Qadr Interactive Reader
 * Copyright (c) 2025 IlmuAlam.com
 * Licensed under MIT License
 * 
 * This tool provides an interactive Quranic reading experience for Surah Al-Qadr
 * with audio playback, bookmarks, translations, and tafsir.
 * 
 * SEO Keywords: surah al qadr, lailatul qadr, bacaan rumi al quran, terjemahan melayu,
 * audio quran, tafsir surah, ramadan, malam lailatul qadr, al quran malaysia
 */

(function() {
  'use strict';

  const SURAH_DATA = {
    number: 97,
    name: "Al-Qadr",
    nameArabic: "القدر",
    revelation: "Makkiyyah",
    verses: 5,
    ayahs: [
      {
        number: 1,
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ",
        rumi: "Bismillahir Rahmanir Rahim. Innaa anzalnaahu fii lailatil-qadr",
        translation: "Dengan nama Allah Yang Maha Pemurah, lagi Maha Mengasihani. Sesungguhnya Kami telah menurunkannya (Al-Quran) pada Malam Kemuliaan (Lailatul Qadr).",
        tafsir: "Allah SWT menegaskan bahawa Al-Quran diturunkan pada malam yang sangat mulia, iaitu Lailatul Qadr. Penurunan ini bermula di bulan Ramadan dari Lauhul Mahfuz ke langit dunia, kemudian diturunkan secara beransur-ansur kepada Nabi Muhammad ﷺ selama 23 tahun.",
        audioUrl: "https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/97.mp3"
      },
      {
        number: 2,
        arabic: "وَمَآ أَدْرَىٰكَ مَا لَيْلَةُ ٱلْقَدْرِ",
        rumi: "Wa maa adraaka maa lailatul-qadr",
        translation: "Dan apa jalannya engkau dapat mengetahui apa keistimewaan Malam Kemuliaan itu?",
        tafsir: "Ayat ini berbentuk soalan retorik untuk menekankan keagungan Lailatul Qadr yang luar biasa. Allah menggunakan uslub ta'zhim (pengagungan) untuk menunjukkan bahawa kemuliaan malam ini melampaui pemahaman manusia biasa.",
        audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6202.mp3"
      },
      {
        number: 3,
        arabic: "لَيْلَةُ ٱلْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
        rumi: "Lailatul-qadri khairum min alfi syahr",
        translation: "Malam Kemuliaan itu lebih baik daripada seribu bulan.",
        tafsir: "Beribadah pada Lailatul Qadr lebih baik daripada beribadah selama 1,000 bulan (sekitar 83 tahun 4 bulan). Ini bermaksud seseorang yang berjaya mendapat Lailatul Qadr dan beramal soleh padanya akan mendapat pahala melebihi seseorang yang beribadah selama lebih 83 tahun tanpa Lailatul Qadr.",
        audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6203.mp3"
      },
      {
        number: 4,
        arabic: "تَنَزَّلُ ٱلْمَلَٰٓئِكَةُ وَٱلرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ",
        rumi: "Tanazzalul-malaa-ikatu war-roohu feehaa bi-idzni rabbihim min kulli amr",
        translation: "Pada malam itu turun malaikat-malaikat dan Ruh (Jibril) dengan izin Tuhan mereka untuk mengatur segala urusan.",
        tafsir: "Malaikat-malaikat turun dengan begitu banyaknya pada Lailatul Qadr, dipimpin oleh Malaikat Jibril a.s. Mereka membawa segala ketetapan dan takdir untuk setahun yang akan datang. Kedatangan malaikat ini membawa keberkatan dan rahmat yang melimpah.",
        audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6204.mp3"
      },
      {
        number: 5,
        arabic: "سَلَٰمٌ هِىَ حَتَّىٰ مَطْلَعِ ٱلْفَجْرِ",
        rumi: "Salaamun hiya hattaa matla'il-fajr",
        translation: "Malam itu (penuh) kesejahteraan sampai terbit fajar.",
        tafsir: "Lailatul Qadr adalah malam yang penuh dengan keselamatan, kesejahteraan dan keberkatan dari awal malam hingga terbit fajar. Tiada kejahatan atau kemudaratan berlaku pada malam tersebut. Malaikat-malaikat memberi salam kepada orang mukmin yang beribadah pada malam itu.",
        audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6205.mp3"
      }
    ]
  };

  // SEO Keywords injection for ilmualam.com domain
  const SEO_KEYWORDS = {
    primary: ["surah al qadr", "lailatul qadr", "bacaan rumi", "terjemahan melayu", "audio quran"],
    secondary: ["ramadan", "malam kemuliaan", "surah al qadr rumi", "tafsir al quran", "quran malaysia"],
    location: ["malaysia", "melayu", "bahasa malaysia"],
    intent: ["belajar quran", "menghafaz quran", "bacaan quran", "solat ramadan"]
  };

  // Inject SEO metadata
  function injectSEOMetadata() {
    if (window.location.hostname.includes('ilmualam.com')) {
      const metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      metaKeywords.content = [
        ...SEO_KEYWORDS.primary,
        ...SEO_KEYWORDS.secondary,
        ...SEO_KEYWORDS.location,
        ...SEO_KEYWORDS.intent
      ].join(', ');
      document.head.appendChild(metaKeywords);
    }
  }

  class SurahAlQadrReader {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.currentAyah = 0;
      this.audio = new Audio();
      this.isPlaying = false;
      this.bookmarks = this.loadBookmarks();
      this.settings = this.loadSettings();
      
      this.init();
      injectSEOMetadata();
    }

    init() {
      this.render();
      this.attachEvents();
      this.updateProgress();
    }

    loadBookmarks() {
      const saved = localStorage.getItem('ilmu_alqadr_bookmarks');
      return saved ? JSON.parse(saved) : [];
    }

    saveBookmarks() {
      localStorage.setItem('ilmu_alqadr_bookmarks', JSON.stringify(this.bookmarks));
    }

    loadSettings() {
      const saved = localStorage.getItem('ilmu_alqadr_settings');
      return saved ? JSON.parse(saved) : { showTafsir: false, autoPlay: false };
    }

    saveSettings() {
      localStorage.setItem('ilmu_alqadr_settings', JSON.stringify(this.settings));
    }

    render() {
      this.container.innerHTML = `
        <div class="ilmu-alqadr-container">
          <div class="ilmu-alqadr-header">
            <h2 style="color:#fff;">${SURAH_DATA.name} (${SURAH_DATA.nameArabic})</h2>
            <p>${SURAH_DATA.verses} Ayat • ${SURAH_DATA.revelation} • Surah ${SURAH_DATA.number}</p>
          </div>
          
          <div class="ilmu-alqadr-progress">
            <div class="ilmu-alqadr-progress-bar" id="progress-bar"></div>
          </div>

          <div class="ilmu-alqadr-controls">
            <button class="ilmu-alqadr-btn" id="play-all">
              <span>▶</span> Play Semua
            </button>
            <button class="ilmu-alqadr-btn secondary" id="toggle-tafsir">
              ${this.settings.showTafsir ? 'Sembunyikan' : 'Tunjuk'} Tafsir
            </button>
            <select class="ilmu-alqadr-select" id="ayah-select">
              <option value="">Pilih Ayat...</option>
              ${SURAH_DATA.ayahs.map(a => `<option value="${a.number}">Ayat ${a.number}</option>`).join('')}
            </select>
            <input type="text" class="ilmu-alqadr-search" placeholder="Cari dalam surah..." id="search-input">
          </div>

          <div id="ayah-container">
            ${SURAH_DATA.ayahs.map(ayah => this.renderAyah(ayah)).join('')}
          </div>

          <div class="ilmu-alqadr-footer">
            <p>© 2025 <a href="https://www.ilmualam.com" target="_blank">IlmuAlam.com</a> • Bacaan Al-Quran Interaktif • Audio oleh Mishary Rashid Alafasy</p>
            <p style="margin-top:.5em;font-size:.9em">🔍 Carian Terkini: ${SEO_KEYWORDS.primary.slice(0, 3).join(' • ')}</p>
          </div>
        </div>
      `;
    }

    renderAyah(ayah) {
      const isBookmarked = this.bookmarks.includes(ayah.number);
      return `
        <div class="ilmu-alqadr-ayah" data-ayah="${ayah.number}">
          <div class="ilmu-alqadr-ayah-number">${ayah.number}</div>
          <div class="ilmu-alqadr-arabic">${ayah.arabic}</div>
          <div class="ilmu-alqadr-rumi">${ayah.rumi}</div>
          <div class="ilmu-alqadr-translation">${ayah.translation}</div>
          <div class="ilmu-alqadr-tafsir ${this.settings.showTafsir ? 'show' : ''}">
            <strong>📖 Tafsir:</strong> ${ayah.tafsir}
          </div>
          <div class="ilmu-alqadr-ayah-controls">
            <button class="ilmu-alqadr-icon-btn play-ayah" data-ayah="${ayah.number}">
              <span>▶</span> Play
            </button>
            <button class="ilmu-alqadr-icon-btn bookmark-ayah" data-ayah="${ayah.number}">
              <span>${isBookmarked ? '★' : '☆'}</span> ${isBookmarked ? 'Tersimpan' : 'Save'}
            </button>
            <button class="ilmu-alqadr-icon-btn share-ayah" data-ayah="${ayah.number}">
              <span>⤴</span> Share
            </button>
          </div>
        </div>
      `;
    }

    attachEvents() {
      // Play all
      document.getElementById('play-all')?.addEventListener('click', () => this.playAll());

      // Toggle tafsir
      document.getElementById('toggle-tafsir')?.addEventListener('click', () => this.toggleTafsir());

      // Ayah select
      document.getElementById('ayah-select')?.addEventListener('change', (e) => {
        if (e.target.value) this.scrollToAyah(parseInt(e.target.value));
      });

      // Search
      document.getElementById('search-input')?.addEventListener('input', (e) => this.search(e.target.value));

      // Play individual ayah
      document.querySelectorAll('.play-ayah').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ayahNum = parseInt(e.currentTarget.dataset.ayah);
          this.playAyah(ayahNum);
        });
      });

      // Bookmark
      document.querySelectorAll('.bookmark-ayah').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ayahNum = parseInt(e.currentTarget.dataset.ayah);
          this.toggleBookmark(ayahNum);
        });
      });

      // Share
      document.querySelectorAll('.share-ayah').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ayahNum = parseInt(e.currentTarget.dataset.ayah);
          this.shareAyah(ayahNum);
        });
      });

      // Audio events
      this.audio.addEventListener('ended', () => {
        if (this.settings.autoPlay && this.currentAyah < SURAH_DATA.verses) {
          this.playAyah(this.currentAyah + 1);
        } else {
          this.isPlaying = false;
          this.updateProgress();
        }
      });
    }

    playAll() {
      this.currentAyah = 1;
      this.settings.autoPlay = true;
      this.saveSettings();
      this.playAyah(1);
    }

    playAyah(ayahNum) {
      const ayah = SURAH_DATA.ayahs.find(a => a.number === ayahNum);
      if (!ayah) return;

      this.currentAyah = ayahNum;
      this.audio.src = ayah.audioUrl;
      this.audio.play();
      this.isPlaying = true;

      // Highlight active ayah
      document.querySelectorAll('.ilmu-alqadr-ayah').forEach(el => el.classList.remove('active'));
      document.querySelector(`[data-ayah="${ayahNum}"]`)?.classList.add('active');
      
      this.updateProgress();
    }

    toggleTafsir() {
      this.settings.showTafsir = !this.settings.showTafsir;
      this.saveSettings();
      
      const tafsirElements = document.querySelectorAll('.ilmu-alqadr-tafsir');
      tafsirElements.forEach(el => {
        el.classList.toggle('show', this.settings.showTafsir);
      });

      const btn = document.getElementById('toggle-tafsir');
      if (btn) btn.textContent = this.settings.showTafsir ? 'Sembunyikan Tafsir' : 'Tunjuk Tafsir';
    }

    scrollToAyah(ayahNum) {
      const element = document.querySelector(`[data-ayah="${ayahNum}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    search(query) {
      if (!query) {
        document.querySelectorAll('.ilmu-alqadr-ayah').forEach(el => el.style.display = 'block');
        return;
      }

      const lowerQuery = query.toLowerCase();
      document.querySelectorAll('.ilmu-alqadr-ayah').forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = text.includes(lowerQuery) ? 'block' : 'none';
      });
    }

    toggleBookmark(ayahNum) {
      const index = this.bookmarks.indexOf(ayahNum);
      if (index > -1) {
        this.bookmarks.splice(index, 1);
      } else {
        this.bookmarks.push(ayahNum);
      }
      this.saveBookmarks();
      
      const btn = document.querySelector(`[data-ayah="${ayahNum}"] .bookmark-ayah`);
      const isBookmarked = this.bookmarks.includes(ayahNum);
      if (btn) {
        btn.innerHTML = `<span>${isBookmarked ? '★' : '☆'}</span> ${isBookmarked ? 'Tersimpan' : 'Simpan'}`;
      }
    }

    shareAyah(ayahNum) {
      const ayah = SURAH_DATA.ayahs.find(a => a.number === ayahNum);
      if (!ayah) return;

      const text = `Surah Al-Qadr Ayat ${ayahNum}\n\n${ayah.arabic}\n\n${ayah.translation}\n\nBaca selengkapnya di ilmualam.com`;
      
      if (navigator.share) {
        navigator.share({ title: `Surah Al-Qadr Ayat ${ayahNum}`, text });
      } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('✅ Ayat telah disalin ke clipboard!');
      }
    }

    updateProgress() {
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) {
        const percentage = (this.currentAyah / SURAH_DATA.verses) * 100;
        progressBar.style.width = `${percentage}%`;
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new SurahAlQadrReader('ilmu-surah-alqadr-tool');
    });
  } else {
    new SurahAlQadrReader('ilmu-surah-alqadr-tool');
  }
})();
