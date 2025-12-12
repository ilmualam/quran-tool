/*!
 * Surah Al-Jinn Interactive Reader Tool
 * Version: 1.0.0
 * Author: IlmuAlam.com
 * License: MIT License
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
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * GitHub: https://github.com/ilmualam
 * Website: https://www.ilmualam.com
 */

(function() {
    'use strict';
    
    const SURAH_NUM = 72;
    const TOTAL_VERSES = 28;
    const FIRST_VERSE_NUM = 5163; // Global verse number for 72:1
    const API_BASE = 'https://api.alquran.cloud/v1';
    const AUDIO_BASE = 'https://cdn.alquran.cloud/media/audio/ayah';
    const QARI = 'ar.alafasy';
    
    // Storage keys
    const STORAGE_KEY = 'ilm_jinn_bookmarks';
    const LAST_VERSE_KEY = 'ilm_jinn_last_verse';
    
    let verses = [];
    let currentVerse = 0;
    let audio = null;
    let bookmarks = [];
    let isPlaying = false;
    
    // Initialize
    function init() {
        const container = document.getElementById('surahJinnTool');
        if (!container) return;
        
        loadBookmarks();
        renderUI(container);
        fetchVerses();
    }
    
    // Load bookmarks from localStorage
    function loadBookmarks() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            bookmarks = stored ? JSON.parse(stored) : [];
        } catch (e) {
            bookmarks = [];
        }
    }
    
    // Save bookmarks
    function saveBookmarks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        } catch (e) {
            console.warn('Cannot save bookmarks');
        }
    }
    
    // Render UI
    function renderUI(container) {
        container.innerHTML = `
            <div class="ilm-x-reader">
                <div class="ilm-x-reader-header">
                    <h3>🎧 Pembaca Surah Al-Jinn Interaktif</h3>
                    <div class="ilm-x-controls">
                        <button class="ilm-x-btn ilm-x-btn-search" onclick="window.ilmJinnReader.toggleSearch()" title="Cari Ayat">🔍</button>
                        <button class="ilm-x-btn ilm-x-btn-bookmarks" onclick="window.ilmJinnReader.showBookmarks()" title="Lihat Bookmark">📑 <span class="ilm-x-bookmark-count">0</span></button>
                        <button class="ilm-x-btn ilm-x-btn-share" onclick="window.ilmJinnReader.share()" title="Share">📤</button>
                    </div>
                </div>
                
                <div class="ilm-x-search-box" style="display:none">
                    <input type="text" class="ilm-x-search-input" placeholder="Cari ayat (Rumi atau Malay)..." />
                    <button class="ilm-x-btn-close" onclick="window.ilmJinnReader.toggleSearch()">✕</button>
                </div>
                
                <div class="ilm-x-player">
                    <div class="ilm-x-progress-bar">
                        <div class="ilm-x-progress"></div>
                    </div>
                    <div class="ilm-x-player-controls">
                        <button class="ilm-x-btn-prev" onclick="window.ilmJinnReader.prevVerse()" title="Ayat Sebelum">⏮</button>
                        <button class="ilm-x-btn-play" onclick="window.ilmJinnReader.togglePlay()" title="Play/Pause">▶️</button>
                        <button class="ilm-x-btn-next" onclick="window.ilmJinnReader.nextVerse()" title="Ayat Seterusnya">⏭</button>
                        <span class="ilm-x-verse-num">Ayat 1/28</span>
                    </div>
                </div>
                
                <div class="ilm-x-verses-container">
                    <div class="ilm-x-loading">⏳ Memuatkan ayat-ayat...</div>
                </div>
            </div>
        `;
        
        updateBookmarkCount();
    }
    
    // Fetch verses from API
    async function fetchVerses() {
        const container = document.querySelector('.ilm-x-verses-container');
        
        try {
            // Fetch Arabic, Transliteration (English), and Malay translation
            const response = await fetch(`${API_BASE}/surah/${SURAH_NUM}/editions/quran-simple,en.transliteration,ms.basmeih`);
            const data = await response.json();
            
            if (data.code !== 200 || !data.data || data.data.length < 3) {
                throw new Error('Invalid API response');
            }
            
            const arabic = data.data[0].ayahs;
            const rumi = data.data[1].ayahs;
            const malay = data.data[2].ayahs;
            
            verses = arabic.map((_, i) => ({
                number: i + 1,
                globalNum: FIRST_VERSE_NUM + i,
                arabic: arabic[i].text,
                rumi: rumi[i].text,
                malay: malay[i].text,
                audio: `${AUDIO_BASE}/${QARI}/${FIRST_VERSE_NUM + i}`
            }));
            
            renderVerses(verses);
            
            // Load last read verse
            const lastVerse = localStorage.getItem(LAST_VERSE_KEY);
            if (lastVerse) {
                const num = parseInt(lastVerse);
                if (num >= 1 && num <= TOTAL_VERSES) {
                    currentVerse = num - 1;
                    scrollToVerse(currentVerse);
                }
            }
            
        } catch (error) {
            container.innerHTML = `
                <div class="ilm-x-error">
                    <p>❌ Maaf, gagal memuatkan ayat. Sila semak sambungan internet anda.</p>
                    <button class="ilm-x-btn-retry" onclick="window.ilmJinnReader.retry()">🔄 Cuba Lagi</button>
                </div>
            `;
            console.error('Fetch error:', error);
        }
    }
    
    // Render verses
    function renderVerses(verseList) {
        const container = document.querySelector('.ilm-x-verses-container');
        const html = verseList.map((v, idx) => `
            <div class="ilm-x-verse ${bookmarks.includes(v.number) ? 'ilm-x-bookmarked' : ''}" data-verse="${idx}" id="verse-${idx}">
                <div class="ilm-x-verse-header">
                    <span class="ilm-x-verse-badge">Ayat ${v.number}</span>
                    <button class="ilm-x-btn-bookmark ${bookmarks.includes(v.number) ? 'active' : ''}" onclick="window.ilmJinnReader.toggleBookmark(${v.number})" title="Tandabuku">
                        ${bookmarks.includes(v.number) ? '🔖' : '📌'}
                    </button>
                </div>
                <div class="ilm-x-arabic">${v.arabic}</div>
                <div class="ilm-x-rumi">${v.rumi}</div>
                <div class="ilm-x-translation">${v.malay}</div>
                <div class="ilm-x-verse-actions">
                    <button class="ilm-x-btn-small" onclick="window.ilmJinnReader.playVerse(${idx})" title="Main Audio">🔊 Dengar</button>
                    <button class="ilm-x-btn-small" onclick="window.ilmJinnReader.copyVerse(${idx})" title="Salin">📋 Salin</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        updateVerseDisplay();
    }
    
    // Play verse audio
    function playVerse(index) {
        if (index < 0 || index >= verses.length) return;
        
        currentVerse = index;
        const verse = verses[index];
        
        if (audio) {
            audio.pause();
            audio = null;
        }
        
        audio = new Audio(verse.audio);
        audio.volume = 1.0;
        
        audio.addEventListener('canplay', () => {
            audio.play();
            isPlaying = true;
            updatePlayButton();
            highlightVerse(index);
            scrollToVerse(index);
            updateProgressBar();
            
            // Save last read
            localStorage.setItem(LAST_VERSE_KEY, verse.number);
        });
        
        audio.addEventListener('timeupdate', updateProgressBar);
        
        audio.addEventListener('ended', () => {
            isPlaying = false;
            updatePlayButton();
            // Auto-play next verse
            if (index < verses.length - 1) {
                setTimeout(() => playVerse(index + 1), 800);
            }
        });
        
        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            alert('Audio gagal dimainkan. Cuba lagi.');
            isPlaying = false;
            updatePlayButton();
        });
    }
    
    // Toggle play/pause
    function togglePlay() {
        if (!audio || !verses.length) {
            playVerse(currentVerse);
            return;
        }
        
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play();
            isPlaying = true;
        }
        updatePlayButton();
    }
    
    // Navigation
    function prevVerse() {
        if (currentVerse > 0) {
            playVerse(currentVerse - 1);
        }
    }
    
    function nextVerse() {
        if (currentVerse < verses.length - 1) {
            playVerse(currentVerse + 1);
        }
    }
    
    // Highlight active verse
    function highlightVerse(index) {
        document.querySelectorAll('.ilm-x-verse').forEach((el, i) => {
            if (i === index) {
                el.classList.add('ilm-x-active');
            } else {
                el.classList.remove('ilm-x-active');
            }
        });
        updateVerseDisplay();
    }
    
    // Scroll to verse
    function scrollToVerse(index) {
        const el = document.getElementById(`verse-${index}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Update play button
    function updatePlayButton() {
        const btn = document.querySelector('.ilm-x-btn-play');
        if (btn) {
            btn.textContent = isPlaying ? '⏸' : '▶️';
            btn.title = isPlaying ? 'Jeda' : 'Main';
        }
    }
    
    // Update verse display
    function updateVerseDisplay() {
        const display = document.querySelector('.ilm-x-verse-num');
        if (display) {
            display.textContent = `Ayat ${currentVerse + 1}/${TOTAL_VERSES}`;
        }
    }
    
    // Update progress bar
    function updateProgressBar() {
        if (!audio) return;
        const progress = (audio.currentTime / audio.duration) * 100;
        const bar = document.querySelector('.ilm-x-progress');
        if (bar) {
            bar.style.width = `${progress}%`;
        }
    }
    
    // Toggle bookmark
    function toggleBookmark(verseNum) {
        const idx = bookmarks.indexOf(verseNum);
        if (idx > -1) {
            bookmarks.splice(idx, 1);
        } else {
            bookmarks.push(verseNum);
        }
        saveBookmarks();
        updateBookmarkCount();
        
        // Update UI
        const verseEl = document.querySelector(`.ilm-x-verse[data-verse="${verseNum - 1}"]`);
        const btnEl = verseEl?.querySelector('.ilm-x-btn-bookmark');
        if (verseEl && btnEl) {
            if (bookmarks.includes(verseNum)) {
                verseEl.classList.add('ilm-x-bookmarked');
                btnEl.classList.add('active');
                btnEl.textContent = '🔖';
            } else {
                verseEl.classList.remove('ilm-x-bookmarked');
                btnEl.classList.remove('active');
                btnEl.textContent = '📌';
            }
        }
    }
    
    // Update bookmark count
    function updateBookmarkCount() {
        const countEl = document.querySelector('.ilm-x-bookmark-count');
        if (countEl) {
            countEl.textContent = bookmarks.length;
            countEl.style.display = bookmarks.length > 0 ? 'inline' : 'none';
        }
    }
    
    // Show bookmarks
    function showBookmarks() {
        if (bookmarks.length === 0) {
            alert('Tiada penanda buku. Klik ikon 📌 pada ayat untuk menanda.');
            return;
        }
        
        const list = bookmarks.map(n => `Ayat ${n}`).join(', ');
        const choice = confirm(`Ayat yang ditanda:\n${list}\n\nKlik OK untuk pergi ke ayat pertama yang ditanda.`);
        if (choice && bookmarks.length > 0) {
            const firstBookmark = Math.min(...bookmarks);
            scrollToVerse(firstBookmark - 1);
            highlightVerse(firstBookmark - 1);
        }
    }
    
    // Toggle search
    function toggleSearch() {
        const searchBox = document.querySelector('.ilm-x-search-box');
        const input = document.querySelector('.ilm-x-search-input');
        
        if (searchBox.style.display === 'none') {
            searchBox.style.display = 'flex';
            input.focus();
            input.addEventListener('input', handleSearch);
        } else {
            searchBox.style.display = 'none';
            input.value = '';
            renderVerses(verses); // Reset
        }
    }
    
    // Handle search
    function handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            renderVerses(verses);
            return;
        }
        
        const filtered = verses.filter(v => 
            v.rumi.toLowerCase().includes(query) ||
            v.malay.toLowerCase().includes(query) ||
            v.number.toString() === query
        );
        
        if (filtered.length > 0) {
            renderVerses(filtered);
        } else {
            document.querySelector('.ilm-x-verses-container').innerHTML = '<div class="ilm-x-no-result">🔍 Tiada hasil ditemui</div>';
        }
    }
    
    // Copy verse
    function copyVerse(index) {
        const verse = verses[index];
        const text = `Surah Al-Jinn (72:${verse.number})\n\n${verse.arabic}\n\n${verse.rumi}\n\n${verse.malay}\n\nDaripada: IlmuAlam.com`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ Ayat berjaya disalin!');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }
    
    // Fallback copy
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('✅ Ayat berjaya disalin!');
        } catch (e) {
            alert('❌ Gagal menyalin. Sila salin secara manual.');
        }
        document.body.removeChild(textarea);
    }
    
    // Share
    function share() {
        const url = window.location.href;
        const text = `Baca Surah Al-Jinn lengkap dengan audio, rumi & terjemahan di IlmuAlam.com`;
        
        if (navigator.share) {
            navigator.share({ title: 'Surah Al-Jinn', text, url }).catch(() => {});
        } else {
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
    
    // Retry
    function retry() {
        const container = document.querySelector('.ilm-x-verses-container');
        container.innerHTML = '<div class="ilm-x-loading">⏳ Memuatkan ayat-ayat...</div>';
        fetchVerses();
    }
    
    // Expose public methods
    window.ilmJinnReader = {
        togglePlay,
        prevVerse,
        nextVerse,
        playVerse,
        toggleBookmark,
        showBookmarks,
        toggleSearch,
        copyVerse,
        share,
        retry
    };
    
    // Auto-init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
