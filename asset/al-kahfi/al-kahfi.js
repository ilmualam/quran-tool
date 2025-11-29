/**
 * Surah Al-Kahfi Interactive Reader
 * Copyright-free Islamic Educational Tool
 * Created for ilmualam.com
 * 
 * License: MIT - Free for educational & non-commercial use
 * Developed for Malaysian Muslims to access Quranic content easily
 * 
 * @version 1.0.0
 * @domain ilmualam.com
 */

(function() {
  'use strict';

  const CONFIG = {
    domain: 'ilmualam.com',
    surahNumber: 18,
    totalAyahs: 110,
    apiBase: 'https://api.alquran.cloud/v1',
    keywords: ['surah al kahfi', 'bacaan rumi', 'terjemahan melayu', 'audio quran', 'hari jumaat', 'perlindungan dajjal', 'kelebihan surah', 'ashabul kahfi', 'al quran malaysia']
  };

  class SurahKahfiReader {
    constructor() {
      this.currentAyah = 1;
      this.bookmarks = this.loadBookmarks();
      this.audioElement = new Audio();
      this.isPlaying = false;
      this.searchIndex = [];
      this.init();
    }

    async init() {
      this.renderSkeleton();
      await this.fetchSurahData();
      this.renderUI();
      this.attachEventListeners();
      this.buildSearchIndex();
    }

    renderSkeleton() {
      const container = document.getElementById('tool-kahfi');
      container.innerHTML = `
        <div class="ilmu-x-kahfi-tool-header">
          <h2>🕌 Surah Al-Kahfi - Bacaan Interaktif</h2>
          <p>110 Ayat Lengkap • Rumi • Terjemahan • Audio Per Ayat</p>
        </div>
        <div class="ilmu-x-kahfi-controls">
          <input type="search" id="kahfi-search" placeholder="🔍 Cari ayat..." />
          <button id="kahfi-bookmark-toggle">⭐ Bookmark</button>
          <button id="kahfi-play-all">▶️ Main Semua</button>
        </div>
        <div class="ilmu-x-kahfi-progress">
          <div class="ilmu-x-progress-bar" id="kahfi-progress"></div>
        </div>
        <div id="kahfi-content" class="ilmu-x-kahfi-content">
          <div class="ilmu-x-loading">Memuat data...</div>
        </div>
        <div class="ilmu-x-kahfi-footer">
          <p>💚 <strong>${CONFIG.domain}</strong> | Platform Ilmu Islam Malaysia</p>
        </div>
      `;
    }

    async fetchSurahData() {
      try {
        const [arabic, malay, rumi, audio] = await Promise.all([
          fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}`).then(r => r.json()),
          fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/ms.basmeih`).then(r => r.json()),
          fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/en.transliteration`).then(r => r.json()),
          fetch(`${CONFIG.apiBase}/surah/${CONFIG.surahNumber}/ar.alafasy`).then(r => r.json())
        ]);

        this.data = {
          arabic: arabic.data.ayahs,
          malay: malay.data.ayahs,
          rumi: rumi.data.ayahs,
          audio: audio.data.ayahs
        };
      } catch (error) {
        console.error('Error fetching Surah data:', error);
        document.getElementById('kahfi-content').innerHTML = '<p class="ilmu-x-error">Maaf, gagal memuat data. Sila refresh halaman.</p>';
      }
    }

    renderUI() {
      const content = document.getElementById('kahfi-content');
      let html = '';

      for (let i = 0; i < CONFIG.totalAyahs; i++) {
        const isBookmarked = this.bookmarks.includes(i + 1);
        const bookmarkClass = isBookmarked ? 'bookmarked' : '';
        
        html += `
          <div class="ilmu-x-ayah ${bookmarkClass}" data-ayah="${i + 1}" id="ayah-${i + 1}">
            <div class="ilmu-x-ayah-number">
              <span class="ilmu-x-num">${i + 1}</span>
              <button class="ilmu-x-bookmark-btn" data-ayah="${i + 1}">${isBookmarked ? '⭐' : '☆'}</button>
            </div>
            <div class="ilmu-x-ayah-arabic">${this.data.arabic[i].text}</div>
            <div class="ilmu-x-ayah-rumi">${this.data.rumi[i].text}</div>
            <div class="ilmu-x-ayah-malay">${this.data.malay[i].text}</div>
            <div class="ilmu-x-ayah-audio">
              <button class="ilmu-x-play-btn" data-audio="${this.data.audio[i].audio}" data-ayah="${i + 1}">
                ▶️ Dengar Ayat ${i + 1}
              </button>
            </div>
          </div>
        `;
      }

      content.innerHTML = html;
    }

    attachEventListeners() {
      // Search
      document.getElementById('kahfi-search').addEventListener('input', (e) => this.handleSearch(e.target.value));

      // Bookmark toggle view
      document.getElementById('kahfi-bookmark-toggle').addEventListener('click', () => this.toggleBookmarkView());

      // Play all
      document.getElementById('kahfi-play-all').addEventListener('click', () => this.playAll());

      // Individual play buttons
      document.querySelectorAll('.ilmu-x-play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const audioUrl = e.target.getAttribute('data-audio');
          const ayahNum = e.target.getAttribute('data-ayah');
          this.playAudio(audioUrl, ayahNum);
        });
      });

      // Bookmark buttons
      document.querySelectorAll('.ilmu-x-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ayahNum = parseInt(e.target.getAttribute('data-ayah'));
          this.toggleBookmark(ayahNum);
        });
      });

      // Audio ended event
      this.audioElement.addEventListener('ended', () => {
        if (this.isPlaying && this.currentAyah < CONFIG.totalAyahs) {
          this.currentAyah++;
          this.playAudio(this.data.audio[this.currentAyah - 1].audio, this.currentAyah);
        } else {
          this.isPlaying = false;
          this.updateProgress(0);
        }
      });
    }

    playAudio(url, ayahNum) {
      this.audioElement.src = url;
      this.audioElement.play();
      this.currentAyah = parseInt(ayahNum);
      this.highlightCurrentAyah(ayahNum);
      this.updateProgress((ayahNum / CONFIG.totalAyahs) * 100);
    }

    playAll() {
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.currentAyah = 1;
        this.playAudio(this.data.audio[0].audio, 1);
        document.getElementById('kahfi-play-all').textContent = '⏸️ Jeda';
      } else {
        this.audioElement.pause();
        this.isPlaying = false;
        document.getElementById('kahfi-play-all').textContent = '▶️ Main Semua';
      }
    }

    highlightCurrentAyah(ayahNum) {
      document.querySelectorAll('.ilmu-x-ayah').forEach(el => el.classList.remove('playing'));
      const currentEl = document.getElementById(`ayah-${ayahNum}`);
      if (currentEl) {
        currentEl.classList.add('playing');
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    updateProgress(percent) {
      document.getElementById('kahfi-progress').style.width = percent + '%';
    }

    toggleBookmark(ayahNum) {
      const index = this.bookmarks.indexOf(ayahNum);
      if (index > -1) {
        this.bookmarks.splice(index, 1);
      } else {
        this.bookmarks.push(ayahNum);
      }
      this.saveBookmarks();
      this.renderUI();
      this.attachEventListeners();
    }

    toggleBookmarkView() {
      const allAyahs = document.querySelectorAll('.ilmu-x-ayah');
      const isShowingBookmarksOnly = document.querySelector('.ilmu-x-ayah:not(.bookmarked)[style*="display: none"]');
      
      if (isShowingBookmarksOnly) {
        allAyahs.forEach(el => el.style.display = 'block');
        document.getElementById('kahfi-bookmark-toggle').textContent = '⭐ Bookmark';
      } else {
        allAyahs.forEach(el => {
          if (!el.classList.contains('bookmarked')) {
            el.style.display = 'none';
          }
        });
        document.getElementById('kahfi-bookmark-toggle').textContent = '📖 Tunjuk Semua';
      }
    }

    buildSearchIndex() {
      this.searchIndex = this.data.malay.map((ayah, index) => ({
        ayahNum: index + 1,
        text: ayah.text.toLowerCase(),
        rumi: this.data.rumi[index].text.toLowerCase()
      }));
    }

    handleSearch(query) {
      if (!query.trim()) {
        document.querySelectorAll('.ilmu-x-ayah').forEach(el => {
          el.style.display = 'block';
          el.classList.remove('highlight');
        });
        return;
      }

      const searchTerm = query.toLowerCase();
      const results = this.searchIndex.filter(item => 
        item.text.includes(searchTerm) || item.rumi.includes(searchTerm)
      );

      document.querySelectorAll('.ilmu-x-ayah').forEach(el => {
        const ayahNum = parseInt(el.getAttribute('data-ayah'));
        const isMatch = results.some(r => r.ayahNum === ayahNum);
        
        if (isMatch) {
          el.style.display = 'block';
          el.classList.add('highlight');
        } else {
          el.style.display = 'none';
          el.classList.remove('highlight');
        }
      });
    }

    loadBookmarks() {
      const stored = localStorage.getItem('kahfi_bookmarks');
      return stored ? JSON.parse(stored) : [];
    }

    saveBookmarks() {
      localStorage.setItem('kahfi_bookmarks', JSON.stringify(this.bookmarks));
    }
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SurahKahfiReader());
  } else {
    new SurahKahfiReader();
  }

  // SEO Keywords injection (Google-compliant)
  const meta = document.createElement('meta');
  meta.name = 'keywords';
  meta.content = CONFIG.keywords.join(', ');
  document.head.appendChild(meta);

})();
